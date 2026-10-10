import { createServerFn } from "@tanstack/react-start";
import {
  connectToDatabase,
  ProductModel,
  CategoryModel,
  OrderModel,
  ContactMessageModel,
  CustomerModel,
  StaffUserModel,
  IProduct,
  ICategory,
  IOrder,
  IContactMessage,
  ICustomer,
  StaffRole,
  ROLE_PERMISSIONS,
} from "./db";

/* ===========================================================
   POINTS RULE:
   - 10 points per 100 EGP spent (rounded)
   - 50 bonus points for FIRST order
   TIER UPGRADE:
   - برونزي  : 0–499 pts
   - فضي     : 500–1999 pts
   - ذهبي    : 2000–4999 pts
   - بلاتيني : 5000+ pts
=========================================================== */
function calcPointsForOrder(total: number): number {
  return Math.floor(total / 100) * 10;
}
function calcTier(points: number): ICustomer["tier"] {
  if (points >= 5000) return "بلاتيني";
  if (points >= 2000) return "ذهبي";
  if (points >= 500)  return "فضي";
  return "برونزي";
}

/* In-memory server cache to eliminate latency across MongoDB Atlas */
let cachedProducts: { data: IProduct[]; expiresAt: number } | null = null;
let cachedCategories: { data: string[]; expiresAt: number } | null = null;

export function invalidateProductsCache() {
  cachedProducts = null;
}

export function invalidateCategoriesCache() {
  cachedCategories = null;
}

/**
 * 1. Fetch all products from MongoDB (Cached 60s for instant response)
 */
export const getProductsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: IProduct[]; error?: string }> => {
    try {
      if (cachedProducts && Date.now() < cachedProducts.expiresAt) {
        return { success: true, data: cachedProducts.data };
      }

      await connectToDatabase();
      const docs = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
      const data = docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        price: doc.price,
        originalPrice: doc.originalPrice || "",
        discount: doc.discount || "",
        image: doc.image,
        video: doc.video || "",
        description: doc.description,
        badge: doc.badge || "",
        isAvailable: doc.isAvailable !== false,
      }));
      cachedProducts = { data, expiresAt: Date.now() + 60_000 };
      return { success: true, data };
    } catch (err: any) {
      console.error("[getProductsServerFn] Error:", err);
      return { success: false, data: [], error: err.message || "Failed to fetch from MongoDB" };
    }
  },
);

/**
 * 2. Save or Add a Product to MongoDB
 */
export const saveProductServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: IProduct) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      await ProductModel.findOneAndUpdate({ id: data.id }, data, {
        upsert: true,
        returnDocument: "after",
      });
      invalidateProductsCache();
      return { success: true };
    } catch (err: any) {
      console.error("[saveProductServerFn] Error:", err);
      return { success: false, error: err.message || "Failed to save product to MongoDB" };
    }
  });

/**
 * 3. Delete a Product from MongoDB
 */
export const deleteProductServerFn = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      await ProductModel.deleteOne({ id });
      invalidateProductsCache();
      return { success: true };
    } catch (err: any) {
      console.error("[deleteProductServerFn] Error:", err);
      return { success: false, error: err.message || "Failed to delete from MongoDB" };
    }
  });

/**
 * 4. Create a Customer Order in MongoDB
 */
export const createOrderServerFn = createServerFn({ method: "POST" })
  .inputValidator((order: IOrder) => order)
  .handler(async ({ data }): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      await connectToDatabase();
      const newOrder = await OrderModel.create(data);
      return { success: true, orderId: newOrder._id.toString() };
    } catch (err: any) {
      console.error("[createOrderServerFn] Error:", err);
      return { success: false, error: err.message || "Failed to save order to MongoDB" };
    }
  });

/**
 * 4b. Create and Submit a Customer Order
 * Saves to MongoDB Atlas, formats the WhatsApp notification, and prepares secure dispatch
 */
