import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/hooks/use-cart";
import { CheckCircle2, Truck, ShieldCheck, Sparkles, Database, Phone, MapPin, User } from "lucide-react";
import { submitCustomerOrderServerFn } from "@/lib/server-actions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — كاريشما | Karisma — نسرين الطنطاوي" },
      {
        name: "description",
        content: "أدخلي بيانات الشحن والتوصيل لإتمام طلبك من كاريشما برعاية وإدارة نسرين الطنطاوي والدفع عند الاستلام.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/checkout",
      },
    ],
  }),
  component: CheckoutPage,
});

const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "مطروح",
];

function CheckoutPage() {
  const { items, itemCount, addToCart, decrementFromCart, removeFromCart, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    fullName: "",
    phone: "",
    backupPhone: "",
    governorate: "القاهرة",
    detailedAddress: "",
    notes: "",
  });

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const raw = item.price.replace(/,/g, "").replace(/[^\d.]/g, "");
      const amount = Number(raw) || 0;
      return sum + amount * item.quantity;
    }, 0);
  }, [items]);

  const shipping = itemCount > 0 ? (subtotal >= 1000 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  const onSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (itemCount === 0 || isSubmitting) {
      return;
    }

    if (!orderDetails.fullName.trim() || !orderDetails.phone.trim() || !orderDetails.detailedAddress.trim()) {
      alert("يرجى ملء الاسم ورقم الهاتف والعنوان بالتفصيل لإتمام الطلب");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      fullName: orderDetails.fullName.trim(),
      phone: orderDetails.phone.trim(),
      backupPhone: orderDetails.backupPhone?.trim() || undefined,
      governorate: orderDetails.governorate,
      detailedAddress: orderDetails.detailedAddress.trim(),
      notes: orderDetails.notes?.trim() || undefined,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      total,
    };

    try {
      const res = await submitCustomerOrderServerFn({ data: orderPayload });
      if (res && res.success && res.orderId) {
        setCreatedOrderId(res.orderId);
      }
    } catch (err) {
      console.warn("MongoDB order sync notification:", err);
    } finally {
      setIsSubmitting(false);
      clearCart();
      setOrdered(true);
    }
  };

  return (
    <SiteLayout>
      <section className="pt-32 sm:pt-44 pb-16 sm:pb-24" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Form or Confirmation */}
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">
              خطوة إتمام الشراء
            </p>
            <h1 className="mt-2 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink leading-tight">
              تأكيد بيانات <span className="text-gradient-gold">الطلب والتوصيل</span>
            </h1>

            {ordered ? (
              <div className="mt-6 sm:mt-8 rounded-3xl border border-pink/40 bg-pink-light/20 p-5 sm:p-8 text-right space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose">
                    <CheckCircle2 className="h-6 w-6" />
                    <p className="text-xs uppercase tracking-widest font-bold">تم تأكيد طلبك وحفظه بنجاح!</p>
                  </div>
                  {createdOrderId && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-xs font-bold font-mono">
                      <Database className="h-3 w-3" />
                      #{createdOrderId.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>

                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  شكراً لكِ! جاري تحضير طلبكِ في كاريشما بإشراف نسرين الطنطاوي.
                </h2>
                <p className="text-sm text-ink/75 leading-relaxed font-light">
                  تم تسجيل بيانات طلبكِ في قاعدة البيانات، وسيتواصل معكِ مندوب خدمة العملاء هاتفياً أو عبر واتساب لتأكيد موعد الشحن والتسليم. الدفع يتم عند الاستلام بعد معاينة طلبكِ.
                </p>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    search={{ category: "الكل" }}
                    className="inline-flex rounded-full gradient-gold px-5 py-2.5 text-xs font-bold text-ink shadow-soft hover:shadow-glow transition-all"
                  >
                    متابعة التسوق
                  </Link>
                </div>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={onSubmitOrder}>
                {/* 1. Full Name */}
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    الاسم بالكامل *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: سارة أحمد محمود"
                    value={orderDetails.fullName}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, fullName: e.target.value })
                    }
                    className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                {/* 2. Phone & Optional Backup Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                      رقم الهاتف الأساسي *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="010XXXXXXXX"
                      value={orderDetails.phone}
                      onChange={(e) =>
                        setOrderDetails({ ...orderDetails, phone: e.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                      رقم هاتف بديل (اختياري)
                    </label>
                    <input
                      type="tel"
                      placeholder="011XXXXXXXX (اختياري)"
                      value={orderDetails.backupPhone}
                      onChange={(e) =>
                        setOrderDetails({ ...orderDetails, backupPhone: e.target.value })
                      }
                      className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Governorate */}
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    المحافظة *
                  </label>
                  <select
                    value={orderDetails.governorate}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, governorate: e.target.value })
                    }
                    className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Detailed Address */}
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    العنوان بالتفصيل (المدينة، الحي، اسم الشارع، رقم العمارة أو علامة مميزة) *
                  </label>
                  <input
                    required
                    placeholder="مثال: المعادي الجديدة، شارع النصر، عمارة 15 الدور الرابع شقة 4"
                    value={orderDetails.detailedAddress}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, detailedAddress: e.target.value })
                    }
                    className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                {/* 5. Additional Notes */}
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    ملاحظات إضافية للتوصيل (اختياري)
                  </label>
                  <input
                    placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
                    value={orderDetails.notes}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, notes: e.target.value })
                    }
                    className="h-12 w-full rounded-2xl border border-ink/15 bg-cream px-4 text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Payment method note */}
                <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 flex items-center gap-3 text-xs text-ink/80">
                  <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
                  <span>طريقة الدفع: الدفع نقداً عند الاستلام بعد فحص ومعاينة المنتجات.</span>
                </div>

                <button
                  type="submit"
                  disabled={itemCount === 0 || isSubmitting}
                  className="w-full rounded-full gradient-gold py-3.5 text-xs uppercase tracking-wider font-bold text-ink shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting
                    ? "جاري تسجيل وتوجيه طلبك..."
                    : `تأكيد وإرسال الطلب (${total.toLocaleString("ar-EG")} ج.م) — الدفع عند الاستلام 🛍️`}
                </button>
              </form>
            )}
          </div>

          {/* Order Summary Aside */}
          <aside className="lg:col-span-5 rounded-3xl border border-ink/10 bg-cream/80 p-6 h-fit text-right">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">ملخص السلة</p>
            <div className="mt-5 space-y-3 max-h-96 overflow-y-auto pl-1">
              {items.length === 0 ? (
                <p className="text-xs text-ink/60 py-6 text-center">سلة المشتريات فارغة حالياً.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-ink/8 p-3 bg-cream">
                    <div className="flex gap-3">
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-ink truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-rose">{item.price}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementFromCart(item.id)}
                            className="h-6 w-6 rounded-full border border-ink/20 text-ink flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="h-6 w-6 rounded-full border border-ink/20 text-ink flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="mr-auto text-[11px] text-ink/50 hover:text-rose transition-colors"
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

            <div className="mt-6 border-t border-ink/10 pt-4 space-y-2 text-xs text-ink/75">
              <div className="flex items-center justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-ink">{subtotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span>رسوم التوصيل:</span>
                <span>
                  {shipping === 0
                    ? "شحن مجاني"
                    : `${shipping.toLocaleString("ar-EG")} ج.م`}
                </span>
              </div>
              {subtotal < 1000 && (
                <p className="text-[10px] text-rose">
                  أضيفي منتجات بقيمة {(1000 - subtotal).toLocaleString("ar-EG")} ج.م إضافية للحصول على شحن مجاني!
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-ink/8 text-ink">
                <span className="text-xs uppercase tracking-wider font-bold">الإجمالي النهائي:</span>
                <span className="font-display font-extrabold text-2xl text-ink">
                  {total.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
