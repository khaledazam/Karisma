import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ShoppingBag, Menu, X, Search, Heart, MessageCircle, Sparkles, User, Settings, LogOut, LogIn, CheckCircle2, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { LoginModal } from "./LoginModal";
import { NesrinLogo } from "./NesrinLogo";
import { submitCustomerOrderServerFn } from "@/lib/server-actions";

const EGYPT_GOVERNORATES = [
  "القاهرة","الجيزة","الإسكندرية","القليوبية","الدقهلية","الشرقية",
  "الغربية","المنوفية","البحيرة","كفر الشيخ","دمياط","بورسعيد",
  "الإسماعيلية","السويس","الفيوم","بني سويف","المنيا","أسيوط",
  "سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","مطروح",
];

const navLinks = [
  { to: "/", label: "الرئيسية" },
  { to: "/shop", label: "المنتجات" },
  { to: "/#categories", label: "الأقسام" },
  { to: "/about", label: "من نحن" },
  { to: "/#offers", label: "العروض" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Quick Order Form inside Cart Drawer
  const [cartStep, setCartStep] = useState<"cart" | "form" | "done">("cart");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderId: string; whatsappUrl: string } | null>(null);
  const [quickForm, setQuickForm] = useState({
    fullName: "",
    phone: "",
    backupPhone: "",
    governorate: "القاهرة",
    detailedAddress: "",
    notes: "",
  });

  const { isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const { items, itemCount, addToCart, decrementFromCart, removeFromCart, clearCart } = useCart();
  const { items: wishlistItems, itemCount: wishlistCount, removeWishlistItem, clearWishlist } = useWishlist();

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const raw = item.price.replace(/,/g, "").replace(/[^\d.]/g, "");
      const amount = Number(raw) || 0;
      return sum + amount * item.quantity;
    }, 0);
  }, [items]);

  const shipping = items.length > 0 ? (totalPrice >= 1000 ? 0 : 50) : 0;
  const orderTotal = totalPrice + shipping;

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.fullName.trim() || !quickForm.phone.trim() || !quickForm.detailedAddress.trim()) return;
    setIsSubmittingOrder(true);
    try {
      const res = await submitCustomerOrderServerFn({
        data: {
          fullName: quickForm.fullName.trim(),
          phone: quickForm.phone.trim(),
          backupPhone: quickForm.backupPhone?.trim() || undefined,
          governorate: quickForm.governorate,
          detailedAddress: quickForm.detailedAddress.trim(),
          notes: quickForm.notes?.trim() || undefined,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          total: orderTotal,
        },
      });
      if (res?.success && res.orderId) {
        setOrderResult({ orderId: res.orderId, whatsappUrl: "" });
        clearCart();
        setCartStep("done");
      }
    } catch (err) {
      console.warn("Quick order error:", err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.includes(searchQuery.trim()) ||
          p.category.includes(searchQuery.trim()) ||
          p.description.includes(searchQuery.trim()),
      )
    : [];

  return (
    <>
      {/* Main floating header */}
      <header className="fixed inset-x-0 z-50 top-3 transition-all duration-500" dir="rtl">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div
            className={`nav-shell relative overflow-hidden transition-all duration-500 ${
              scrolled
                ? "rounded-[1.6rem] bg-cream/95 border border-pink/20 shadow-luxe px-3 sm:px-5 py-2.5"
                : "rounded-[2rem] bg-cream/85 border border-baby-blue/30 shadow-soft px-4 sm:px-6 py-3"
            }`}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 nav-aurora opacity-60" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/85 to-transparent nav-sheen"
            />

            <div className="relative z-10 flex items-center justify-between gap-2 md:gap-5">
              {/* PRIMARY OFFICIAL BRAND LOGO */}
              <Link to="/" className="group relative flex items-center shrink-0">
                <NesrinLogo size="md" />
              </Link>

              {/* DESKTOP NAV */}
              <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
                {navLinks.map((item, index) => (
                  <NavLink key={item.label} to={item.to} label={item.label} index={index} />
                ))}
              </nav>

              {/* ACTION BUTTONS & ICONS */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <IconBtn
                  label="البحث عن منتج"
                  onClick={() => setSearchOpen(true)}
                  title="بحث"
                >
                  <Search className="h-4 w-4" />
                </IconBtn>

                <IconBtn
                  label="المفضلة"
                  badge={wishlistCount > 0 ? `${wishlistCount}` : undefined}
                  onClick={() => {
                    setWishlistOpen(true);
                    setCartOpen(false);
                    setOpen(false);
                  }}
                  className="hidden sm:inline-flex border-rose/25 bg-rose/10 text-rose hover:border-rose/45 hover:bg-rose/20"
                  title="المفضلة"
                >
                  <Heart className="h-4 w-4" />
                </IconBtn>

                <IconBtn
                  label="سلة التسوق"
                  badge={itemCount > 0 ? `${itemCount}` : undefined}
                  onClick={() => {
                    setCartOpen(true);
                    setWishlistOpen(false);
                    setOpen(false);
                  }}
                  title="سلة التسوق"
                >
                  <ShoppingBag className="h-4 w-4" />
                </IconBtn>

                {/* Primary CTA: تسوقي الآن */}
                <Link
                  to="/shop"
                  search={{ category: "الكل" }}
                  className="hidden lg:inline-flex items-center justify-center rounded-full gradient-gold px-4 py-2 text-xs uppercase tracking-wider font-semibold text-ink shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
                >
                  تسوقي الآن
                </Link>

                {/* Admin / Login Button */}
                {isAdmin ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-gold/25 transition-all"
                      title="لوحة تحكم كاريشما"
                    >
                      <Settings className="h-3.5 w-3.5 text-gold-deep animate-spin-slow" />
                      <span className="hidden sm:inline">لوحة التحكم</span>
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="h-8 w-8 rounded-full border border-rose/30 text-rose hover:bg-rose/10 flex items-center justify-center transition-colors"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream/80 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-gold hover:text-gold-deep hover:bg-cream transition-all"
                    title="تسجيل دخول الإدارة لتعديل المنتجات"
                  >
                    <LogIn className="h-3.5 w-3.5 text-gold-deep" />
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </button>
                )}

                {/* Mobile hamburger menu */}
                <button
                  aria-label="القائمة"
                  className="xl:hidden h-9 w-9 rounded-2xl border border-ink/15 bg-cream/80 hover:bg-cream text-ink flex items-center justify-center transition-all duration-300"
                  onClick={() => {
                    setOpen((v) => !v);
                    setCartOpen(false);
                    setWishlistOpen(false);
                  }}
                >
                  {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (RTL) */}
      <div
        dir="rtl"
        className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-[88vw] sm:w-[85%] max-w-sm bg-cream shadow-luxe transition-transform duration-500 overflow-y-auto ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="absolute inset-0 nav-aurora opacity-40 pointer-events-none" aria-hidden />
          <div className="relative p-6 pt-20">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-6">
              <NesrinLogo size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full border border-ink/15 flex items-center justify-center text-ink"
                aria-label="إغلاق القائمة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to as any}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between py-3.5 border-b border-ink/10 text-ink hover:text-rose transition-colors"
                >
                  <span className="font-display text-lg font-medium">{item.label}</span>
                  <span className="text-xs font-mono text-gold/80">0{i + 1}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setWishlistOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-rose/30 bg-rose/10 text-rose py-2.5 text-xs font-bold sm:hidden"
              >
                <Heart className="h-4 w-4" />
                المفضلة {wishlistCount > 0 ? `(${wishlistCount})` : ""}
              </button>

              <Link
                to="/shop"
                search={{ category: "الكل" }}
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full gradient-gold py-3 text-xs uppercase tracking-wider font-semibold text-ink shadow-soft"
              >
                تسوقي الآن
              </Link>

              {isAdmin ? (
                <div className="space-y-2">
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/15 text-ink py-2.5 text-xs font-bold"
                  >
                    <Settings className="h-4 w-4 text-gold-deep" />
                    لوحة التحكم وتعديل المنتجات
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-rose/30 bg-rose/10 text-rose py-2 text-xs font-semibold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 bg-cream py-2.5 text-xs font-semibold text-ink hover:border-gold"
                >
                  <LogIn className="h-4 w-4 text-gold-deep" />
                  تسجيل دخول المشرف
                </button>
              )}

              <a
                href="https://wa.me/201000000000?text=مرحباً، أود الاستفسار عن منتجات كاريشما - نسرين الطنطاوي"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-500/10 text-emerald-800 py-2.5 text-xs font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل سريع عبر واتساب
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10 text-center">
              <p className="text-xs text-ink/60">كاريشما — إدارة نسرين الطنطاوي</p>
              <p className="text-[11px] text-ink/40 mt-1">منتجات أصلية وتوصيل لجميع المحافظات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-70 flex items-start justify-center pt-24 px-4 bg-ink/50 backdrop-blur-sm transition-opacity"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-cream border border-ink/10 p-6 shadow-luxe relative">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="font-display text-xl font-bold text-ink">البحث في منتجات كاريشما</h3>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="h-8 w-8 rounded-full border border-ink/15 text-ink flex items-center justify-center hover:bg-ink/5"
                aria-label="إغلاق نافذة البحث"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4">
              <input
                type="text"
                autoFocus
                placeholder="ابحثي عن روج، فاونديشن، سيروم، ماسك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-ink/20 bg-cream/90 px-4 py-3.5 pr-11 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
              />
              <Search className="absolute right-4 top-4 h-4 w-4 text-ink/50" />
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="py-6 text-center text-sm text-ink/60">
                  لم نجد نتائج مطابقة لـ "{searchQuery}". جربي البحث بكلمة أخرى.
                </p>
              )}
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl p-3 border border-ink/10 hover:bg-ink/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-display font-medium text-sm text-ink">{product.name}</p>
                      <p className="text-xs text-rose font-medium mt-0.5">{product.price}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product);
                      setSearchOpen(false);
                      setCartOpen(true);
                    }}
                    className="rounded-full gradient-gold px-3.5 py-1.5 text-[11px] font-medium text-ink"
                  >
                    أضيفي للسلة
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist drawer (RTL) */}
      <div
        dir="rtl"
        className={`fixed inset-0 z-60 transition-opacity duration-300 ${
          wishlistOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-ink/30" onClick={() => setWishlistOpen(false)} />
        <aside
          className={`absolute left-0 top-0 h-full w-[92vw] sm:w-[85vw] max-w-md bg-cream shadow-luxe transition-transform duration-500 ${
            wishlistOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-rose/20 bg-rose/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-rose font-bold">قائمة رغباتك المفضلة</p>
                <p className="mt-1 text-sm text-ink/70">{wishlistCount} منتج محفوظ</p>
              </div>
              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                className="h-9 w-9 rounded-full border border-rose/25 text-rose hover:bg-rose/10 flex items-center justify-center"
                aria-label="إغلاق المفضلة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="h-10 w-10 text-rose/40 mx-auto mb-3" />
                  <p className="text-base font-display font-medium text-ink">قائمتك المفضلة فارغة</p>
                  <p className="text-xs text-ink/60 mt-1">اضغطي على رمز القلب في المنتجات التي تعجبك لحفظها هنا.</p>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-rose/20 p-3 bg-rose/5">
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover bg-blush/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base font-bold leading-tight text-ink truncate">{item.name}</p>
                        <p className="mt-1 text-[11px] text-rose">{item.category}</p>
                        <p className="mt-1 text-xs font-bold text-ink">{item.price}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="rounded-full border border-rose/30 bg-rose/15 px-3 py-1 text-xs text-rose font-medium hover:bg-rose/25 transition-colors"
                          >
                            أضيفي للسلة
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWishlistItem(item.id)}
                            className="mr-auto text-xs text-ink/60 hover:text-ink transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {wishlistItems.length > 0 && (
              <div className="border-t border-rose/20 px-6 py-5 bg-rose/5">
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="w-full rounded-full border border-rose/25 px-4 py-2.5 text-xs text-rose hover:bg-rose/10 font-medium transition-colors"
                >
                  إفراغ قائمة المفضلة
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Cart drawer (RTL) */}
      <div
        dir="rtl"
        className={`fixed inset-0 z-60 transition-opacity duration-300 ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-ink/35 backdrop-blur-xs" onClick={() => setCartOpen(false)} />
        <aside
          className={`absolute left-0 top-0 h-full w-[92vw] sm:w-[85vw] max-w-md bg-cream shadow-luxe transition-transform duration-500 ${
            cartOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-rose font-bold">سلة المشتريات</p>
                <p className="mt-1 text-sm text-ink/70">{itemCount} قطعة مختارة</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="h-9 w-9 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
                aria-label="إغلاق السلة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="h-12 w-12 text-ink/20 mx-auto mb-4" />
                  <p className="font-display text-lg font-bold text-ink">سلة التسوق فارغة</p>
                  <p className="mt-1 text-xs text-ink/60">تصفحي تشكيلة كاريشما واختاري منتجاتك المفضلة.</p>
                  <Link
                    to="/shop"
                    search={{ category: "الكل" }}
                    onClick={() => setCartOpen(false)}
                    className="mt-6 inline-flex rounded-full gradient-gold px-6 py-2.5 text-xs font-semibold text-ink"
                  >
                    ابدئي التسوق الآن
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-ink/10 p-3 bg-cream/70">
                    <div className="flex gap-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-blush/40" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base font-bold leading-tight text-ink truncate">{item.name}</p>
                        <p className="mt-1 text-xs font-bold text-rose">{item.price}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementFromCart(item.id)}
                            className="h-7 w-7 rounded-full border border-ink/20 text-ink flex items-center justify-center hover:bg-ink/5"
                            aria-label="إنقاص الكمية"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold text-ink w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="h-7 w-7 rounded-full border border-ink/20 text-ink flex items-center justify-center hover:bg-ink/5"
                            aria-label="زيادة الكمية"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="mr-auto text-xs text-ink/60 hover:text-rose transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Step: Items list */}
            {cartStep === "cart" && items.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5 bg-cream/90 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-ink/70 font-medium">المجموع</p>
                  <p className="font-display text-xl font-bold text-ink">{orderTotal.toLocaleString("ar-EG")} ج.م</p>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-ink/50">الشحن: {shipping} ج.م — مجاني عند الطلب فوق 1000 ج.م</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-4 py-2.5 rounded-full border border-ink/20 text-xs text-ink/70 hover:text-ink font-medium"
                  >
                    تفريغ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartStep("form")}
                    className="flex-1 rounded-full gradient-gold py-2.5 text-xs uppercase tracking-wider font-bold text-ink shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    اطلب الآن 🛍️
                  </button>
                </div>
              </div>
            )}

            {/* Cart Step: Quick Order Form */}
            {cartStep === "form" && (
              <div className="border-t border-ink/10 bg-cream/95 flex-shrink-0">
                <div className="flex items-center gap-2 px-6 py-3 border-b border-ink/8">
                  <button
                    type="button"
                    onClick={() => setCartStep("cart")}
                    className="text-ink/50 hover:text-ink transition-colors"
                  >
                    ← رجوع
                  </button>
                  <p className="text-xs font-bold text-ink">بيانات الطلب والتوصيل</p>
                </div>
                <form onSubmit={handleQuickOrderSubmit} className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-ink/70 block mb-1">الاسم بالكامل *</label>
                    <input
                      required
                      type="text"
                      placeholder="مثال: سارة أحمد"
                      value={quickForm.fullName}
                      onChange={(e) => setQuickForm({ ...quickForm, fullName: e.target.value })}
                      className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                  {/* Phones */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-ink/70 block mb-1">الهاتف *</label>
                      <input
                        required
                        type="tel"
                        placeholder="010XXXXXXXX"
                        value={quickForm.phone}
                        onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                        className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-ink/70 block mb-1">هاتف بديل</label>
                      <input
                        type="tel"
                        placeholder="011XXXXXXXX"
                        value={quickForm.backupPhone}
                        onChange={(e) => setQuickForm({ ...quickForm, backupPhone: e.target.value })}
                        className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Governorate */}
                  <div>
                    <label className="text-[11px] font-semibold text-ink/70 block mb-1">المحافظة *</label>
                    <select
                      value={quickForm.governorate}
                      onChange={(e) => setQuickForm({ ...quickForm, governorate: e.target.value })}
                      className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                    >
                      {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  {/* Detailed Address */}
                  <div>
                    <label className="text-[11px] font-semibold text-ink/70 block mb-1">العنوان بالتفصيل *</label>
                    <input
                      required
                      placeholder="الحي، الشارع، رقم العمارة والشقة"
                      value={quickForm.detailedAddress}
                      onChange={(e) => setQuickForm({ ...quickForm, detailedAddress: e.target.value })}
                      className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                  {/* Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-ink/70 block mb-1">ملاحظات (اختياري)</label>
                    <input
                      placeholder="ملاحظات للتوصيل..."
                      value={quickForm.notes}
                      onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
                      className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-[11px] text-ink/50 mb-2 text-center">الإجمالي: <strong>{orderTotal.toLocaleString("ar-EG")} ج.م</strong> — الدفع عند الاستلام</p>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full rounded-full gradient-gold py-3 text-xs font-bold text-ink shadow-soft hover:shadow-glow disabled:opacity-50 transition-all"
                    >
                      {isSubmittingOrder ? "جاري إرسال الطلب..." : "✅ تأكيد وإرسال الطلب"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Cart Step: Order confirmed */}
            {cartStep === "done" && orderResult && (
              <div className="border-t border-ink/10 px-6 py-6 bg-emerald-50/80 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="font-display font-bold text-lg text-ink">تم استلام طلبك! 🎉</p>
                <p className="text-xs text-ink/70">رقم الطلب: <strong className="font-mono">#{orderResult.orderId.slice(-6).toUpperCase()}</strong></p>
                <p className="text-xs text-ink/60">تم تسجيل طلبك بنجاح — سيتواصل معك فريقنا قريباً لتأكيد التوصيل.</p>
                <button
                  type="button"
                  onClick={() => { setCartStep("cart"); setOrderResult(null); setQuickForm({ fullName: "", phone: "", backupPhone: "", governorate: "القاهرة", detailedAddress: "", notes: "" }); setCartOpen(false); }}
                  className="block w-full rounded-full gradient-gold py-2.5 text-xs font-bold text-ink shadow-soft mt-2"
                >
                  إغلاق ومتابعة التسوق
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Admin Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          navigate({ to: "/admin" });
        }}
      />
    </>
  );
}

function NavLink({
  to,
  label,
  index,
}: {
  to: string;
  label: string;
  index: number;
}) {
  return (
    <Link
      to={to as any}
      className="nav-link-enter group relative rounded-xl border border-transparent px-3 py-1.5 text-xs font-medium text-ink/80 hover:text-ink transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="relative z-10">{label}</span>
      <span className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

function IconBtn({
  children,
  label,
  badge,
  onClick,
  className = "",
  title,
}: {
  children: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title || label}
      onClick={onClick}
      className={`relative h-9 w-9 rounded-xl border border-ink/10 bg-cream/75 text-ink/80 hover:text-ink hover:-translate-y-0.5 hover:border-gold/45 hover:bg-cream flex items-center justify-center transition-all duration-300 ${className}`}
    >
      {children}
      {badge && (
        <span className="absolute -top-1 -left-1 h-4 min-w-4 px-1 rounded-full gradient-gold text-[9px] font-bold text-ink flex items-center justify-center pulse-glow">
          {badge}
        </span>
      )}
    </button>
  );
}