export const submitCustomerOrderServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (order: {
      fullName: string;
      phone: string;
      backupPhone?: string;
      governorate: string;
      city?: string;
      detailedAddress: string;
      notes?: string;
      items: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
        image?: string;
      }>;
      total: number;
    }) => order,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      orderId?: string;
      whatsappUrl?: string;
      pointsEarned?: number;
      totalPoints?: number;
      customerTier?: string;
      error?: string;
    }> => {
      try {
        await connectToDatabase();

        const [firstName, ...restName] = (data.fullName || "").trim().split(" ");
        const lastName = restName.join(" ") || firstName;

        const newOrder = await OrderModel.create({
          fullName: data.fullName.trim(),
          firstName,
          lastName,
          phone: data.phone.trim(),
          backupPhone: data.backupPhone ? data.backupPhone.trim() : undefined,
          governorate: data.governorate,
          city: data.city || data.governorate,
          address: data.detailedAddress.trim(),
          detailedAddress: data.detailedAddress.trim(),
          notes: data.notes?.trim() || undefined,
          items: data.items,
          total: data.total,
          status: "جديد",
        });

        const orderId = newOrder._id.toString();
        const shortOrderId = orderId.slice(-6).toUpperCase();

        /* ======================================================
           LOYALTY POINTS — Upsert Customer Record
        ====================================================== */
        const phone = data.phone.trim().replace(/\s+/g, "");
        const earnedPoints = calcPointsForOrder(data.total);

        // Find existing customer to check if it's first order
        const existing = await CustomerModel.findOne({ phone });
        const isFirstOrder = !existing;
        const bonusPoints = isFirstOrder ? 50 : 0;
        const pointsDelta = earnedPoints + bonusPoints;

        const updatedCustomer = await CustomerModel.findOneAndUpdate(
          { phone },
          {
            $set: {
              name: data.fullName.trim(),
              governorate: data.governorate,
              ...(data.backupPhone ? { backupPhone: data.backupPhone.trim() } : {}),
            },
            $inc: {
              totalOrders: 1,
              totalSpent: data.total,
              points: pointsDelta,
            },
            $push: { orderIds: orderId },
          },
          { upsert: true, new: true },
        );

        // Upgrade tier based on total points
        const newTier = calcTier(updatedCustomer.points);
        if (updatedCustomer.tier !== newTier) {
          await CustomerModel.updateOne({ phone }, { $set: { tier: newTier } });
          updatedCustomer.tier = newTier;
        }

        // Admin WhatsApp phone (kept confidential on the server)
        const adminWhatsapp = (process.env.ADMIN_WHATSAPP || "201000000000").replace(/[^0-9]/g, "");

        // Build elegant Arabic receipt
        const itemsList = data.items
          .map(
            (it, i) =>
              `${i + 1}. *${it.name}* (الكمية: ${it.quantity}) — ${it.price}`,
          )
          .join("\n");

        const pointsLine = `⭐ نقاط مكتسبة: +${pointsDelta} نقطة (الرصيد: ${updatedCustomer.points})${isFirstOrder ? " 🎁 تشمل 50 نقطة ترحيبية!" : ""}`;

        const messageLines = [
          `🌸 *طلب شراء جديد — كاريشما* 🌸`,
          `وكيلة معتمدة: نسرين الطنطاوي`,
          `رقم الطلب: *#${shortOrderId}*`,
          `----------------------------------`,
          `👤 *بيانات العميل:*`,
          `• الاسم: ${data.fullName}`,
          `• رقم الهاتف: ${data.phone}`,
          data.backupPhone ? `• هاتف بديل: ${data.backupPhone}` : null,
          `• المحافظة: ${data.governorate}`,
          `• العنوان بالتفصيل: ${data.detailedAddress}`,
          data.notes ? `• ملاحظات: ${data.notes}` : null,
          `📊 عدد طلباته: ${updatedCustomer.totalOrders} | فئته: ${updatedCustomer.tier}`,
          `----------------------------------`,
          `🛍️ *المنتجات المطلوبة:*`,
          itemsList,
          `----------------------------------`,
          `💰 *إجمالي الحساب:* *${data.total} ج.م* (الدفع عند الاستلام)`,
          pointsLine,
          `⏰ التوقيت: ${new Date().toLocaleTimeString("ar-EG")}`,
          `----------------------------------`,
        ]
          .filter(Boolean)
          .join("\n");

        // Construct server-generated WhatsApp URL
        const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(messageLines)}`;

        // Optional automated server-side webhook/API if configured
        const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPhone: adminWhatsapp,
              message: messageLines,
              orderId,
            }),
          }).catch((e) => console.warn("WhatsApp Webhook notice:", e));
        }

        return {
          success: true,
          orderId,
          whatsappUrl,
          pointsEarned: pointsDelta,
          totalPoints: updatedCustomer.points,
          customerTier: updatedCustomer.tier,
        };
      } catch (err: any) {
        console.error("[submitCustomerOrderServerFn] Error:", err);
        return { success: false, error: err.message || "فشل تسجيل الطلب" };
      }
    },
  );

/**
 * 4c. Get All Customers (Admin)
 */
export const getCustomersServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: any[]; error?: string }> => {
    try {
      await connectToDatabase();
      const customers = await CustomerModel.find({}).sort({ points: -1, createdAt: -1 }).lean();
      return {
        success: true,
        data: customers.map((c: any) => ({
          id: c._id.toString(),
          phone: c.phone,
          name: c.name,
          backupPhone: c.backupPhone || "",
          governorate: c.governorate || "",
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0,
          points: c.points || 0,
          tier: c.tier || "برونزي",
          orderIds: c.orderIds || [],
          notes: c.notes || "",
          isBlocked: c.isBlocked || false,
          createdAt: c.createdAt?.toISOString() || "",
        })),
      };
    } catch (err: any) {
      console.error("[getCustomersServerFn] Error:", err);
      return { success: false, data: [], error: err.message };
    }
  },
);

/**
 * 4d. Update Customer Points or Notes (Admin)
 */
export const updateCustomerServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; points?: number; notes?: string; isBlocked?: boolean }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      const updateFields: any = {};
      if (data.points !== undefined) {
        updateFields.points = data.points;
        updateFields.tier = calcTier(data.points);
      }
      if (data.notes !== undefined) updateFields.notes = data.notes;
      if (data.isBlocked !== undefined) updateFields.isBlocked = data.isBlocked;
      await CustomerModel.updateOne({ phone: data.phone }, { $set: updateFields });
      return { success: true };
    } catch (err: any) {
      console.error("[updateCustomerServerFn] Error:", err);
      return { success: false, error: err.message };
    }
  });

/**
 * 4e. Get Customer By Phone (public — for customer self-lookup)
 */
export const getCustomerByPhoneServerFn = createServerFn({ method: "POST" })
  .inputValidator((phone: string) => phone)
  .handler(
    async ({ data: phone }): Promise<{ success: boolean; data?: any; error?: string }> => {
      try {
        await connectToDatabase();
        const c = await CustomerModel.findOne({ phone: phone.trim() }).lean() as any;
        if (!c) return { success: false, error: "لا يوجد حساب بهذا الرقم" };
        return {
          success: true,
          data: {
            name: c.name,
            phone: c.phone,
            points: c.points || 0,
            tier: c.tier || "برونزي",
            totalOrders: c.totalOrders || 0,
            totalSpent: c.totalSpent || 0,
          },
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

/**
 * 5. Fetch Orders for Admin
 */
export const getOrdersServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: any[]; error?: string }> => {
    try {
      await connectToDatabase();
      const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
      return {
        success: true,
        data: orders.map((o: any) => ({
          ...o,
          _id: o._id.toString(),
        })),
      };
    } catch (err: any) {
      console.error("[getOrdersServerFn] Error:", err);
      return { success: false, data: [], error: err.message || "Failed to fetch orders" };
    }
  },
);

/**
 * 6. Save a Contact Message in MongoDB
 */
export const saveContactMessageServerFn = createServerFn({ method: "POST" })
  .inputValidator((msg: IContactMessage) => msg)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      await ContactMessageModel.create(data);
      return { success: true };
    } catch (err: any) {
      console.error("[saveContactMessageServerFn] Error:", err);
      return { success: false, error: err.message || "Failed to save message to MongoDB" };
    }
  });

/**
 * 6b. Get Contact Messages for Admin
 */
export const getContactMessagesServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: any[]; error?: string }> => {
    try {
      await connectToDatabase();
      const docs = await ContactMessageModel.find({}).sort({ createdAt: -1 }).lean();
      return {
        success: true,
        data: docs.map((d: any) => ({
          ...d,
          _id: d._id.toString(),
        })),
      };
    } catch (err: any) {
      console.error("[getContactMessagesServerFn] Error:", err);
      return { success: false, data: [], error: err.message || "Failed to fetch contact messages" };
    }
  },
);

/**
 * 7. Test Database Health
 */
export const checkDbHealthServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    connected: boolean;
    productCount: number;
    orderCount: number;
    dbName: string;
  }> => {
    try {
      const conn = await connectToDatabase();
      const productCount = await ProductModel.countDocuments();
      const orderCount = await OrderModel.countDocuments();
      return {
        connected: conn.connection.readyState === 1,
        productCount,
        orderCount,
        dbName: conn.connection.name || "karisma",
      };
    } catch (err) {
      return {
        connected: false,
        productCount: 0,
        orderCount: 0,
        dbName: "error",
      };
    }
  },
);

const DEFAULT_CATEGORIES = [
  "مكياج",
  "عناية بالبشرة",
  "عناية بالشعر",
  "عطور",
  "مستحضرات تجميل",
  "عروض وخصومات",
];

/**
 * 8. Get Categories (Cached 60s for instant response)
 */
export const getCategoriesServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: string[]; error?: string }> => {
    try {
      if (cachedCategories && Date.now() < cachedCategories.expiresAt) {
        return { success: true, data: cachedCategories.data };
      }

      await connectToDatabase();
      const count = await CategoryModel.countDocuments();
      if (count === 0) {
        // Seed default categories
        for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
          await CategoryModel.create({ name: DEFAULT_CATEGORIES[i], order: i });
        }
      }
      const docs = await CategoryModel.find({}).sort({ order: 1, createdAt: 1 }).lean();
      const names = docs.map((d: any) => d.name);
      const resCategories = ["الكل", ...names];
      cachedCategories = { data: resCategories, expiresAt: Date.now() + 60_000 };
      return { success: true, data: resCategories };
    } catch (err: any) {
      console.error("[getCategoriesServerFn] Error:", err);
      return { success: false, data: ["الكل", ...DEFAULT_CATEGORIES], error: err.message };
    }
  },
);

/**
 * 9. Add Category
 */
export const addCategoryServerFn = createServerFn({ method: "POST" })
  .inputValidator((name: string) => name)
  .handler(async ({ data: name }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      const trimmed = name.trim();
      if (!trimmed) return { success: false, error: "اسم القسم مطلوب" };
      await CategoryModel.findOneAndUpdate(
        { name: trimmed },
        { name: trimmed },
        { upsert: true, returnDocument: "after" },
      );
      invalidateCategoriesCache();
      return { success: true };
    } catch (err: any) {
      console.error("[addCategoryServerFn] Error:", err);
      return { success: false, error: err.message || "فشل إضافة القسم" };
    }
  });

/**
 * 10. Update/Rename Category
 */
export const updateCategoryServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { oldName: string; newName: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      const { oldName, newName } = data;
      const trimmedNew = newName.trim();
      if (!trimmedNew) return { success: false, error: "الاسم الجديد مطلوب" };

      // Update in Category collection
      await CategoryModel.updateOne({ name: oldName }, { name: trimmedNew });

      // Update all products belonging to the old category name
      await ProductModel.updateMany({ category: oldName }, { category: trimmedNew });

      invalidateCategoriesCache();
      invalidateProductsCache();
      return { success: true };
    } catch (err: any) {
      console.error("[updateCategoryServerFn] Error:", err);
      return { success: false, error: err.message || "فشل تعديل القسم" };
    }
  });

/**
 * 11. Delete Category
 */
export const deleteCategoryServerFn = createServerFn({ method: "POST" })
  .inputValidator((name: string) => name)
  .handler(async ({ data: name }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      await CategoryModel.deleteOne({ name });

      // Move products in deleted category to "مستحضرات تجميل"
      await ProductModel.updateMany({ category: name }, { category: "مستحضرات تجميل" });

      invalidateCategoriesCache();
      invalidateProductsCache();
      return { success: true };
    } catch (err: any) {
      console.error("[deleteCategoryServerFn] Error:", err);
      return { success: false, error: err.message || "فشل حذف القسم" };
    }
  });

/**
 * 12. Upload Image File (supports all formats: PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, etc.)
 */
export const uploadImageServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { base64Data: string; filename: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; url: string; error?: string }> => {
    try {
      const { base64Data, filename } = data;
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(filename) || ".webp";
      const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueName = `img_${Date.now()}_${base}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);

      const base64Content = base64Data.includes(";base64,")
        ? base64Data.split(";base64,").pop()!
        : base64Data;

      const buffer = Buffer.from(base64Content, "base64");
      await fs.writeFile(filePath, buffer);

      return { success: true, url: `/uploads/${uniqueName}` };
    } catch (err: any) {
      console.warn("[uploadImageServerFn] Fallback to data URL:", err?.message);
      return { success: true, url: data.base64Data };
    }
  });

