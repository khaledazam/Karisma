import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { Product, BundleItem } from "@/lib/products";
import { NesrinLogo } from "@/components/NesrinLogo";
import { getCartAnalytics, CartAnalytics } from "@/hooks/use-cart";
import {
  getOrdersServerFn,
  getContactMessagesServerFn,
  checkDbHealthServerFn,
  uploadImageServerFn,
  uploadVideoServerFn,
  getCustomersServerFn,
  updateCustomerServerFn,
  getStaffUsersServerFn,
  createStaffUserServerFn,
  updateStaffUserServerFn,
  deleteStaffUserServerFn,
} from "@/lib/server-actions";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Tag,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  UserCheck,
  Database,
  Inbox,
  Mail,
  RefreshCw,
  Clock,
  MapPin,
  Phone,
  User,
  CheckSquare,
  Square,
  Percent,
  TrendingUp,
  BarChart3,
  Layers,
  DollarSign,
  Flame,
  SlidersHorizontal,
  AlertCircle,
  ShoppingCart,
  Check,
  X,
  FolderPlus,
  FolderEdit,
  UploadCloud,
  Upload,
  Loader2,
  Film,
  Video,
  Play,
  Smartphone,
  Download,
  Share2,
  Package,
  Gift,
  Users,
} from "lucide-react";


