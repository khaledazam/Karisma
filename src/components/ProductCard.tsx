import { useEffect, useState } from "react";
import { Heart, ShoppingBag, MessageCircle, Sparkles, Pencil, Play, Film, X, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@/lib/products";

function optimizeImageUrl(url: string, width = 460): string {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    return url
      .replace(/w=\d+/, `w=${width}`)
      .replace(/q=\d+/, "q=75");
  }
  return url;
}

function getUnsplashSrcSet(url: string): string | undefined {
  if (!url || !url.includes("images.unsplash.com")) return undefined;
  const base = url.replace(/w=\d+/, "w=").replace(/q=\d+/, "q=75");
  return `${base.replace("w=", "w=360")} 360w, ${base.replace("w=", "w=480")} 480w, ${base.replace("w=", "w=600")} 600w`;
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  discount,
  image,
  video,
  description,
  badge,
  isBundle,
  bundleItems,
}: Product) {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageScale, setImageScale] = useState(1);
  const [imageOrigin, setImageOrigin] = useState("50% 50%");
  const [addedToast, setAddedToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalMediaTab, setModalMediaTab] = useState<"image" | "video">("image");
  const liked = isWishlisted(id);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setImageScale(1);
      setImageOrigin("50% 50%");
    }
  }, [open]);

  const handleAddWithQuantity = () => {
    for (let i = 0; i < quantity; i += 1) {
      addToCart({ id, name, price, originalPrice, category, image });
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
    setOpen(false);
    setQuantity(1);
  };

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    addToCart({ id, name, price, originalPrice, category, image });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWhatsAppOrder = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    const msg = encodeURIComponent(
      `مرحباً كاريشما - إدارة نسرين الطنطاوي، أود طلب المنتج التالي:\nاسم المنتج: ${name}\nالسعر: ${price}\nالكمية: ${quantity}`,
    );
    window.open(`https://wa.me/201000000000?text=${msg}`, "_blank");
  };

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => Math.min(20, prev + 1));
  const zoomOut = () => setImageScale((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
  const zoomIn = () => setImageScale((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))));
  const resetZoom = () => {
    setImageScale(1);
    setImageOrigin("50% 50%");
  };

  return (
    <>
      <div
        dir="rtl"
        className="group card-luxe shine-sweep rounded-2xl bg-cream border border-ink/8 overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-500 hover:border-gold/40 shadow-soft hover:shadow-luxe"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-4/5 overflow-hidden bg-blush/20">
          <img
            src={optimizeImageUrl(image, 460)}
            srcSet={getUnsplashSrcSet(image)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            alt={name}
            width={400}
            height={500}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Video Hover Preview (Zero network load initially, only streams on hover) */}
          {video && isHovered && (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              suppressHydrationWarning
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover z-2 transition-opacity duration-300 pointer-events-none"
            >
              <track kind="captions" src="" label="بدون صوت" default />
            </video>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-start">
            {isBundle && (
              <span className="px-2.5 py-1 rounded-full bg-ink/90 text-gold text-[10px] font-bold shadow-md flex items-center gap-1 border border-gold/40">
                <Package className="h-3 w-3 text-gold" />
                باكدج توفير ({bundleItems?.length || 0})
              </span>
            )}
            {badge && (
              <span className="px-3 py-1 rounded-full gradient-gold text-[10px] font-bold text-ink shadow-xs">
                {badge}
              </span>
            )}
            {discount && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose text-white text-[10px] font-semibold shadow-xs">
                {discount}
              </span>
            )}
          </div>

          {/* Video Indicator Badge */}
          {video && (
            <div className="absolute top-3 left-14 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold shadow-md pointer-events-none">
              <Play className="w-2.5 h-2.5 text-gold fill-gold" />
              <span>فيديو توضيحي</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleWishlist({ id, name, category, price, originalPrice, image });
            }}
            className={`absolute top-3 left-3 z-10 h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
              liked
                ? "border-rose/50 bg-rose/20 text-rose scale-110"
                : "border-ink/10 bg-cream/80 text-ink/60 hover:text-rose hover:bg-cream"
            }`}
            aria-label={liked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          </button>

          {/* Admin quick edit button */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-28 z-10 h-9 w-9 rounded-full bg-cream/95 border border-gold/50 text-gold-deep flex items-center justify-center hover:scale-110 shadow-soft transition-all"
              title="تعديل هذا المنتج في لوحة التحكم"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Hover Action Bar */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
            <div className="rounded-xl border border-cream/70 bg-cream/90 backdrop-blur-md p-1.5 shadow-md flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleQuickAdd}
                className="flex-1 h-9 rounded-lg gradient-gold text-ink text-xs font-bold flex items-center justify-center gap-1.5 hover:shadow-soft transition-all"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                اطلبي الآن
              </button>
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="h-9 w-9 rounded-lg border border-emerald-600/30 bg-emerald-500/10 text-emerald-800 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                title="طلب فوري عبر واتساب"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 text-right">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-medium text-rose uppercase tracking-wider">{category}</span>
            {addedToast && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-bounce">
                تمت الإضافة للسلة!
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-ink leading-snug group-hover:text-gold-deep transition-colors line-clamp-1">
            {name}
          </h3>

          <p className="mt-2 text-xs text-ink/65 leading-relaxed font-light line-clamp-2">
            {description}
          </p>

          <div className="mt-4 pt-3 border-t border-ink/8 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-xl text-ink">{price}</span>
              {originalPrice && (
                <span className="text-xs text-ink/40 line-through font-mono">{originalPrice}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="text-xs font-bold text-rose hover:text-gold-deep flex items-center gap-1 transition-colors"
            >
              اطلبي الآن
              <span aria-hidden className="text-sm">←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {open && (
        <div
          dir="rtl"
          className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-6 transition-opacity"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            aria-label="إغلاق تفاصيل المنتج"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-cream border border-ink/10 shadow-luxe overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Floating close button for mobile */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="md:hidden absolute top-3 left-3 z-40 h-8 w-8 rounded-full bg-cream/90 backdrop-blur-md border border-ink/20 shadow-md text-ink flex items-center justify-center hover:bg-cream transition-transform active:scale-95"
              aria-label="إغلاق النافذة"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Product Media Area (Images or Video) */}
              {video && modalMediaTab === "video" ? (
                <div className="relative h-64 sm:h-80 md:h-full md:min-h-120 bg-black flex items-center justify-center overflow-hidden">
                  {/* Media Switcher Tab */}
                  <div className="absolute top-3 right-3 md:right-auto md:left-3 z-30 flex items-center gap-1 bg-cream/90 backdrop-blur-md p-1 rounded-2xl border border-ink/15 shadow-soft">
                    <button
                      type="button"
                      onClick={() => setModalMediaTab("image")}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-ink/70 hover:text-ink transition-all"
                    >
                      📷 الصور
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalMediaTab("video")}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-gold text-white shadow-xs transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>فيديو التجربة</span>
                    </button>
                  </div>

                  <video
                    src={video}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    suppressHydrationWarning
                    aria-label={`فيديو توضيحي لمنتج ${name}`}
                    className="w-full h-full object-contain max-h-[75vh]"
                  >
                    <track kind="captions" src="" label="بدون صوت" default />
                  </video>
                  <div className="absolute bottom-3 right-3 pointer-events-none bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-gold" />
                    <span>فيديو طريقة الاستخدام والتجربة</span>
                  </div>
                </div>
              ) : (
                <div
                  className="relative h-64 sm:h-80 md:h-full md:min-h-120 bg-blush/20 overflow-hidden"
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const x = ((event.clientX - rect.left) / rect.width) * 100;
                    const y = ((event.clientY - rect.top) / rect.height) * 100;
                    setImageOrigin(`${x}% ${y}%`);
                  }}
                  onMouseLeave={() => {
                    setImageOrigin("50% 50%");
                  }}
                  onWheel={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setImageScale((prev) => {
                      const next = prev - event.deltaY * 0.002;
                      return Math.max(1, Math.min(3, Number(next.toFixed(2))));
                    });
                  }}
                >
                  {/* Media Switcher Tab (if video is available) */}
                  {video && (
                    <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-cream/90 backdrop-blur-md p-1 rounded-2xl border border-ink/15 shadow-soft">
                      <button
                        type="button"
                        onClick={() => setModalMediaTab("image")}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-gold text-white shadow-xs transition-all"
                      >
                        📷 الصور
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalMediaTab("video")}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-ink/70 hover:text-ink transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>فيديو التجربة</span>
                      </button>
                    </div>
                  )}

                  {/* Zoom Controls */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream/85 px-2.5 py-1 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={zoomOut}
                      className="h-7 w-7 rounded-full border border-ink/20 text-ink hover:bg-ink/5 flex items-center justify-center"
                      aria-label="تصغير الصورة"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-mono text-ink/75 min-w-9 text-center">
                      {Math.round(imageScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={zoomIn}
                      className="h-7 w-7 rounded-full border border-ink/20 text-ink hover:bg-ink/5 flex items-center justify-center"
                      aria-label="تكبير الصورة"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={resetZoom}
                      className="rounded-full border border-ink/20 px-2 py-0.5 text-[10px] text-ink/70 hover:text-ink font-medium"
                      aria-label="إعادة ضبط حجم الصورة"
                    >
                      إعادة ضبط
                    </button>
                  </div>

                  <img
                    src={optimizeImageUrl(image, 900)}
                    alt={name}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 cursor-zoom-in"
                    style={{ transform: `scale(${imageScale})`, transformOrigin: imageOrigin }}
                    title="حركي المؤشر للفحص، استخدمي العجلة للتكبير"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between text-right">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-rose font-bold">
                      {category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="hidden md:flex h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 items-center justify-center"
                      aria-label="إغلاق"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="mt-2 sm:mt-3 font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-ink leading-tight">
                    {name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                    <span className="font-display font-black text-2xl sm:text-3xl text-ink">{price}</span>
                    {originalPrice && (
                      <span className="text-base text-ink/40 line-through font-mono">
                        {originalPrice}
                      </span>
                    )}
                    {discount && (
                      <span className="px-2 py-0.5 rounded-full bg-rose/15 text-rose text-xs font-semibold">
                        {discount}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 w-12 gold-line" />

                  <p className="mt-5 text-ink/80 text-sm leading-relaxed font-light">
                    {description}
                  </p>

                  {/* Bundle Contents Preview if this is a package */}
                  {isBundle && bundleItems && bundleItems.length > 0 && (
                    <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gold/10 border border-gold/30">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-gold-deep" />
                          <span className="font-display font-bold text-xs text-ink">
                            محتويات الباكدج ({bundleItems.length} منتجات في البوكس):
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-rose bg-rose/15 px-2 py-0.5 rounded-full">
                          توفير فوري
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pl-1">
                        {bundleItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-cream/90 border border-ink/8 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-8 w-8 rounded-lg object-cover bg-blush/20 shrink-0"
                                />
                              )}
                              <span className="font-medium text-ink truncate text-[11px] sm:text-xs">
                                {item.name}
                              </span>
                            </div>
                            {item.price && (
                              <span className="font-mono text-[11px] font-bold text-ink/70 shrink-0">
                                {item.price}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-3.5 rounded-2xl bg-cream/70 border border-ink/10 text-xs text-ink/75 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>منتج أصلي 100% تم اختياره بعناية فائقة.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose font-bold">✓</span>
                      <span>توصيل سريع متاح لكافة محافظات جمهورية مصر العربية.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-ink/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium text-ink">الكمية:</span>
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="h-8 w-8 rounded-full border border-ink/20 text-lg text-ink flex items-center justify-center hover:bg-ink/5"
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-base font-bold text-ink">{quantity}</span>
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="h-8 w-8 rounded-full border border-ink/20 text-lg text-ink flex items-center justify-center hover:bg-ink/5"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddWithQuantity}
                      className="flex-1 rounded-full gradient-gold py-3 px-6 text-xs uppercase tracking-wider font-bold text-ink shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      أضيفي {quantity} إلى السلة
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="rounded-full border border-emerald-600/40 bg-emerald-500/10 text-emerald-800 py-3 px-5 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      طلب عبر واتساب
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