/**
 * 13. Upload Video File (supports MP4, WebM, MOV, etc. up to 25MB)
 */
export const uploadVideoServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { base64Data: string; filename: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; url: string; error?: string }> => {
    try {
      const { base64Data, filename } = data;
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      const videosDir = path.join(process.cwd(), "public", "uploads", "videos");
      await fs.mkdir(videosDir, { recursive: true });

      const ext = path.extname(filename) || ".mp4";
      const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueName = `vid_${Date.now()}_${base}${ext}`;
      const filePath = path.join(videosDir, uniqueName);

      const base64Content = base64Data.includes(";base64,")
        ? base64Data.split(";base64,").pop()!
        : base64Data;

      const buffer = Buffer.from(base64Content, "base64");
      await fs.writeFile(filePath, buffer);

      return { success: true, url: `/uploads/videos/${uniqueName}` };
    } catch (err: any) {
      console.warn("[uploadVideoServerFn] Error saving video:", err?.message);
      return { success: true, url: data.base64Data };
    }
  });


/* =====================================================================
   STAFF / ROLES SYSTEM
===================================================================== */

/** Simple hash using SHA-256 (no native bcrypt in edge env) */
async function hashPassword(plain: string): Promise<string> {
  // Use node:crypto for hashing — fast and serverless-safe
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(plain + "karisma_salt_2026").digest("hex");
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(plain);
  return hashed === hash;
}