// Quick beauty photo presets to make adding items effortless
const QUICK_IMAGES = [
  { label: "أحمر شفاه", url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80" },
  { label: "سيروم بشرة", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80" },
  { label: "كريم ترطيب", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80" },
  { label: "عطر فاخر", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80" },
  { label: "زيت شعر", url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1200&q=80" },
  { label: "ظلال عيون", url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80" },
  { label: "فرش مكياج", url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80" },
  { label: "بلاشر وردي", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80" },
];

// Helper to compress and convert any image file format before upload
async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<{ base64Data: string; filename: string }> {
  const filename = file.name || `image_${Date.now()}.webp`;

  // For SVGs or GIFs, preserve original vector / frames without canvas conversion
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          base64Data: reader.result as string,
          filename,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // For other formats (jpeg, png, webp, avif, heic, bmp, tiff, etc.), compress via Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ base64Data: e.target?.result as string, filename });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP for maximum compression and modern web performance
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          const cleanName = filename.replace(/\.[^/.]+$/, "") + ".webp";
          resolve({ base64Data: webpData, filename: cleanName });
        } catch {
          // Fallback to jpeg
          const jpegData = canvas.toDataURL("image/jpeg", quality);
          const cleanName = filename.replace(/\.[^/.]+$/, "") + ".jpg";
          resolve({ base64Data: jpegData, filename: cleanName });
        }
      };
      img.onerror = () => {
        // Fallback to raw dataURL if image object fails to decode directly
        resolve({ base64Data: e.target?.result as string, filename });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AdminPage() {
  const { isAdmin, login, logout } = useAuth();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    applyDiscountToProducts,
    removeDiscountFromProducts,
    bulkDeleteProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  } = useProducts();

  // Active view tab
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders" | "analytics" | "messages" | "customers" | "staff">("products");

  // Multi-select for Bulk Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false);
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(20);

  // Quick Price / Discount Edit Modal for single product
  const [quickPriceModal, setQuickPriceModal] = useState<{
    open: boolean;
    product: Product | null;
    newPrice: string;
    originalPrice: string;
    discountPercent: number;
    badge: string;
  }>({
    open: false,
    product: null,
    newPrice: "",
    originalPrice: "",
    discountPercent: 0,
    badge: "",
  });

  // Category Management Modals State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [editCatModal, setEditCatModal] = useState<{
    open: boolean;
    oldName: string;
    newName: string;
  }>({
    open: false,
    oldName: "",
    newName: "",
  });

  const [catDiscountModal, setCatDiscountModal] = useState<{
    open: boolean;
    catName: string;
    percent: number;
  }>({
    open: false,
    catName: "",
    percent: 20,
  });

  // MongoDB status & data
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    productCount: number;
    orderCount: number;
    dbName: string;
  }>({
    connected: true,
    productCount: 21,
    orderCount: 0,
    dbName: "karisma",
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [editPointsModal, setEditPointsModal] = useState<{ open: boolean; customer: any | null; pts: number }>({
    open: false, customer: null, pts: 0,
  });

  // Staff management state
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffModal, setStaffModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    username: string;
    displayName: string;
    password: string;
    role: "admin" | "employee" | "viewer" | "custom";
    permissions: string[];
    isActive: boolean;
    error: string;
    loading: boolean;
  }>({
    open: false, mode: "create", username: "", displayName: "", password: "",
    role: "employee", permissions: ["orders", "customers"], isActive: true, error: "", loading: false,
  });
  const [cartAnalytics, setCartAnalytics] = useState<CartAnalytics>({
    totalAdds: 0,
    productAdds: {},
  });

  // Login form state (if not logged in)
  const [loginUser, setLoginUser] = useState("admin");
  const [loginPass, setLoginPass] = useState("admin123");
  const [loginError, setLoginError] = useState(false);

  // Search & filter in admin
  const [adminSearch, setAdminSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");

  // Modal State for Full Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load live DB data and cart analytics
  const loadDbData = async () => {
    try {
      const health = await checkDbHealthServerFn().catch(() => null);
      if (health && typeof health.connected === "boolean") {
        setDbStatus(health);
      }

      const ordRes = await getOrdersServerFn().catch(() => null);
      if (ordRes?.success && Array.isArray(ordRes.data)) {
        setOrders(ordRes.data);
      }

      const msgRes = await getContactMessagesServerFn().catch(() => null);
      if (msgRes?.success && Array.isArray(msgRes.data)) {
        setMessages(msgRes.data);
      }

      const custRes = await getCustomersServerFn().catch(() => null);
      if (custRes?.success && Array.isArray(custRes.data)) {
        setCustomers(custRes.data);
      }

      const staffRes = await getStaffUsersServerFn().catch(() => null);
      if (staffRes?.success && Array.isArray(staffRes.data)) {
        setStaffUsers(staffRes.data);
      }
    } catch (e) {
      console.warn("Notice loading DB data:", e);
    }

    // Refresh cart analytics from local storage
    setCartAnalytics(getCartAnalytics());
  };

  useEffect(() => {
    if (isAdmin) {
      loadDbData();
    }
  }, [isAdmin]);

  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsAppInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showToast("تم تثبيت تطبيق كاريشما بنجاح على جهازك!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showToast("جاري تثبيت تطبيق كاريشما على جهازك...");
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "لتثبيت تطبيق لوحة التحكم على جهازك:\n\n📱 على iPhone (Safari):\nاضغطي على زر المشاركة (Share) أسفل الشاشة، ثم اختاري 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen).\n\n💻 على الكمبيوتر / Android (Chrome/Edge):\nاضغطي على علامة التثبيت (Install App) في شريط العنوان بالأعلى أو القائمة الجانبية للمتصفح."
      );
    }
  };

  // Product Form Data
  const initialFormData: Omit<Product, "id"> = {
    name: "",
    category: categories.find((c) => c !== "الكل") || "مكياج",
    price: "",
    originalPrice: "",
    discount: "",
    image: QUICK_IMAGES[0].url,
    video: "",
    description: "",
    badge: "جديد",
    isBundle: false,
    bundleItems: [],
  };
  const [formData, setFormData] = useState<Omit<Product, "id">>(initialFormData);
  const [bundleSearch, setBundleSearch] = useState("");

  // Products available to be selected inside a bundle (exclude self if editing, and exclude other bundles)
  const availableProductsForBundle = useMemo(() => {
    return products.filter((p) => p.id !== editingId && !p.isBundle);
  }, [products, editingId]);

  // Filtered available products based on search term
  const filteredBundleCandidates = useMemo(() => {
    if (!bundleSearch.trim()) return availableProductsForBundle;
    const q = bundleSearch.trim().toLowerCase();
    return availableProductsForBundle.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [availableProductsForBundle, bundleSearch]);

  // Toggle bundle item selection
  const handleToggleBundleItem = (prod: Product) => {
    setFormData((prev) => {
      const currentItems = prev.bundleItems || [];
      const exists = currentItems.some((item) => item.id === prod.id);
      let updatedItems: BundleItem[];
      if (exists) {
        updatedItems = currentItems.filter((item) => item.id !== prod.id);
      } else {
        updatedItems = [
          ...currentItems,
          {
            id: prod.id,
            name: prod.name,
            image: prod.image,
            price: prod.price,
            quantity: 1,
          },
        ];
      }
      return {
        ...prev,
        bundleItems: updatedItems,
      };
    });
  };

  // Calculate sum of individual items in the bundle
  const bundleSum = useMemo(() => {
    if (!formData.bundleItems || formData.bundleItems.length === 0) return 0;
    return formData.bundleItems.reduce((acc, it) => {
      const num = parseFloat(it.price?.replace(/[^0-9.]/g, "") || "0");
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [formData.bundleItems]);

  // Image Upload State (supports all image formats: PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, etc.)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url" | "preset">("file");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Video Upload State (supports MP4, WebM, MOV up to 25MB)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgressMsg, setVideoProgressMsg] = useState("");
  const [videoUploadMode, setVideoUploadMode] = useState<"file" | "url">("file");
  const [isVideoDragOver, setIsVideoDragOver] = useState(false);

  // File Upload Handler with canvas compression and server persistence
  const handleImageFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingImage(true);
      setUploadProgressMsg("جاري معالجة وضغط الصورة...");
      const { base64Data, filename } = await compressImageFile(file);

      setUploadProgressMsg("جاري حفظ الصورة على السيرفر...");
      const res = await uploadImageServerFn({
        data: {
          base64Data,
          filename,
        },
      });

      if (res?.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        showToast("تم رفع وحفظ صورة المنتج بنجاح!");
      } else {
        // Fallback: use dataURL directly
        setFormData((prev) => ({ ...prev, image: base64Data }));
        showToast("تم اعتماد الصورة بنجاح!");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      showToast("تعذر رفع الصورة، يرجى المحاولة مرة أخرى");
    } finally {
      setIsUploadingImage(false);
      setUploadProgressMsg("");
    }
  };

  // Video Upload Handler with server persistence
  const handleVideoFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 26 * 1024 * 1024) {
      alert("حجم ملف الفيديو أكبر من 25 ميجابايت. يُرجى اختيار مقطع فيديو قصير (15-30 ثانية) للحفاظ على سرعة المتجر.");
      return;
    }
    try {
      setIsUploadingVideo(true);
      setVideoProgressMsg("جاري معالجة ورفع مقطع الفيديو...");
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await uploadVideoServerFn({
          data: {
            base64Data,
            filename: file.name,
          },
        });

        if (res?.success && res.url) {
          setFormData((prev) => ({ ...prev, video: res.url }));
          showToast("تم رفع وحفظ فيديو المنتج بنجاح!");
        } else {
          setFormData((prev) => ({ ...prev, video: base64Data }));
          showToast("تم اعتماد الفيديو بنجاح!");
        }
        setIsUploadingVideo(false);
        setVideoProgressMsg("");
      };
      reader.onerror = () => {
        setIsUploadingVideo(false);
        showToast("تعذر قراءة ملف الفيديو");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Video upload failed:", err);
      setIsUploadingVideo(false);
      showToast("تعذر رفع الفيديو، يرجى المحاولة مرة أخرى");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Full Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setBundleSearch("");
    setIsModalOpen(true);
  };

  // Full Edit Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || "",
      discount: product.discount || "",
      image: product.image,
      video: product.video || "",
      description: product.description,
      badge: product.badge || "",
      isBundle: Boolean(product.isBundle),
      bundleItems: product.bundleItems || [],
    });
    setBundleSearch("");
    setIsModalOpen(true);
  };

  // Save Full Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      alert("يرجى ملء اسم المنتج والسعر على الأقل");
      return;
    }

    if (formData.isBundle && (!formData.bundleItems || formData.bundleItems.length === 0)) {
      alert("لقد قمتِ بتفعيل خيار الباكدج! يرجى اختيار المنتجات المشمولة في هذا الباكدج أولاً (منتج واحد على الأقل).");
      return;
    }

    let formattedPrice = formData.price.trim();
    if (!formattedPrice.includes("ج.م")) {
      formattedPrice = `${formattedPrice} ج.م`;
    }

    let formattedOriginal = formData.originalPrice?.trim() || undefined;
    if (formattedOriginal && !formattedOriginal.includes("ج.م")) {
      formattedOriginal = `${formattedOriginal} ج.م`;
    }

    const payload = {
      ...formData,
      price: formattedPrice,
      originalPrice: formattedOriginal,
      discount: formData.discount?.trim() || undefined,
      badge: formData.badge?.trim() || undefined,
      isBundle: Boolean(formData.isBundle),
      bundleItems: formData.isBundle ? (formData.bundleItems || []) : [],
    };

    if (editingId) {
      await updateProduct(editingId, payload);
      showToast("تم تحديث المنتج وحفظه في MongoDB!");
    } else {
      await addProduct(payload);
      showToast("تمت إضافة المنتج الجديد وحفظه في MongoDB!");
    }

    setIsModalOpen(false);
  };

  // Quick Price / Discount Modal Trigger
  const handleOpenQuickPriceModal = (product: Product) => {
    const rawPrice = product.price.replace(/[^0-9.]/g, "");
    const rawOrig = product.originalPrice ? product.originalPrice.replace(/[^0-9.]/g, "") : rawPrice;

    let existingPercent = 0;
    if (product.discount) {
      const match = product.discount.match(/([0-9]+)%/);
      if (match) existingPercent = parseInt(match[1], 10);
    }

    setQuickPriceModal({
      open: true,
      product,
      newPrice: rawPrice,
      originalPrice: rawOrig,
      discountPercent: existingPercent,
      badge: product.badge || "",
    });
  };

  // Save Quick Price / Discount
  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceModal.product) return;

    const baseNum = parseFloat(quickPriceModal.originalPrice) || parseFloat(quickPriceModal.newPrice) || 0;
    const currentNum = parseFloat(quickPriceModal.newPrice) || baseNum;

    let discountStr: string | undefined = undefined;
    let badgeStr: string | undefined = quickPriceModal.badge.trim() || undefined;

    if (quickPriceModal.discountPercent > 0) {
      discountStr = `خصم ${quickPriceModal.discountPercent}%`;
      if (!badgeStr || badgeStr.includes("خصم")) {
        badgeStr = `خصم ${quickPriceModal.discountPercent}%`;
      }
    }

    await updateProduct(quickPriceModal.product.id, {
      price: `${currentNum} ج.م`,
      originalPrice: quickPriceModal.discountPercent > 0 ? `${baseNum} ج.م` : undefined,
      discount: discountStr,
      badge: badgeStr,
    });

    setQuickPriceModal({ open: false, product: null, newPrice: "", originalPrice: "", discountPercent: 0, badge: "" });
    showToast(`تم تعديل سعر "${quickPriceModal.product.name}" بنجاح!`);
  };

  // Delete Single Product
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف المنتج "${name}" من المتجر وقاعدة البيانات؟`)) {
      await deleteProduct(id);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      showToast("تم حذف المنتج من المتجر وقاعدة البيانات.");
    }
  };

  // Bulk Discount on Selected Products
  const handleApplyBulkDiscount = async () => {
    if (selectedIds.length === 0) return;
    await applyDiscountToProducts(selectedIds, bulkDiscountPercent);
    setIsBulkDiscountModalOpen(false);
    showToast(`تم تطبيق خصم ${bulkDiscountPercent}% على ${selectedIds.length} منتج بنجاح!`);
  };

  // Bulk Remove Discount
  const handleBulkRemoveDiscount = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`هل تريدين إلغاء الخصم واستعادة الأسعار الأصلية لـ ${selectedIds.length} منتج؟`)) {
      await removeDiscountFromProducts(selectedIds);
      showToast(`تم إلغاء الخصم عن ${selectedIds.length} منتج بنجاح!`);
    }
  };

  // Bulk Delete Selected Products
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`تحذير: هل أنتِ متأكدة من حذف ${selectedIds.length} منتج نهائياً من قاعدة البيانات؟`)) {
      await bulkDeleteProducts(selectedIds);
      setSelectedIds([]);
      showToast("تم حذف المنتجات المحددة بنجاح.");
    }
  };

  // Category Handlers
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setNewCatName("");
    setIsAddCatModalOpen(false);
    showToast(`تمت إضافة القسم الجديد "${newCatName.trim()}" بنجاح!`);
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatModal.newName.trim()) return;
    await updateCategory(editCatModal.oldName, editCatModal.newName.trim());
    setEditCatModal({ open: false, oldName: "", newName: "" });
    showToast(`تم تعديل اسم القسم إلى "${editCatModal.newName.trim()}" وتحديث كافة منتجاته!`);
  };

  const handleDeleteCategory = async (catName: string) => {
    if (catName === "الكل") return;
    const count = products.filter((p) => p.category === catName).length;
    const confirmMsg =
      count > 0
        ? `القسم "${catName}" يحتوي على ${count} منتج. هل أنتِ متأكدة من حذفه؟ سيتم نقل المنتجات تلقائياً إلى قسم "مستحضرات تجميل".`
        : `هل أنتِ متأكدة من حذف القسم "${catName}"؟`;

    if (window.confirm(confirmMsg)) {
      await deleteCategory(catName);
      if (filterCategory === catName) setFilterCategory("الكل");
      showToast(`تم حذف القسم "${catName}".`);
    }
  };

  const handleApplyCategoryDiscount = async () => {
    const productsInCat = products.filter((p) => p.category === catDiscountModal.catName);
    if (productsInCat.length === 0) {
      alert("لا توجد منتجات في هذا القسم لتطبيق الخصم عليها.");
      setCatDiscountModal({ open: false, catName: "", percent: 20 });
      return;
    }
    const ids = productsInCat.map((p) => p.id);
    await applyDiscountToProducts(ids, catDiscountModal.percent);
    setCatDiscountModal({ open: false, catName: "", percent: 20 });
    showToast(`تم تطبيق خصم ${catDiscountModal.percent}% على جميع منتجات قسم "${catDiscountModal.catName}" (${ids.length} منتج)!`);
  };

  // Reset Defaults
  const handleResetDefaults = async () => {
    if (window.confirm("هل تريدين استعادة قائمة المنتجات والأسعار الافتراضية الأصلية لكاريشما؟")) {
      await resetToDefaults();
      setSelectedIds([]);
      showToast("تمت استعادة المنتجات الافتراضية بنجاح.");
    }
  };

  // Filtered products list
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = filterCategory === "الكل" || p.category === filterCategory;
      const matchesSearch =
        adminSearch.trim() === "" ||
        p.name.includes(adminSearch.trim()) ||
        p.description.includes(adminSearch.trim()) ||
        p.price.includes(adminSearch.trim());
      return matchesCat && matchesSearch;
    });
  }, [products, filterCategory, adminSearch]);

  // Multi-select helpers
  const isAllFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.id));
  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((p) => p.id === id)));
    } else {
      const allFilteredIds = filtered.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Calculate high-level stats
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
  }, [orders]);

  const discountedProductsCount = useMemo(() => {
    return products.filter((p) => Boolean(p.discount) || p.category === "عروض وخصومات").length;
  }, [products]);

  // Ranked most added products to cart
  const topCartProducts = useMemo(() => {
    const list = Object.values(cartAnalytics.productAdds || {});
    return list.sort((a, b) => b.count - a.count);
  }, [cartAnalytics]);

  // Active custom categories (excluding 'الكل')
  const manageableCategories = useMemo(() => {
    return categories.filter((c) => c !== "الكل");
  }, [categories]);

  // If not logged in, show login screen
  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="min-h-screen pt-36 pb-20 flex items-center justify-center px-4" dir="rtl">
          <div className="w-full max-w-md rounded-3xl bg-cream border border-pink/30 shadow-luxe p-8 text-right">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <NesrinLogo size="lg" />
              </div>
              <h1 className="font-display font-bold text-2xl text-ink">تسجيل دخول الإدارة</h1>
              <p className="text-xs text-ink/60 mt-1">كاريشما — إدارة نسرين الطنطاوي (Nesrin Tantawy)</p>
            </div>

            <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900">
              بيانات الدخول: <strong>admin</strong> / <strong>admin123</strong> أو <strong>nesrin</strong> / <strong>karisma2026</strong>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ok = login(loginUser, loginPass);
                if (!ok) setLoginError(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose font-medium">اسم المستخدم أو كلمة المرور غير صحيحة.</p>
              )}

              <button
                type="submit"
                className="w-full rounded-full gradient-gold py-3 text-xs font-bold uppercase tracking-wider text-ink shadow-soft hover:shadow-glow transition-all"
              >
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-7xl">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="fixed bottom-6 left-6 z-90 rounded-2xl bg-ink text-cream border border-gold/40 px-5 py-3 shadow-luxe flex items-center gap-2 text-xs font-bold animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* PWA Promotion Banner */}
          {!isAppInstalled && showPwaBanner && (
            <div className="mb-6 p-4.5 rounded-3xl bg-linear-to-r from-cream-dark via-gold/15 to-blush/25 border border-gold/40 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl gradient-gold text-ink flex items-center justify-center shadow-soft shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-ink font-display">تطبيق كاريشما للأدمن (PWA)</span>
                    <span className="px-2 py-0.5 rounded-full bg-gold/25 text-ink text-[10px] font-bold">تطبيق سريع</span>
                  </div>
                  <p className="text-xs text-ink/75 mt-0.5">
                    ثبتي لوحة التحكم كتطبيق مستقل على هاتفك (أندرويد / آيفون) لتصلي إليها مباشرة بنقرة واحدة من شاشة هاتفك الرئيسية وبدون الحاجة لفتح المتصفح!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="px-5 py-2.5 rounded-full bg-ink text-cream hover:bg-ink/90 text-xs font-bold flex items-center gap-1.5 shadow-soft transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-gold" />
                  <span>تثبيت التطبيق الآن</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPwaBanner(false)}
                  className="h-8 w-8 rounded-full border border-ink/15 text-ink/60 hover:text-ink flex items-center justify-center text-xs transition-colors"
                  title="إغلاق التنبيه"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Top Admin Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/10 pb-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <NesrinLogo size="md" />
              <div className="border-r border-ink/10 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full gradient-gold text-[10px] font-bold text-ink">
                    المشرف العام: نسرين الطنطاوي
                  </span>
                  <span className="text-xs text-ink/60">لوحة التحكم الشاملة</span>
                </div>
                <h1 className="mt-1 font-display font-extrabold text-2xl sm:text-3xl text-ink">
                  إدارة متجر <span className="text-gradient-gold">كاريشما</span>
                </h1>
                <p className="text-xs text-ink/70 mt-0.5">
                  تحكّمي في إضافة وتعديل وحذف المنتجات والأقسام، الأسعار، الخصومات الفردية والجماعية، ومتابعة إضافات السلة والطلبات.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* PWA Install Quick Button */}
              <button
                type="button"
                onClick={handleInstallPwa}
                className={`rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isAppInstalled
                    ? "bg-emerald-600/10 text-emerald-800 border border-emerald-600/30"
                    : "bg-ink text-cream hover:bg-ink/90 border border-gold/40 hover:shadow-soft"
                }`}
                title={isAppInstalled ? "التطبيق مثبت ونشط كـ App" : "تثبيت تطبيق الإدارة على هاتفك أو حاسوبك"}
              >
                <Smartphone className="h-4 w-4 text-gold" />
                <span>{isAppInstalled ? "التطبيق مثبت 📱" : "تثبيت كـ تطبيق 📱"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="rounded-full gradient-gold px-5 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow flex items-center gap-1.5 transition-all"
              >
                <Plus className="h-4 w-4" />
                إضافة منتج جديد
              </button>

              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(true)}
                className="rounded-full border border-gold/40 bg-gold/10 text-ink px-4 py-2.5 text-xs font-bold hover:bg-gold/20 flex items-center gap-1.5 transition-colors"
              >
                <FolderPlus className="h-3.5 w-3.5 text-gold" />
                إضافة قسم جديد
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="rounded-full border border-ink/20 bg-cream px-4 py-2.5 text-xs font-semibold text-ink/75 hover:text-ink flex items-center gap-1.5"
                title="استعادة قائمة المنتجات والأسعار الأصلية"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                استعادة الافتراضي
              </button>

              <Link
                to="/"
                className="rounded-full border border-ink/20 bg-cream px-4 py-2.5 text-xs font-semibold text-ink/75 hover:text-ink flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                معاينة المتجر
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-rose/30 bg-rose/10 text-rose px-4 py-2.5 text-xs font-semibold hover:bg-rose/20 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>

          {/* 4 Interactive Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Card 1: Products */}
            <div
              onClick={() => setActiveTab("products")}
              className={`rounded-2xl p-3.5 sm:p-5 text-right cursor-pointer transition-all border ${
                activeTab === "products"
                  ? "bg-pink-light/30 border-rose shadow-soft"
                  : "bg-cream border-ink/10 hover:border-gold/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs text-ink/60 font-medium">المنتجات في المتجر</p>
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-ink mt-1">{products.length}</p>
              <span className="text-[10px] text-ink/60 mt-1 block">
                في {manageableCategories.length} أقسام ({discountedProductsCount} منتج عليه خصم)
              </span>
            </div>

            {/* Card 2: Orders & Sales */}
            <div
              onClick={() => setActiveTab("orders")}
              className={`rounded-2xl p-3.5 sm:p-5 text-right cursor-pointer transition-all border ${
                activeTab === "orders"
                  ? "bg-amber-50 border-gold shadow-soft"
                  : "bg-cream border-ink/10 hover:border-gold/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs text-ink/60 font-medium">الطلبات الواردة</p>
                <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-ink mt-1">{orders.length}</p>
              <span className="text-[10px] text-rose font-bold mt-1 block">
                {totalRevenue.toLocaleString()} ج.م إجمالي المبيعات
              </span>
            </div>

            {/* Card 3: Cart Additions */}
            <div
              onClick={() => setActiveTab("analytics")}
              className={`rounded-2xl p-3.5 sm:p-5 text-right cursor-pointer transition-all border ${
                activeTab === "analytics"
                  ? "bg-baby-blue-light/40 border-baby-blue shadow-soft"
                  : "bg-cream border-ink/10 hover:border-gold/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs text-ink/60 font-medium">إضافات السلة</p>
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-baby-blue" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-baby-blue mt-1">
                {cartAnalytics.totalAdds}
              </p>
              <span className="text-[10px] text-ink/60 mt-1 block">
                {topCartProducts.length > 0 ? `الأكثر: ${topCartProducts[0]?.name?.slice(0, 18)}...` : "اضغطي لعرض التفاصيل"}
              </span>
            </div>

            {/* Card 4: Database Health */}
            <div className="rounded-2xl bg-cream border border-ink/10 p-3.5 sm:p-5 text-right flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] sm:text-xs text-ink/60 font-medium">قاعدة البيانات</p>
                  <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700" />
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-display font-bold text-[11px] sm:text-xs text-emerald-800 line-clamp-1">
                    {dbStatus?.connected ? "متصل بـ MongoDB Atlas" : "جاري الاتصال بـ Atlas..."}
                  </span>
                </div>
                <p className="text-[10px] text-ink/50 font-mono mt-0.5">DB: {dbStatus?.dbName || "karisma"}</p>
              </div>
              <button
                type="button"
                onClick={loadDbData}
                className="mt-2 text-[11px] text-gold font-bold hover:underline inline-flex items-center gap-1 self-start"
              >
                <RefreshCw className="h-3 w-3" /> تحديث البيانات
              </button>
            </div>
          </div>

          {/* Navigation Tabs (5 Tabs) */}
          <div className="flex border-b border-ink/10 mb-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "products"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>إدارة المنتجات ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "categories"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>إدارة الأقسام والتصنيفات ({manageableCategories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>طلبات العملاء ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "analytics"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>إحصائيات السلة والطلبات ({cartAnalytics.totalAdds})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "messages"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>رسائل التواصل ({messages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "customers"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>قاعدة العملاء ({customers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`pb-3 px-4 font-display font-bold text-sm sm:text-base border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "staff"
                  ? "border-gold text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>الموظفون ({staffUsers.length})</span>
            </button>
          </div>

          {/* TAB 1: Products Management */}
          {activeTab === "products" && (
            <div>
              {/* Search & Category Filter */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="ابحثي بالاسم أو الوصف أو السعر..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full rounded-full border border-ink/20 bg-cream px-4 py-2.5 pr-10 text-xs text-ink focus:border-gold focus:outline-none"
                  />
                  <Search className="absolute right-3.5 top-3 h-4 w-4 text-ink/40" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilterCategory(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        filterCategory === c
                          ? "gradient-gold text-ink"
                          : "bg-cream border border-ink/10 text-ink/70 hover:text-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions Floating Bar */}
              {selectedIds.length > 0 && (
                <div className="mb-4 p-4 rounded-3xl bg-ink text-cream border border-gold/50 shadow-luxe flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-gold/25 border border-gold/40 text-gold text-xs font-bold flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4" />
                      تم تحديد {selectedIds.length} من أصل {products.length} منتج
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-cream/70 hover:text-cream underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkDiscountModalOpen(true)}
                      className="px-4 py-2 rounded-full gradient-gold text-ink text-xs font-bold flex items-center gap-1.5 shadow-soft hover:shadow-glow transition-all"
                    >
                      <Percent className="h-3.5 w-3.5" />
                      تطبيق خصم جماعي ({selectedIds.length})
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkRemoveDiscount}
                      className="px-4 py-2 rounded-full bg-cream/10 border border-cream/20 text-cream text-xs font-semibold hover:bg-cream/20 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      إلغاء الخصم عن المحدد
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="px-4 py-2 rounded-full bg-rose/20 border border-rose/40 text-rose text-xs font-semibold hover:bg-rose/30 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف المنتجات المحددة
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="rounded-3xl bg-cream border border-ink/10 overflow-hidden shadow-soft">
                {/* Desktop Table (md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-ink/5 border-b border-ink/10 text-ink/70 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-4 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isAllFilteredSelected}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded accent-gold cursor-pointer"
                            title="تحديد كل المنتجات المعروضة"
                          />
                        </th>
                        <th className="py-4 px-4">الصورة</th>
                        <th className="py-4 px-4">اسم المنتج والوصف</th>
                        <th className="py-4 px-4">القسم</th>
                        <th className="py-4 px-4">السعر الحالي</th>
                        <th className="py-4 px-4">السعر الأصلي / الخصم</th>
                        <th className="py-4 px-4">الشارة</th>
                        <th className="py-4 px-4 text-center">إجراءات سريعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/8">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-ink/60">
                            لا توجد منتجات مطابقة لخيارات البحث الحالية.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => {
                          const isSelected = selectedIds.includes(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isSelected ? "bg-gold/10" : "hover:bg-ink/2"
                              }`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(item.id)}
                                  className="h-4 w-4 rounded accent-gold cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-14 w-14 rounded-xl object-cover bg-blush/30 border border-ink/10"
                                />
                              </td>
                              <td className="py-3 px-4 max-w-xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-display font-bold text-sm text-ink">{item.name}</p>
                                  {item.isBundle && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold-deep border border-gold/30 text-[10px] font-bold">
                                      <Gift className="w-3 h-3 text-gold" />
                                      باكدج ({item.bundleItems?.length || 0})
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-ink/60 line-clamp-1">{item.description}</p>
                              </td>
                              <td className="py-3 px-4 font-medium text-rose whitespace-nowrap">
                                {item.category}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-display font-extrabold text-sm text-ink">
                                    {item.price}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuickPriceModal(item)}
                                    className="p-1 rounded-md text-ink/40 hover:text-gold hover:bg-gold/10 transition-colors"
                                    title="تعديل السعر والخصم مباشرة"
                                  >
                                    <Tag className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {item.originalPrice ? (
                                  <div>
                                    <span className="line-through text-ink/40 font-mono text-[11px]">
                                      {item.originalPrice}
                                    </span>
                                    {item.discount && (
                                      <span className="text-[10px] text-rose font-bold block">
                                        {item.discount}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuickPriceModal(item)}
                                    className="text-[10px] text-gold font-bold hover:underline"
                                  >
                                    + إضافة خصم
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {item.badge ? (
                                  <span className="px-2 py-0.5 rounded-full gradient-gold text-[10px] font-bold text-ink">
                                    {item.badge}
                                  </span>
                                ) : (
                                  <span className="text-ink/30">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuickPriceModal(item)}
                                    className="px-2 py-1 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    title="تعديل السعر أو إضافة خصم سريع"
                                  >
                                    <Percent className="h-3 w-3" />
                                    خصم / سعر
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="h-7 w-7 rounded-lg border border-ink/15 text-ink hover:bg-gold/20 hover:border-gold flex items-center justify-center transition-colors"
                                    title="تعديل تفاصيل المنتج بالكامل"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id, item.name)}
                                    className="h-7 w-7 rounded-lg border border-rose/25 text-rose hover:bg-rose/15 flex items-center justify-center transition-colors"
                                    title="حذف المنتج نهائياً"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Products Card View (md:hidden) */}
                <div className="md:hidden divide-y divide-ink/8">
                  {filtered.length === 0 ? (
                    <div className="py-10 text-center text-xs text-ink/60">
                      لا توجد منتجات مطابقة لخيارات البحث الحالية.
                    </div>
                  ) : (
                    filtered.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 space-y-3 transition-colors ${
                            isSelected ? "bg-gold/10" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(item.id)}
                              className="h-4 w-4 mt-1 rounded accent-gold cursor-pointer shrink-0"
                            />
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-xl object-cover bg-blush/30 border border-ink/10 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-display font-bold text-xs text-ink">
                                    {item.name}
                                  </span>
                                  {item.isBundle && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/15 text-gold-deep border border-gold/30 text-[9px] font-bold">
                                      <Gift className="w-2.5 h-2.5 text-gold" />
                                      باكدج ({item.bundleItems?.length || 0})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-semibold text-rose bg-rose/10 px-2 py-0.5 rounded-full shrink-0">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink/60 line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                                <span className="font-display font-extrabold text-sm text-ink">
                                  {item.price}
                                </span>
                                {item.originalPrice && (
                                  <span className="line-through text-ink/40 font-mono text-[10px]">
                                    {item.originalPrice}
                                  </span>
                                )}
                                {item.discount && (
                                  <span className="text-[10px] text-rose font-bold">
                                    ({item.discount})
                                  </span>
                                )}
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 rounded-full gradient-gold text-[9px] font-bold text-ink">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-ink/6">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickPriceModal(item)}
                              className="flex-1 py-1.5 px-2 rounded-lg border border-gold/40 bg-gold/10 text-gold-deep text-[11px] font-bold flex items-center justify-center gap-1"
                            >
                              <Percent className="h-3 w-3" />
                              خصم / سعر
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="py-1.5 px-3 rounded-lg border border-ink/15 text-ink hover:bg-gold/20 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.name)}
                              className="py-1.5 px-3 rounded-lg border border-rose/30 bg-rose/5 text-rose hover:bg-rose/15 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Categories Management (NEW FEATURE) */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-6 rounded-3xl bg-cream border border-ink/10 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-ink flex items-center gap-2">
                    <Layers className="h-5 w-5 text-gold" />
                    <span>إدارة الأقسام وتصنيفات المتجر</span>
                  </h2>
                  <p className="text-xs text-ink/70 mt-1 max-w-2xl leading-relaxed">
                    يمكنكِ إضافة أقسام جديدة لتظهر فوراً في المتجر، تعديل أسماء الأقسام القائمة (مع تحديث كل المنتجات التابعة لها تلقائياً في MongoDB)، أو تطبيق خصم شامل على أي قسم بضغطة زر واحدة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(true)}
                  className="rounded-full gradient-gold px-5 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  إضافة قسم جديد
                </button>
              </div>

              {/* Categories Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {manageableCategories.map((catName) => {
                  const productsInCat = products.filter((p) => p.category === catName);
                  const discountedInCat = productsInCat.filter(
                    (p) => Boolean(p.discount) || catName === "عروض وخصومات",
                  );

                  return (
                    <div
                      key={catName}
                      className="rounded-3xl bg-cream border border-ink/10 p-6 shadow-soft hover:border-gold/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full gradient-gold text-xs font-extrabold text-ink">
                            قسم متجر
                          </span>
                          <span className="text-xs font-mono text-ink/50">
                            {productsInCat.length} منتجات
                          </span>
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-ink mb-1">
                          {catName}
                        </h3>

                        <p className="text-xs text-ink/60 mb-4">
                          يحتوي على <strong>{productsInCat.length}</strong> منتج معروض، منها{" "}
                          <span className="text-rose font-bold">{discountedInCat.length}</span> عليها عروض وخصومات.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-ink/10 flex flex-wrap items-center justify-between gap-2">
                        {/* Apply Category Discount */}
                        <button
                          type="button"
                          onClick={() =>
                            setCatDiscountModal({
                              open: true,
                              catName,
                              percent: 20,
                            })
                          }
                          className="px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="تطبيق خصم على جميع منتجات هذا القسم"
                        >
                          <Percent className="h-3 w-3" />
                          خصم على القسم
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Edit Category Name */}
                          <button
                            type="button"
                            onClick={() =>
                              setEditCatModal({
                                open: true,
                                oldName: catName,
                                newName: catName,
                              })
                            }
                            className="p-2 rounded-xl border border-ink/15 text-ink hover:bg-gold/20 hover:border-gold transition-colors"
                            title="تعديل اسم القسم"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Category */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(catName)}
                            className="p-2 rounded-xl border border-rose/25 text-rose hover:bg-rose/15 transition-colors"
                            title="حذف القسم"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Orders View */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-lg text-ink">
                  إجمالي الطلبات المسجلة: <span className="text-rose font-extrabold">{orders.length}</span>
                </p>
                <span className="text-xs text-ink/60">
                  إجمالي المبيعات المحققة: <strong>{totalRevenue.toLocaleString()} ج.م</strong>
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-3xl bg-cream border border-ink/10 p-12 text-center text-ink/60">
                  <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-display font-bold text-lg text-ink">لا توجد طلبات واردة حتى الآن</p>
                  <p className="text-xs mt-1">
                    عندما يقوم العملاء بطلب منتجات من صفحة الدفع، تظهر تفاصيل طلباتهم هنا فوراً ومحفوظة في قاعدة بيانات MongoDB Atlas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((ord: any) => (
                    <div
                      key={ord._id}
                      className="rounded-3xl bg-cream border border-ink/10 p-6 shadow-soft hover:border-gold/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink/10 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1 rounded-full gradient-gold text-xs font-bold text-ink">
                            طلب #{ord._id?.slice(-6)?.toUpperCase()}
                          </span>
                          <span className="text-xs text-ink/50 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleString("ar-EG") : "اليوم"}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-ink/60">إجمالي الطلب: </span>
                          <span className="font-display font-extrabold text-lg text-ink">
                            {ord.total} ج.م
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 text-xs">
                        {/* Customer Information */}
                        <div className="space-y-2 bg-blush/20 p-4 rounded-2xl border border-pink/20">
                          <p className="font-bold text-ink flex items-center gap-1.5 text-sm">
                            <User className="h-4 w-4 text-rose" />
                            <span>بيانات العميل: {ord.customerName}</span>
                          </p>
                          <p className="text-ink/80 flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-rose" />
                            <span>الهاتف: {ord.phone}</span>
                            <a
                              href={`https://wa.me/2${ord.phone?.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mr-2 text-[11px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              مراسلة واتساب فورية
                            </a>
                          </p>
                          <p className="text-ink/80 flex items-start gap-1.5">
                            <MapPin className="h-4 w-4 text-rose mt-0.5 shrink-0" />
                            <span>
                              العنوان: {ord.governorate} — {ord.city} — {ord.detailedAddress}
                            </span>
                          </p>
                          {ord.notes && (
                            <p className="text-ink/70 bg-cream/80 p-2 rounded-xl border border-ink/10">
                              ملاحظات العميل: {ord.notes}
                            </p>
                          )}
                          <p className="text-[11px] text-ink/60 font-medium">
                            طريقة الدفع: {ord.paymentMethod === "cod" ? "الدفع عند الاستلام" : ord.paymentMethod}
                          </p>
                        </div>

                        {/* Order Items */}
                        <div>
                          <p className="font-bold text-ink mb-2">
                            المنتجات المطلوبة ({ord.items?.length || 0}):
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {ord.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-cream border border-ink/10"
                              >
                                <div className="flex items-center gap-2.5">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-10 w-10 rounded-lg object-cover bg-blush/20"
                                    />
                                  )}
                                  <div>
                                    <p className="font-bold text-ink text-xs">{item.name}</p>
                                    <p className="text-[11px] text-ink/60">الكمية: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-display font-bold text-ink text-xs">{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Cart Additions & Conversion Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-cream border border-ink/10 p-6 text-right">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-ink/60 font-medium">إجمالي مرات الإضافة للسلة</p>
                    <ShoppingCart className="h-5 w-5 text-baby-blue" />
                  </div>
                  <p className="font-display font-extrabold text-4xl text-baby-blue">
                    {cartAnalytics.totalAdds}
                  </p>
                  <p className="text-[11px] text-ink/50 mt-1">تفاعل الزوار مع سلة التسوق</p>
                </div>

                <div className="rounded-3xl bg-cream border border-ink/10 p-6 text-right">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-ink/60 font-medium">إجمالي الطلبات المؤكدة</p>
                    <Inbox className="h-5 w-5 text-gold" />
                  </div>
                  <p className="font-display font-extrabold text-4xl text-ink">{orders.length}</p>
                  <p className="text-[11px] text-ink/50 mt-1">طلبات تم تأكيدها في المتجر</p>
                </div>

                <div className="rounded-3xl bg-cream border border-ink/10 p-6 text-right">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-ink/60 font-medium">معدل تحويل السلة لطلب</p>
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="font-display font-extrabold text-4xl text-emerald-700">
                    {cartAnalytics.totalAdds > 0
                      ? `${Math.round((orders.length / cartAnalytics.totalAdds) * 100)}%`
                      : "0%"}
                  </p>
                  <p className="text-[11px] text-ink/50 mt-1">نسبة إتمام الشراء بعد الإضافة</p>
                </div>

                <div className="rounded-3xl bg-cream border border-ink/10 p-6 text-right">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-ink/60 font-medium">إجمالي الإيرادات المتوقعة</p>
                    <DollarSign className="h-5 w-5 text-rose" />
                  </div>
                  <p className="font-display font-extrabold text-3xl text-rose">
                    {totalRevenue.toLocaleString()} ج.م
                  </p>
                  <p className="text-[11px] text-ink/50 mt-1">من إجمالي الطلبات الواردة</p>
                </div>
              </div>

              {/* Top Products Added to Cart */}
              <div className="rounded-3xl bg-cream border border-ink/10 p-6 shadow-soft">
                <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-rose" />
                    <h2 className="font-display font-bold text-xl text-ink">
                      المنتجات الأكثر إضافة إلى السلة (الأعلى طلباً)
                    </h2>
                  </div>
                  <span className="text-xs text-ink/60">
                    ترتيب المنتجات وفق رغبة العملاء
                  </span>
                </div>

                {topCartProducts.length === 0 ? (
                  <div className="py-12 text-center text-ink/50 text-xs">
                    لم يقم الزوار بعد بإضافة منتجات إلى السلة في هذه الجلسة.
                    <br />
                    بمجرد ضغط أي عميل على "أضيفي إلى السلة" سيظهر المنتج وعدد مرات طلبه هنا مباشرة.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-ink/5 text-ink/70 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-12 text-center">الترتيب</th>
                            <th className="py-3 px-4">المنتج</th>
                            <th className="py-3 px-4">السعر</th>
                            <th className="py-3 px-4 text-center">مرات الإضافة للسلة</th>
                            <th className="py-3 px-4 text-center">إجراء سريع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/8">
                          {topCartProducts.map((prod, index) => {
                            const matchedProduct = products.find((p) => p.id === prod.id);
                            return (
                              <tr key={prod.id} className="hover:bg-ink/2 transition-colors">
                                <td className="py-3 px-4 text-center font-bold text-sm">
                                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    {prod.image && (
                                      <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="h-10 w-10 rounded-xl object-cover border border-ink/10 bg-blush/20"
                                      />
                                    )}
                                    <span className="font-bold text-sm text-ink">{prod.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-display font-bold text-ink">
                                  {prod.price}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-baby-blue/15 text-baby-blue font-extrabold text-xs">
                                    <ShoppingCart className="h-3 w-3" /> {prod.count} مرات
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {matchedProduct && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickPriceModal(matchedProduct)}
                                      className="px-3 py-1 rounded-full gradient-gold text-ink text-xs font-bold hover:shadow-soft"
                                    >
                                      تطبيق خصم تشجيعي
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="sm:hidden divide-y divide-ink/8">
                      {topCartProducts.map((prod, index) => {
                        const matchedProduct = products.find((p) => p.id === prod.id);
                        return (
                          <div key={prod.id} className="p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-ink">
                                {index === 0 ? "🥇 الأول" : index === 1 ? "🥈 الثاني" : index === 2 ? "🥉 الثالث" : `#${index + 1}`}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-baby-blue/15 text-baby-blue font-extrabold text-[11px]">
                                <ShoppingCart className="h-3 w-3" /> {prod.count} مرات
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {prod.image && (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="h-12 w-12 rounded-xl object-cover border border-ink/10 bg-blush/20 shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-ink truncate">{prod.name}</p>
                                <p className="font-display font-extrabold text-xs text-rose mt-0.5">{prod.price}</p>
                              </div>
                            </div>
                            {matchedProduct && (
                              <button
                                type="button"
                                onClick={() => handleOpenQuickPriceModal(matchedProduct)}
                                className="w-full py-1.5 rounded-full gradient-gold text-ink text-xs font-bold text-center"
                              >
                                تطبيق خصم تشجيعي
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Messages */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="rounded-3xl bg-cream border border-ink/10 p-12 text-center text-ink/60">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-display font-bold text-lg text-ink">لا توجد رسائل واردة حتى الآن</p>
                  <p className="text-xs mt-1">
                    الرسائل المرسلة من صفحة "تواصلي معنا" ستظهر هنا مباشرة ومحفوظة في قاعدة بيانات MongoDB Atlas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {messages.map((msg: any) => (
                    <div
                      key={msg._id}
                      className="rounded-3xl bg-cream border border-ink/10 p-6 shadow-soft"
                    >
                      <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-ink">{msg.name}</span>
                          <span className="text-xs text-ink/50">({msg.phone})</span>
                          {msg.email && <span className="text-xs text-ink/40 font-mono">| {msg.email}</span>}
                        </div>
                        <span className="text-xs text-ink/40 flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString("ar-EG") : ""}
                        </span>
                      </div>
                      {msg.subject && (
                        <p className="text-xs font-bold text-rose mb-1.5">الموضوع: {msg.subject}</p>
                      )}
                      <p className="text-xs text-ink/80 bg-blush/20 p-3.5 rounded-2xl border border-pink/20 leading-relaxed">
                        {msg.message}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <a
                          href={`https://wa.me/2${msg.phone?.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold hover:bg-emerald-500/20"
                        >
                          رد عبر واتساب
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Customers Loyalty */}
          {activeTab === "customers" && (() => {
            const TIER_META: Record<string, { label: string; color: string; icon: string }> = {
              "برونزي":  { label: "برونزي",  color: "bg-amber-700/15 text-amber-800 border-amber-700/30",  icon: "🥉" },
              "فضي":    { label: "فضي",    color: "bg-slate-400/15 text-slate-700 border-slate-400/30",    icon: "🪨" },
              "ذهبي":   { label: "ذهبي",   color: "bg-gold/20 text-gold-deep border-gold/40",            icon: "🥇" },
              "بلاتيني": { label: "بلاتيني", color: "bg-purple-500/15 text-purple-800 border-purple-500/30", icon: "💠" },
            };

            const filteredCustomers = customers.filter((c) => {
              if (!customerSearch.trim()) return true;
              const q = customerSearch.toLowerCase();
              return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.governorate?.includes(q);
            });

            const totalPoints = customers.reduce((s, c) => s + (c.points || 0), 0);
            const totalSpent  = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);

            return (
              <div className="space-y-5">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "إجمالي العملاء", val: customers.length, icon: "👥", color: "from-blue-50 to-blue-100/40" },
                    { label: "إجمالي النقاط", val: totalPoints.toLocaleString("ar-EG"), icon: "⭐", color: "from-gold/10 to-gold/20" },
                    { label: "إجمالي المبيعات", val: `${totalSpent.toLocaleString("ar-EG")} ج.م`, icon: "💰", color: "from-emerald-50 to-emerald-100/40" },
                    { label: "متوسط النقاط", val: customers.length ? Math.round(totalPoints / customers.length) : 0, icon: "📊", color: "from-rose-50 to-rose-100/40" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} border border-ink/10 p-4 shadow-soft`}>
                      <p className="text-xl">{s.icon}</p>
                      <p className="font-display font-bold text-lg sm:text-2xl text-ink mt-1">{s.val}</p>
                      <p className="text-[11px] text-ink/60 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ابحثي بالاسم أو الهاتف أو المحافظة..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full rounded-2xl border border-ink/20 bg-cream pr-10 pl-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Customers Table / Cards */}
                {filteredCustomers.length === 0 ? (
                  <div className="rounded-3xl bg-cream border border-ink/10 p-12 text-center text-ink/60">
                    <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-display font-bold text-lg text-ink">
                      {customers.length === 0 ? "لا يوجد عملاء حتى الآن" : "لا توجد نتائج"}
                    </p>
                    <p className="text-xs mt-1">بمجرد تسجيل عميلة لأول طلب سيظهر حسابها هنا تلقائياً.</p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-ink/10 overflow-hidden shadow-soft">
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-[1fr_140px_100px_90px_90px_100px] gap-3 bg-ink/5 px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink/60 border-b border-ink/10">
                      <span>العميل</span>
                      <span>المحافظة</span>
                      <span>الطلبات</span>
                      <span>الإنفاق</span>
                      <span>النقاط</span>
                      <span>إجراء</span>
                    </div>
                    <div className="divide-y divide-ink/8">
                      {filteredCustomers.map((c: any) => {
                        const tier = TIER_META[c.tier] || TIER_META["برونزي"];
                        return (
                          <div
                            key={c.id}
                            className={`px-5 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_140px_100px_90px_90px_100px] gap-3 items-start sm:items-center bg-cream hover:bg-cream-dark/30 transition-colors ${
                              c.isBlocked ? "opacity-50" : ""
                            }`}
                          >
                            {/* Name + phone + tier */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-ink">{c.name}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${tier.color}`}>
                                  {tier.icon} {tier.label}
                                </span>
                                {c.isBlocked && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">محجوب</span>
                                )}
                              </div>
                              <p className="text-xs text-ink/50 font-mono mt-0.5 flex items-center gap-1">
                                <Phone className="h-3 w-3" />{c.phone}
                                {c.backupPhone && <span className="text-ink/30">| {c.backupPhone}</span>}
                              </p>
                              {c.notes && (
                                <p className="text-[11px] text-ink/40 mt-0.5 italic">{c.notes}</p>
                              )}
                            </div>
                            {/* Governorate */}
                            <span className="text-xs text-ink/70 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{c.governorate || "—"}
                            </span>
                            {/* Total orders */}
                            <span className="text-xs font-bold text-ink">{c.totalOrders} طلب</span>
                            {/* Total spent */}
                            <span className="text-xs font-mono text-ink">{(c.totalSpent || 0).toLocaleString("ar-EG")} ج.م</span>
                            {/* Points */}
                            <span className="text-xs font-bold text-gold-deep flex items-center gap-1">
                              ⭐ {c.points || 0}
                            </span>
                            {/* Actions */}
                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setEditPointsModal({ open: true, customer: c, pts: c.points || 0 })}
                                className="px-2.5 py-1.5 rounded-xl bg-gold/20 text-gold-deep text-[11px] font-bold hover:bg-gold/30 transition-colors border border-gold/30"
                              >
                                ⭐ نقاط
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateCustomerServerFn({ data: { phone: c.phone, isBlocked: !c.isBlocked } }).catch(() => {});
                                  await loadDbData();
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                                  c.isBlocked
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                }`}
                              >
                                {c.isBlocked ? "✅ فك" : "🚫 حجب"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Points Rule Card */}
                <div className="rounded-2xl bg-gradient-to-br from-gold/8 to-cream border border-gold/20 p-4">
                  <p className="font-bold text-sm text-ink mb-2">ℹ️ نظام النقاط — السياسة الحالية</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-ink/70">
                    <ul className="space-y-1">
                      <li>• 10 نقاط لكل 100 ج.م ينفقها العميل</li>
                      <li>• +50 نقطة ترحيبية عند أول طلب</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>🥉 برونزي: 0 – 499 نقطة</li>
                      <li>🪨 فضي: 500 – 1999 نقطة</li>
                      <li>🥇 ذهبي: 2000 – 4999 نقطة</li>
                      <li>💠 بلاتيني: 5000+ نقطة</li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 7: Staff Management */}
          {activeTab === "staff" && (() => {
            const ROLE_META: Record<string, { label: string; color: string; icon: string; perms: string }> = {
              admin:    { label: "أدمن",  color: "bg-purple-500/15 text-purple-800 border-purple-400/30", icon: "👑", perms: "صلاحيات كاملة" },
              employee: { label: "موظف",  color: "bg-blue-500/15 text-blue-800 border-blue-400/30",       icon: "🧑", perms: "طلبات + عملاء" },
              viewer:   { label: "مشاهد", color: "bg-slate-400/15 text-slate-700 border-slate-400/30",    icon: "👁", perms: "مشاهدة فقط" },
            };
            const filteredStaff = staffUsers.filter((u: any) => {
              if (!staffSearch.trim()) return true;
              const q = staffSearch.toLowerCase();
              return u.username?.includes(q) || u.displayName?.toLowerCase().includes(q);
            });
            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-ink">إدارة الموظفين والصلاحيات</h3>
                    <p className="text-xs text-ink/50">أنشئي حسابات للفريق وحددي صلاحيات كل موظفة</p>
                  </div>
                  <button type="button" onClick={() => setStaffModal({ open: true, mode: "create", username: "", displayName: "", password: "", role: "employee", permissions: ["orders", "customers"], isActive: true, error: "", loading: false })} className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow transition-all">
                    <Plus className="h-4 w-4" /> إضافة موظفة جديدة
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 pointer-events-none" />
                  <input type="text" placeholder="ابحثي بالاسم أو اسم المستخدم..." value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} className="w-full rounded-2xl border border-ink/20 bg-cream pr-10 pl-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
                </div>
                {filteredStaff.length === 0 ? (
                  <div className="rounded-3xl bg-cream border border-ink/10 p-12 text-center text-ink/60">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-display font-bold text-lg text-ink">{staffUsers.length === 0 ? "لا يوجد موظفون حتى الآن" : "لا توجد نتائج"}</p>
                    <p className="text-xs mt-1">اضغطي على الزرار أعلاه لإنشاء أول حساب.</p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-ink/10 overflow-hidden shadow-soft">
                    <div className="hidden sm:grid grid-cols-[1fr_110px_100px_80px_120px] gap-3 bg-ink/5 px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-ink/60 border-b border-ink/10">
                      <span>الموظف</span><span>الدور</span><span>الصلاحيات</span><span>الحالة</span><span>إجراءات</span>
                    </div>
                    <div className="divide-y divide-ink/8">
                      {filteredStaff.map((u: any) => {
                        const rm = ROLE_META[u.role] || ROLE_META.viewer;
                        return (
                          <div key={u.id} className={`px-5 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_110px_100px_80px_120px] gap-3 items-start sm:items-center bg-cream hover:bg-cream-dark/30 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                            <div>
                              <p className="font-bold text-sm text-ink">{u.displayName}</p>
                              <p className="text-xs text-ink/50 font-mono">@{u.username}</p>
                              {u.lastLogin && <p className="text-[11px] text-ink/40 mt-0.5">آخر دخول: {new Date(u.lastLogin).toLocaleDateString("ar-EG")}</p>}
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${rm.color}`}>{rm.icon} {rm.label}</span>
                            <span className="text-[11px] text-ink/60">{rm.perms}</span>
                            {/* Show actual custom permissions if set */}
                            {Array.isArray(u.permissions) && u.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1 col-span-full sm:col-auto">
                                {u.permissions.map((p: string) => (
                                  <span key={p} className="px-1.5 py-0.5 rounded-md bg-gold/15 text-gold-deep text-[10px] font-bold border border-gold/20">{
                                    { products:"منتجات", categories:"فئات", orders:"طلبات", analytics:"تحليلات", messages:"رسائل", customers:"عملاء", staff:"موظفون" }[p] || p
                                  }</span>
                                ))}
                              </div>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{u.isActive ? "مفعل" : "معطل"}</span>
                            <div className="flex gap-1.5 flex-wrap">
                              <button type="button" onClick={() => setStaffModal({ open: true, mode: "edit", username: u.username, displayName: u.displayName, password: "", role: u.role, permissions: Array.isArray(u.permissions) ? u.permissions : [], isActive: u.isActive, error: "", loading: false })} className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 border border-blue-200">تعديل</button>
                              <button type="button" onClick={async () => { if (!confirm("حذف هذا الحساب؟")) return; await deleteStaffUserServerFn({ data: u.username }).catch(() => {}); await loadDbData(); }} className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold hover:bg-red-100 border border-red-200">حذف</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="rounded-2xl bg-gradient-to-br from-purple-500/5 to-cream border border-purple-400/20 p-4">
                  <p className="font-bold text-sm text-ink mb-3">جدول الصلاحيات</p>
                  <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-ink/70">
                    <div className="rounded-xl bg-cream border border-ink/10 p-3"><p className="font-bold text-purple-800 mb-1">👑 أدمن</p><ul className="space-y-0.5"><li>• إدارة المنتجات والفئات</li><li>• الطلبات والعملاء</li><li>• التحليلات والرسائل</li><li>• إدارة الموظفين</li></ul></div>
                    <div className="rounded-xl bg-cream border border-ink/10 p-3"><p className="font-bold text-blue-800 mb-1">🧑 موظف</p><ul className="space-y-0.5"><li>• عرض وتحديث الطلبات</li><li>• عرض قاعدة العملاء</li></ul></div>
                    <div className="rounded-xl bg-cream border border-ink/10 p-3"><p className="font-bold text-slate-700 mb-1">👁 مشاهد</p><ul className="space-y-0.5"><li>• عرض المنتجات فقط</li><li>• عرض الطلبات (قراءة)</li></ul></div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* MODAL: Staff Create / Edit */}
      {staffModal.open && (() => {
        const ALL_TABS = [
          { key: "products",   label: "المنتجات",    icon: "📦" },
          { key: "categories", label: "الفئات",       icon: "🏷️" },
          { key: "orders",     label: "الطلبات",      icon: "🛝" },
          { key: "analytics", label: "التحليلات",   icon: "📊" },
          { key: "messages",  label: "الرسائل",     icon: "✉️" },
          { key: "customers", label: "العملاء",     icon: "👥" },
          { key: "staff",     label: "الموظفون",    icon: "👤" },
        ];
        const PRESETS: Record<string, { label: string; color: string; perms: string[] }> = {
          admin:    { label: "👑 أدمن كامل",    color: "bg-purple-100 text-purple-800 border-purple-300", perms: ["products","categories","orders","analytics","messages","customers","staff"] },
          employee: { label: "🧑 موظف عادي", color: "bg-blue-100 text-blue-800 border-blue-300",       perms: ["orders","customers"] },
          viewer:   { label: "👁 مشاهد فقط",  color: "bg-slate-100 text-slate-700 border-slate-300",   perms: ["products","orders"] },
        };
        const togglePerm = (key: string) => {
          const cur = staffModal.permissions;
          const next = cur.includes(key) ? cur.filter(p => p !== key) : [...cur, key];
          setStaffModal(s => ({ ...s, permissions: next, role: "custom" }));
        };
        const applyPreset = (preset: string) => {
          const p = PRESETS[preset];
          if (p) setStaffModal(s => ({ ...s, permissions: p.perms, role: preset as any }));
        };
        return (
          <div dir="rtl" className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 text-right max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <h3 className="font-display font-extrabold text-lg text-ink">
                    {staffModal.mode === "create" ? "إضافة موظفة جديدة" : `تعديل: @${staffModal.username}`}
                  </h3>
                </div>
                <button type="button" onClick={() => setStaffModal(s => ({ ...s, open: false }))} className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center">✕</button>
              </div>

              {staffModal.error && <p className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{staffModal.error}</p>}

              <div className="space-y-4">
                {/* Name + Username */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-ink/70 block mb-1">الاسم الظاهر *</label>
                    <input type="text" placeholder="سارة أحمد" value={staffModal.displayName} onChange={e => setStaffModal(s => ({ ...s, displayName: e.target.value }))} className="w-full rounded-2xl border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink/70 block mb-1">اسم المستخدم *{staffModal.mode === "edit" && " (لا يتغير)"}</label>
                    <input type="text" placeholder="sara123" disabled={staffModal.mode === "edit"} value={staffModal.username} onChange={e => setStaffModal(s => ({ ...s, username: e.target.value.replace(/\s/g, "") }))} className="w-full rounded-2xl border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none disabled:opacity-50 font-mono" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1">{staffModal.mode === "create" ? "كلمة المرور *" : "كلمة مرور جديدة (اتركيها فارغة إن لم ترغبي)"}</label>
                  <input type="password" placeholder="6 حروف على الأقل" value={staffModal.password} onChange={e => setStaffModal(s => ({ ...s, password: e.target.value }))} className="w-full rounded-2xl border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
                </div>

                {/* Status (edit only) */}
                {staffModal.mode === "edit" && (
                  <div>
                    <label className="text-xs font-semibold text-ink/70 block mb-1">حالة الحساب</label>
                    <select value={staffModal.isActive ? "1" : "0"} onChange={e => setStaffModal(s => ({ ...s, isActive: e.target.value === "1" }))} className="w-full rounded-2xl border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none">
                      <option value="1">✅ مفعّل</option>
                      <option value="0">🚫 معطّل</option>
                    </select>
                  </div>
                )}

                {/* ==================== PERMISSIONS SECTION ==================== */}
                <div className="rounded-2xl border border-ink/15 overflow-hidden">
                  <div className="bg-ink/5 px-4 py-2.5 border-b border-ink/10 flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">🔐 اختري التبويبات المتاحة</p>
                    <span className="text-[11px] text-ink/50">{staffModal.permissions.length} / {ALL_TABS.length} مختار</span>
                  </div>

                  {/* Quick-fill presets */}
                  <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
                    <span className="text-[11px] text-ink/50 w-full">ملء سريع:</span>
                    {Object.entries(PRESETS).map(([k, p]) => (
                      <button key={k} type="button" onClick={() => applyPreset(k)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${staffModal.role === k ? p.color : "bg-cream border-ink/20 text-ink/60 hover:border-ink/40"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Checkboxes grid */}
                  <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    {ALL_TABS.map(({ key, label, icon }) => {
                      const checked = staffModal.permissions.includes(key);
                      return (
                        <label key={key} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                          checked ? "bg-gold/10 border-gold/40" : "bg-cream border-ink/10 hover:border-ink/25"
                        }`}>
                          <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked ? "bg-gold border-gold" : "border-ink/25"
                          }`}>
                            {checked && <Check className="h-3 w-3 text-ink" />}
                          </div>
                          <input type="checkbox" className="sr-only" checked={checked} onChange={() => togglePerm(key)} />
                          <span className="text-sm">{icon}</span>
                          <span className={`text-xs font-semibold ${checked ? "text-ink" : "text-ink/60"}`}>{label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Select all / clear */}
                  <div className="px-4 pb-3 flex gap-2 border-t border-ink/8 pt-2">
                    <button type="button" onClick={() => setStaffModal(s => ({ ...s, permissions: ALL_TABS.map(t => t.key), role: "admin" }))} className="text-[11px] text-blue-600 hover:underline">تحديد الكل</button>
                    <span className="text-ink/20">|</span>
                    <button type="button" onClick={() => setStaffModal(s => ({ ...s, permissions: [], role: "custom" }))} className="text-[11px] text-red-500 hover:underline">إلغاء الكل</button>
                  </div>
                </div>
                {/* ============================================================ */}
              </div>

              {/* Footer Buttons */}
              <div className="pt-5 border-t border-ink/10 flex justify-end gap-2.5 mt-5">
                <button type="button" onClick={() => setStaffModal(s => ({ ...s, open: false }))} className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink/70 hover:text-ink">إلغاء</button>
                <button type="button" disabled={staffModal.loading} onClick={async () => {
                  setStaffModal(s => ({ ...s, loading: true, error: "" }));
                  try {
                    if (staffModal.mode === "create") {
                      if (!staffModal.username.trim() || !staffModal.displayName.trim() || !staffModal.password) {
                        setStaffModal(s => ({ ...s, loading: false, error: "يرجى تعبئة جميع الحقول المطلوبة" })); return;
                      }
                      const r = await createStaffUserServerFn({ data: {
                        username: staffModal.username,
                        displayName: staffModal.displayName,
                        password: staffModal.password,
                        role: staffModal.role,
                        permissions: staffModal.permissions,
                        createdBy: "admin",
                      }});
                      if (!r?.success) { setStaffModal(s => ({ ...s, loading: false, error: r?.error || "خطأ" })); return; }
                    } else {
                      const upd: any = {
                        username: staffModal.username,
                        role: staffModal.role,
                        permissions: staffModal.permissions,
                        isActive: staffModal.isActive,
                        displayName: staffModal.displayName,
                      };
                      if (staffModal.password) upd.newPassword = staffModal.password;
                      const r = await updateStaffUserServerFn({ data: upd });
                      if (!r?.success) { setStaffModal(s => ({ ...s, loading: false, error: r?.error || "خطأ" })); return; }
                    }
                    setStaffModal(s => ({ ...s, open: false, loading: false }));
                    await loadDbData();
                  } catch (e: any) {
                    setStaffModal(s => ({ ...s, loading: false, error: e?.message || "خطأ غير متوقع" }));
                  }
                }} className="rounded-full gradient-gold px-6 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow disabled:opacity-50">
                  {staffModal.loading ? "جاري الحفظ..." : staffModal.mode === "create" ? "إنشاء الحساب" : "حفظ التعديلات"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: Quick Price & Discount Edit */}
      {quickPriceModal.open && quickPriceModal.product && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gold" />
                <h3 className="font-display font-extrabold text-lg text-ink">تعديل السعر والخصم</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPriceModal({ ...quickPriceModal, open: false })}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-ink mb-4">
              المنتج: <span className="text-rose">{quickPriceModal.product.name}</span>
            </p>

            <form onSubmit={handleSaveQuickPrice} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1">
                  السعر الأصلي الأساسي (ج.م)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickPriceModal.originalPrice}
                  onChange={(e) => {
                    const orig = e.target.value;
                    const origNum = parseFloat(orig) || 0;
                    const newCalculated = quickPriceModal.discountPercent > 0
                      ? Math.round(origNum * (1 - quickPriceModal.discountPercent / 100))
                      : origNum;
                    setQuickPriceModal({
                      ...quickPriceModal,
                      originalPrice: orig,
                      newPrice: String(newCalculated),
                    });
                  }}
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              {/* Quick discount buttons */}
              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                  تطبيق نسبة خصم سريعة:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 10, 15, 20, 25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const base = parseFloat(quickPriceModal.originalPrice) || 0;
                        const newCalculated = pct > 0 ? Math.round(base * (1 - pct / 100)) : base;
                        setQuickPriceModal({
                          ...quickPriceModal,
                          discountPercent: pct,
                          newPrice: String(newCalculated),
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        quickPriceModal.discountPercent === pct
                          ? "gradient-gold text-ink border-gold"
                          : "bg-cream border-ink/15 text-ink/70 hover:bg-ink/5"
                      }`}
                    >
                      {pct === 0 ? "بدون خصم" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1">
                  السعر بعد الخصم (سعر البيع النهائي ج.م) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickPriceModal.newPrice}
                  onChange={(e) =>
                    setQuickPriceModal({ ...quickPriceModal, newPrice: e.target.value })
                  }
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm font-bold text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1">
                  الشارة الترويجية (Badge)
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم 20%، الأكثر مبيعاً، عرض حصري"
                  value={quickPriceModal.badge}
                  onChange={(e) =>
                    setQuickPriceModal({ ...quickPriceModal, badge: e.target.value })
                  }
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ink/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickPriceModal({ ...quickPriceModal, open: false })}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow"
                >
                  حفظ السعر والخصم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Discount Modal on Selected Products */}
      {isBulkDiscountModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-gold" />
                <h3 className="font-display font-extrabold text-lg text-ink">
                  تطبيق خصم جماعي على {selectedIds.length} منتج
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkDiscountModalOpen(false)}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink/70 mb-4 leading-relaxed">
              سيتم حساب السعر الجديد لكل منتج من المنتجات المحددة تلقائياً، والاحتفاظ بالسعر الأصلي وعرض شارة الخصم فوراً في المتجر وقاعدة البيانات.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-2">
                  اختاري نسبة الخصم المرغوبة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20, 25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setBulkDiscountPercent(pct)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        bulkDiscountPercent === pct
                          ? "gradient-gold text-ink border-gold shadow-soft"
                          : "bg-cream border-ink/15 text-ink/70 hover:bg-ink/5"
                      }`}
                    >
                      خصم {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  أو اكتبي نسبة مخصصة (%):
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={bulkDiscountPercent}
                  onChange={(e) => setBulkDiscountPercent(parseInt(e.target.value, 10) || 10)}
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-ink/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkDiscountModalOpen(false)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkDiscount}
                  className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow"
                >
                  تطبيق الخصم على {selectedIds.length} منتج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Category Modal */}
      {isAddCatModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-gold" />
                <h3 className="font-display font-extrabold text-lg text-ink">إضافة قسم جديد للمتجر</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink/60 mb-4 leading-relaxed">
              سيظهر القسم الجديد مباشرة في شريط الأقسام وفلاتر المنتجات في المتجر، وكذلك في قائمة خيارات إضافة وتعديل المنتجات.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  اسم القسم الجديد *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أجهزة العناية بالبشرة، مناكير وأظافر، مجموعات هدايا"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ink/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow"
                >
                  حفظ وإضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Category Name Modal */}
      {editCatModal.open && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <FolderEdit className="h-5 w-5 text-gold" />
                <h3 className="font-display font-extrabold text-lg text-ink">تعديل اسم القسم</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditCatModal({ open: false, oldName: "", newName: "" })}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink/60 mb-4 leading-relaxed">
              سيتم تعديل اسم القسم وتحديث كل المنتجات التابعة له تلقائياً في قاعدة البيانات MongoDB.
            </p>

            <form onSubmit={handleEditCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  الاسم الجديد للقسم *
                </label>
                <input
                  type="text"
                  required
                  value={editCatModal.newName}
                  onChange={(e) => setEditCatModal({ ...editCatModal, newName: e.target.value })}
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ink/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditCatModal({ open: false, oldName: "", newName: "" })}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Bulk Discount on a Specific Category */}
      {catDiscountModal.open && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-gold" />
                <h3 className="font-display font-extrabold text-lg text-ink">
                  خصم على قسم: {catDiscountModal.catName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCatDiscountModal({ open: false, catName: "", percent: 20 })}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink/70 mb-4 leading-relaxed">
              سيتم تطبيق الخصم فوراً على كافة المنتجات التابعة لقسم "
              <strong>{catDiscountModal.catName}</strong>" وحفظ الأسعار الجديدة في MongoDB.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-2">
                  اختاري نسبة الخصم:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20, 25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setCatDiscountModal({ ...catDiscountModal, percent: pct })
                      }
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        catDiscountModal.percent === pct
                          ? "gradient-gold text-ink border-gold shadow-soft"
                          : "bg-cream border-ink/15 text-ink/70 hover:bg-ink/5"
                      }`}
                    >
                      خصم {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  أو اكتبي نسبة مخصصة (%):
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={catDiscountModal.percent}
                  onChange={(e) =>
                    setCatDiscountModal({
                      ...catDiscountModal,
                      percent: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-ink/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCatDiscountModal({ open: false, catName: "", percent: 20 })}
                  className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleApplyCategoryDiscount}
                  className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow"
                >
                  تطبيق الخصم على القسم كاملاً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Full Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 my-8 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-6">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-ink">
                {editingId ? "تعديل بيانات المنتج" : "إضافة منتج جديد لـ كاريشما"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">اسم المنتج *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: أحمر شفاه كاريشما المخملي"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-ink/20 bg-cream/90 px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>

              {/* Dynamic Category & Badge */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-ink/75 block">القسم *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddCatModalOpen(true)}
                      className="text-[11px] text-gold font-bold hover:underline"
                    >
                      + قسم جديد
                    </button>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  >
                    {manageableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink/75 block mb-1">
                    الشارة الترويجية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر مبيعاً، جديد، عرض حصري"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Prices & Discount */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink/75 block mb-1">
                    السعر الحالي (ج.م) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="450 ج.م"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink/75 block mb-1">
                    السعر الأصلي قبل الخصم
                  </label>
                  <input
                    type="text"
                    placeholder="550 ج.م"
                    value={formData.originalPrice || ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink/75 block mb-1">
                    نص الخصم (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="خصم 20% أو وفري 100 ج.م"
                    value={formData.discount || ""}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* 🎁 خيار الباكدج / باقة التوفير */}
              <div className="p-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/5 via-cream to-gold/5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-deep flex items-center justify-center border border-gold/30 shrink-0">
                      <Gift className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span>باكدج / باقة توفير (مجموعة منتجات)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gold/20 text-gold-deep font-semibold">
                          مميز 🎁
                        </span>
                      </p>
                      <p className="text-[11px] text-ink/60">
                        فعلي هذا الخيار إذا كان هذا العرض يحتوي على أكثر من منتج معاً
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isBundle)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isBundle: checked,
                          badge:
                            checked && (!prev.badge || prev.badge === "جديد")
                              ? "باكدج توفير"
                              : prev.badge,
                          category:
                            checked &&
                            prev.category !== "باكدجات وتوفير" &&
                            categories.includes("باكدجات وتوفير")
                              ? "باكدجات وتوفير"
                              : prev.category,
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>

                {formData.isBundle && (
                  <div className="pt-3 border-t border-ink/10 space-y-3">
                    {/* Selected Items Summary & Auto-Price Calculator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/80 border border-gold/30">
                      <div className="flex items-center gap-2 text-xs font-bold text-ink">
                        <Package className="w-4 h-4 text-gold" />
                        <span>المنتجات المحددة:</span>
                        <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold-deep text-xs font-mono">
                          {formData.bundleItems?.length || 0} منتجات
                        </span>
                      </div>
                      {bundleSum > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-ink/70">
                            مجموع الأسعار الفردية:{" "}
                            <strong className="text-ink font-mono">{bundleSum} ج.م</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                originalPrice: `${bundleSum} ج.م`,
                                price: prev.price || `${Math.round(bundleSum * 0.8)} ج.م`,
                                discount: prev.discount || "وفري 20%",
                              }));
                            }}
                            className="text-[11px] font-bold text-gold-deep bg-gold/15 hover:bg-gold/25 px-2.5 py-1 rounded-lg border border-gold/30 transition-colors"
                            title="يضع مجموع أسعار المنتجات في خانة السعر الأصلي ويقترح خصماً تلقائياً"
                          >
                            ⚡ ضبط السعر الأصلي ({bundleSum} ج.م)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Selected Items Badges with remove buttons */}
                    {formData.bundleItems && formData.bundleItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-cream border border-ink/10 max-h-28 overflow-y-auto">
                        {formData.bundleItems.map((bi) => (
                          <span
                            key={bi.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gold/40 text-xs text-ink shadow-2xs"
                          >
                            {bi.image && (
                              <img
                                src={bi.image}
                                alt={bi.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            )}
                            <span className="font-medium text-[11px]">{bi.name}</span>
                            <span className="text-[10px] text-ink/50 font-mono">({bi.price})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const prod = products.find((p) => p.id === bi.id);
                                if (prod) handleToggleBundleItem(prod);
                                else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    bundleItems: (prev.bundleItems || []).filter(
                                      (item) => item.id !== bi.id
                                    ),
                                  }));
                                }
                              }}
                              className="text-rose hover:text-rose-dark font-bold text-xs pr-1"
                              title="إزالة من الباكدج"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search Input for Available Products */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
                      <input
                        type="text"
                        value={bundleSearch}
                        onChange={(e) => setBundleSearch(e.target.value)}
                        placeholder="ابحثي عن منتج لإضافته إلى الباكدج بالاسم أو القسم..."
                        className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl border border-ink/20 bg-white text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    {/* Multi-select product picker list */}
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/15 bg-white divide-y divide-ink/5 p-1">
                      {filteredBundleCandidates.length === 0 ? (
                        <p className="p-3 text-center text-xs text-ink/50">
                          {bundleSearch ? "لا توجد منتجات تطابق البحث" : "لا توجد منتجات إضافية متاحة"}
                        </p>
                      ) : (
                        filteredBundleCandidates.map((prod) => {
                          const isIncluded = (formData.bundleItems || []).some(
                            (item) => item.id === prod.id
                          );
                          return (
                            <label
                              key={prod.id}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                isIncluded
                                  ? "bg-gold/10 text-ink font-semibold"
                                  : "hover:bg-cream/60 text-ink/80"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isIncluded}
                                  onChange={() => handleToggleBundleItem(prod)}
                                  className="h-4 w-4 rounded accent-gold cursor-pointer"
                                />
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-ink/10 shrink-0"
                                />
                                <div className="truncate">
                                  <p className="text-xs text-ink truncate">{prod.name}</p>
                                  <span className="text-[10px] text-ink/50">{prod.category}</span>
                                </div>
                              </div>
                              <div className="text-left shrink-0 pl-1">
                                <span className="text-xs font-bold text-ink font-mono">
                                  {prod.price}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[10px] text-ink/50">
                      💡 عند تحديد منتجات الباكدج، سيظهر للعميل تفصيل كامل لمحتويات الباكدج وأسعارها ومقدار التوفير في صفحة المتجر والنافذة السريعة.
                    </p>
                  </div>
                )}
              </div>

              {/* Image Upload Component (Supports All Formats from Device) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink/80 block">
                    صورة المنتج (جميع الصيغ مدعومة) *
                  </label>
                  {/* Mode selector pills */}
                  <div className="flex items-center gap-1 bg-cream-dark/50 p-1 rounded-xl border border-ink/10">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("file")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        imageUploadMode === "file"
                          ? "bg-gold text-white shadow-sm"
                          : "text-ink/60 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>رفع من الجهاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        imageUploadMode === "url"
                          ? "bg-gold text-white shadow-sm"
                          : "text-ink/60 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>رابط خارجي</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("preset")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        imageUploadMode === "preset"
                          ? "bg-gold text-white shadow-sm"
                          : "text-ink/60 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>نماذج جاهزة</span>
                    </button>
                  </div>
                </div>

                {/* 1. Device File Upload Zone */}
                {imageUploadMode === "file" && (
                  <div>
                    <label
                      htmlFor="admin-file-upload-input"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        isDraggingOver
                          ? "border-gold bg-gold/10 scale-[1.01]"
                          : "border-ink/20 bg-cream/60 hover:border-gold/60 hover:bg-cream"
                      }`}
                    >
                      <input
                        id="admin-file-upload-input"
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.bmp,.heic"
                        className="sr-only"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                      />

                      {isUploadingImage ? (
                        <div className="flex flex-col items-center py-2 text-center">
                          <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
                          <p className="text-xs font-bold text-ink">{uploadProgressMsg || "جاري معالجة ورفع الصورة..."}</p>
                          <span className="text-[10px] text-ink/50 mt-1">يتم تحسين الأبعاد والحفظ التلقائي...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-3 shadow-inner">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-ink mb-1">
                            اضغطي هنا لاختيار صورة من جهازك أو اسحبيها وأفلتيها
                          </p>
                          <p className="text-[11px] text-ink/60">
                            يدعم كافة الصيغ: <span className="font-mono text-gold font-bold">PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC</span>
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* 2. External URL Mode */}
                {imageUploadMode === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-xs text-ink focus:border-gold focus:outline-none font-mono"
                    />
                    <p className="text-[11px] text-ink/50 mt-1">
                      يمكنك لصق رابط مباشر للصورة من Unsplash أو أي موقع آخر.
                    </p>
                  </div>
                )}

                {/* 3. Preset Templates Mode */}
                {imageUploadMode === "preset" && (
                  <div className="p-3 bg-cream rounded-2xl border border-ink/10">
                    <span className="text-[11px] text-ink/60 block mb-2 font-semibold">
                      اختاري صورة نموذجية بنقرة واحدة:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.url })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            formData.image === img.url
                              ? "bg-gold text-white border-gold shadow-sm"
                              : "bg-white border-ink/10 text-ink/70 hover:bg-gold/10"
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Image Preview Bar */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-2.5 bg-cream/80 border border-ink/10 rounded-2xl">
                    <img
                      src={formData.image}
                      alt="معاينة صورة المنتج"
                      className="h-14 w-14 rounded-xl object-cover border border-ink/15 shadow-sm bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم تعيين الصورة الحالية للمنتج</span>
                      </div>
                      <p className="text-[11px] text-ink/60 truncate font-mono mt-0.5" dir="ltr">
                        {formData.image.startsWith("data:") ? "صورة مدمجة (Base64)" : formData.image}
                      </p>
                    </div>
                    <label
                      htmlFor="admin-file-upload-input"
                      onClick={() => setImageUploadMode("file")}
                      className="cursor-pointer px-3 py-1.5 text-xs font-bold rounded-xl bg-ink/5 hover:bg-gold/20 text-ink hover:text-gold transition-all"
                    >
                      تغيير
                    </label>
                  </div>
                )}
              </div>

              {/* Video Upload Component (Supports MP4, WebM, MOV) */}
              <div className="space-y-2 pt-2 border-t border-ink/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-gold" />
                    <label className="text-xs font-semibold text-ink/80 block">
                      فيديو المنتج التوضيحي (اختياري)
                    </label>
                  </div>
                  {/* Video mode switcher */}
                  <div className="flex items-center gap-1 bg-cream-dark/50 p-1 rounded-xl border border-ink/10">
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode("file")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        videoUploadMode === "file"
                          ? "bg-gold text-white shadow-sm"
                          : "text-ink/60 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>رفع فيديو</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode("url")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        videoUploadMode === "url"
                          ? "bg-gold text-white shadow-sm"
                          : "text-ink/60 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>رابط خارجي</span>
                    </button>
                  </div>
                </div>

                {/* 1. Video File Upload Dropzone */}
                {videoUploadMode === "file" && (
                  <div>
                    <label
                      htmlFor="admin-video-upload-input"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsVideoDragOver(true);
                      }}
                      onDragLeave={() => setIsVideoDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsVideoDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleVideoFileUpload(file);
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        isVideoDragOver
                          ? "border-gold bg-gold/10 scale-[1.01]"
                          : "border-ink/20 bg-cream/40 hover:border-gold/60 hover:bg-cream"
                      }`}
                    >
                      <input
                        id="admin-video-upload-input"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="sr-only"
                        disabled={isUploadingVideo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoFileUpload(file);
                        }}
                      />

                      {isUploadingVideo ? (
                        <div className="flex flex-col items-center py-2 text-center">
                          <Loader2 className="w-7 h-7 text-gold animate-spin mb-1.5" />
                          <p className="text-xs font-bold text-ink">{videoProgressMsg || "جاري رفع الفيديو..."}</p>
                          <span className="text-[10px] text-ink/50 mt-0.5">يتم حفظ الفيديو في السيرفر...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-2 shadow-inner">
                            <Video className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-ink mb-0.5">
                            اضغطي هنا لاختيار فيديو من جهازك أو اسحبيه
                          </p>
                          <p className="text-[10px] text-ink/50">
                            مقطع قصير (15-30 ثانية) • صيغ MP4, WebM, MOV حتى 25MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* 2. Video External URL */}
                {videoUploadMode === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/video.mp4 أو /videos/Lipstick.mp4"
                      value={formData.video || ""}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-xs text-ink focus:border-gold focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-ink/50 mt-1">
                      يمكنك لصق رابط مباشر لملف فيديو MP4 أو WebM.
                    </p>
                  </div>
                )}

                {/* Live Video Preview Player */}
                {formData.video && (
                  <div className="p-3 bg-cream/80 border border-ink/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>معاينة فيديو المنتج</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, video: "" })}
                        className="text-[11px] text-rose font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>إزالة الفيديو</span>
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center border border-ink/10">
                      <video
                        src={formData.video}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-ink/50 truncate font-mono" dir="ltr">
                      {formData.video.startsWith("data:") ? "فيديو مدمج (Base64)" : formData.video}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  وصف المنتج ومميزاته *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتبي وصفاً مختصراً وواضحاً لمكونات المنتج وطريقة استخدامه وفوائده..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-ink/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink/70 hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full gradient-gold px-7 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow transition-all"
                >
                  {editingId ? "حفظ التعديلات في MongoDB" : "إضافة المنتج الآن إلى MongoDB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Customer Points */}
      {editPointsModal.open && editPointsModal.customer && (
        <div dir="rtl" className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 text-right">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="font-display font-extrabold text-lg text-ink">تعديل نقاط العميل</h3>
              </div>
              <button type="button" onClick={() => setEditPointsModal({ open: false, customer: null, pts: 0 })} className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center">✕</button>
            </div>
            <p className="text-xs text-ink/70 mb-1">العميل: <strong className="text-ink">{editPointsModal.customer.name}</strong></p>
            <p className="text-xs text-ink/50 font-mono mb-4">{editPointsModal.customer.phone}</p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-ink/75 block mb-1">رصيد النقاط الجديد</label>
              <input
                type="number" min="0"
                value={editPointsModal.pts}
                onChange={(e) => setEditPointsModal({ ...editPointsModal, pts: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-2xl border border-ink/20 bg-cream px-4 py-2.5 text-lg font-bold text-ink focus:border-gold focus:outline-none text-center"
              />
              <p className="text-[11px] text-ink/40 mt-1 text-center">
                الفئة: {editPointsModal.pts >= 5000 ? "💠 بلاتيني" : editPointsModal.pts >= 2000 ? "🥇 ذهبي" : editPointsModal.pts >= 500 ? "🪨 فضي" : "🥉 برونزي"}
              </p>
            </div>
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={() => setEditPointsModal({ open: false, customer: null, pts: 0 })} className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink">إلغاء</button>
              <button type="button" onClick={async () => { await updateCustomerServerFn({ data: { phone: editPointsModal.customer.phone, points: editPointsModal.pts } }).catch(() => {}); setEditPointsModal({ open: false, customer: null, pts: 0 }); await loadDbData(); }} className="rounded-full gradient-gold px-6 py-2 text-xs font-bold text-ink shadow-soft hover:shadow-glow">حفظ النقاط</button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
