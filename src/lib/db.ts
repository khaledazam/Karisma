import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// Ensure .env is read if running in Node environment
if (typeof process !== "undefined" && process.env && !process.env.MONGODB_URI) {
  try {
    // Dynamic import to avoid client bundle issues
    import("dotenv").then((dotenv) => dotenv.config()).catch(() => {});
  } catch {}
}

const DEFAULT_URI =
  "mongodb+srv://khaled141ma_db_user:SZcvQBHq32mFS9wd@cluster0.ccctrec.mongodb.net/karisma?retryWrites=true&w=majority&appName=Cluster0";

// Interface for Product Document
export interface IProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  video?: string;
  description: string;
  badge?: string;
  isAvailable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Category Document
export interface ICategory {
  name: string;
  order?: number;
}

// Interface for Order Document
export interface IOrder {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  backupPhone?: string;
  governorate: string;
  city?: string;
  address: string;
  detailedAddress?: string;
  notes?: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    image?: string;
  }>;
  total: number;
  status: "جديد" | "قيد التجهيز" | "تم الشحن" | "تم التسليم" | "ملغي";
  createdAt?: Date;
}

// Interface for Contact Message Document
export interface IContactMessage {
  id?: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  createdAt?: Date;
}

// Interface for Customer (Loyalty Points System)
export interface ICustomer {
  phone: string;
  name: string;
  backupPhone?: string;
  governorate?: string;
  totalOrders: number;
  totalSpent: number;
  points: number;
  tier: "برونزي" | "فضي" | "ذهبي" | "بلاتيني";
  orderIds: string[];
  notes?: string;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// All available permission tabs
export const ALL_PERMISSIONS = [
  { key: "products",   label: "المنتجات" },
  { key: "categories", label: "الفئات" },
  { key: "orders",     label: "الطلبات" },
  { key: "analytics", label: "التحليلات" },
  { key: "messages",  label: "الرسائل" },
  { key: "customers", label: "العملاء" },
  { key: "staff",     label: "الموظفون" },
] as const;

export type PermissionKey = typeof ALL_PERMISSIONS[number]["key"];

// Roles: admin = full, employee = orders+customers, viewer = read-only
export type StaffRole = "admin" | "employee" | "viewer" | "custom";

export const ROLE_PERMISSIONS: Record<Exclude<StaffRole, "custom">, string[]> = {
  admin:    ["products", "categories", "orders", "analytics", "messages", "customers", "staff"],
  employee: ["orders", "customers"],
  viewer:   ["products", "orders"],
};

export interface IStaffUser {
  username: string;         // Unique login username
  displayName: string;      // Arabic display name
  passwordHash: string;     // SHA-256 hash
  role: StaffRole;          // Label role (admin/employee/viewer/custom)
  permissions: string[];    // Exact list of allowed tabs — source of truth
  isActive: boolean;
  createdBy?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ===================================================================
   Schemas
=================================================================== */

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    price: { type: String, required: true },
    originalPrice: { type: String },
    discount: { type: String },
    image: { type: String, required: true },
    video: { type: String },
    description: { type: String, required: true },
    badge: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const OrderSchema = new Schema<IOrder>(
  {
    fullName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String, required: true, index: true },
    backupPhone: { type: String },
    governorate: { type: String, required: true },
    city: { type: String },
    address: { type: String, required: true },
    detailedAddress: { type: String },
    notes: { type: String },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      default: "جديد",
      enum: ["جديد", "قيد التجهيز", "تم الشحن", "تم التسليم", "ملغي"],
    },
  },
  { timestamps: true },
);

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

const CustomerSchema = new Schema<ICustomer>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    backupPhone: { type: String },
    governorate: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    tier: {
      type: String,
      default: "برونزي",
      enum: ["برونزي", "فضي", "ذهبي", "بلاتيني"],
    },
    orderIds: [{ type: String }],
    notes: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const StaffUserSchema = new Schema<IStaffUser>(
  {
    username:     { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    displayName:  { type: String, required: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, required: true, enum: ["admin", "employee", "viewer", "custom"], default: "employee" },
    permissions:  { type: [String], default: [] },
    isActive:     { type: Boolean, default: true },
    createdBy:    { type: String },
    lastLogin:    { type: Date },
  },
  { timestamps: true },
);

// Models singleton
export const ProductModel = models.Product || model<IProduct>("Product", ProductSchema);
export const CategoryModel = models.Category || model<ICategory>("Category", CategorySchema);
export const OrderModel = models.Order || model<IOrder>("Order", OrderSchema);
export const ContactMessageModel =
  models.ContactMessage || model<IContactMessage>("ContactMessage", ContactMessageSchema);
export const CustomerModel = models.Customer || model<ICustomer>("Customer", CustomerSchema);
export const StaffUserModel = models.StaffUser || model<IStaffUser>("StaffUser", StaffUserSchema);

/* ===================================================================
   Connection Manager
=================================================================== */

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  const uri =
    (typeof process !== "undefined" &&
      (process.env?.MONGODB_URI || process.env?.DATABASE_URL || (process.env as any)?.VITE_MONGODB_URI)) ||
    DEFAULT_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log("✅ [MongoDB] Connected successfully to Karisma database:", uri.replace(/:([^:@]+)@/, ":****@"));
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ [MongoDB] Connection error:", e);
    throw e;
  }

  return cached.conn;
}

/**
 * Seed initial Karisma catalog if collection is empty
 */
export async function seedProductsIfEmpty(initialProducts: any[]) {
  try {
    await connectToDatabase();
    const count = await ProductModel.countDocuments();
    if (count === 0 && initialProducts && initialProducts.length > 0) {
      console.log("🌱 [MongoDB] Seeding Karisma catalog into MongoDB...");
      await ProductModel.insertMany(initialProducts);
      console.log(`✅ [MongoDB] Inserted ${initialProducts.length} initial products successfully!`);
    }
  } catch (err) {
    console.warn("⚠️ [MongoDB] Seeding check skipped/failed:", err);
  }
}