/**
 * S1. Staff Login — verifies credentials, returns stored permissions
 */
export const staffLoginServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(
    async ({ data }): Promise<{ success: boolean; user?: { username: string; displayName: string; role: StaffRole; permissions: string[] }; error?: string }> => {
      try {
        await connectToDatabase();
        const username = data.username.trim().toLowerCase();

        // Fallback: built-in super-admin (from env)
        const superUser = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
        const superPass = process.env.ADMIN_PASSWORD || "admin123";
        if (username === superUser && data.password === superPass) {
          return {
            success: true,
            user: { username, displayName: "نسرين الطنطاوي", role: "admin", permissions: ROLE_PERMISSIONS.admin },
          };
        }

        // DB lookup
        const staff = await StaffUserModel.findOne({ username, isActive: true }).lean() as any;
        if (!staff) return { success: false, error: "اسم المستخدم غير موجود أو معطل" };

        const ok = await verifyPassword(data.password, staff.passwordHash);
        if (!ok) return { success: false, error: "كلمة المرور غير صحيحة" };

        await StaffUserModel.updateOne({ username }, { $set: { lastLogin: new Date() } });

        // Use stored permissions[] as source of truth
        const permissions: string[] = Array.isArray(staff.permissions) && staff.permissions.length > 0
          ? staff.permissions
          : (ROLE_PERMISSIONS[staff.role as Exclude<StaffRole, "custom">] ?? []);

        return {
          success: true,
          user: {
            username: staff.username,
            displayName: staff.displayName,
            role: staff.role as StaffRole,
            permissions,
          },
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

/**
 * S2. Get All Staff Users (admin only)
 */
export const getStaffUsersServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: any[]; error?: string }> => {
    try {
      await connectToDatabase();
      const users = await StaffUserModel.find({}).sort({ createdAt: -1 }).lean();
      return {
        success: true,
        data: users.map((u: any) => ({
          id: u._id.toString(),
          username: u.username,
          displayName: u.displayName,
          role: u.role,
          permissions: Array.isArray(u.permissions) ? u.permissions : [],
          isActive: u.isActive,
          createdBy: u.createdBy || "",
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
        })),
      };
    } catch (err: any) {
      return { success: false, data: [], error: err.message };
    }
  },
);

/**
 * S3. Create Staff User
 */
export const createStaffUserServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; displayName: string; password: string; role: StaffRole; permissions: string[]; createdBy: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      const username = data.username.trim().toLowerCase();
      const existing = await StaffUserModel.findOne({ username }).lean();
      if (existing) return { success: false, error: "اسم المستخدم موجود بالفعل" };
      if (data.password.length < 6) return { success: false, error: "كلمة السر يجب أن تكون 6 حروف على الأقل" };
      const passwordHash = await hashPassword(data.password);
      await StaffUserModel.create({
        username,
        displayName: data.displayName.trim(),
        passwordHash,
        role: data.role,
        permissions: data.permissions,
        isActive: true,
        createdBy: data.createdBy,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

/**
 * S4. Update Staff User (role, permissions, active, reset password)
 */
export const updateStaffUserServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; role?: StaffRole; permissions?: string[]; isActive?: boolean; newPassword?: string; displayName?: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      const update: any = {};
      if (data.role)        update.role        = data.role;
      if (data.displayName) update.displayName = data.displayName.trim();
      if (Array.isArray(data.permissions)) update.permissions = data.permissions;
      if (typeof data.isActive !== "undefined") update.isActive = data.isActive;
      if (data.newPassword) {
        if (data.newPassword.length < 6) return { success: false, error: "كلمة السر يجب أن تكون 6 حروف على الأقل" };
        update.passwordHash = await hashPassword(data.newPassword);
      }
      await StaffUserModel.updateOne({ username: data.username }, { $set: update });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

/**
 * S5. Delete Staff User
 */
export const deleteStaffUserServerFn = createServerFn({ method: "POST" })
  .inputValidator((username: string) => username)
  .handler(async ({ data: username }): Promise<{ success: boolean; error?: string }> => {
    try {
      await connectToDatabase();
      await StaffUserModel.deleteOne({ username });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
