import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { LuxButton } from "@/components/LuxButton";
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { saveContactMessageServerFn } from "@/lib/server-actions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصلي معنا — كاريشما | Karisma — نسرين الطنطاوي" },
      {
        name: "description",
        content:
          "تواصلي مع فريق خدمة عملاء كاريشما بإدارة وتوزيع نسرين الطنطاوي في مصر للاستفسار عن المنتجات، الطلبات، أو الشحن والتوصيل.",
      },
      { property: "og:title", content: "تواصلي معنا — كاريشما (إدارة نسرين الطنطاوي)" },
      {
        property: "og:description",
        content: "فريق كاريشما وإدارة نسرين الطنطاوي جاهز دائماً للإجابة على استفساراتك ومساعدتك.",
      },
      { property: "og:url", content: "https://karisma-cosmetics.com/contact" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/contact",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const whatsappUrl =
    "https://wa.me/201000000000?text=" +
    encodeURIComponent(
      `مرحباً كاريشما - نسرين الطنطاوي، أود الاستفسار:\nالاسم: ${formData.firstName} ${formData.lastName}\nالرسالة: ${formData.message || "استفسار عن المنتجات والطلبات"}`,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveContactMessageServerFn({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
      });
    } catch (err) {
      console.error("Failed to save contact message to MongoDB:", err);
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  };

  return (
    <SiteLayout>
      <section className="pt-32 sm:pt-44 pb-12 sm:pb-14 grain" dir="rtl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink/40 bg-pink-light/30 text-rose text-xs font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            <span>خدمة العملاء والطلبات — كاريشما</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-ink leading-tight text-balance">
            يسعدنا دائماً <span className="text-gradient-gold">تواصلكِ معنا</span>
          </h1>
          <div className="mt-4 sm:mt-6 mx-auto w-16 gold-line" />
          <p className="mt-4 sm:mt-6 max-w-xl mx-auto text-ink/75 font-light text-sm sm:text-base md:text-lg">
            سواء كان لديكِ استفسار عن منتج، أو مساعدة في اختيار درجة المكياج الأنسب، أو متابعة طلبكِ — فريق كاريشما برعاية وإدارة نسرين الطنطاوي يسعد بخدمتك والرد السريع عليكِ.
          </p>
        </div>
      </section>

      <section className="pb-24 sm:pb-32" dir="rtl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Form */}
          <div className="lg:col-span-3 bg-cream rounded-3xl shadow-soft border border-ink/10 p-5 sm:p-8 md:p-12">
            <h2 className="font-display font-bold text-xl sm:text-3xl text-ink mb-6">
              أرسلي لنا رسالة
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                    placeholder="سارة"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                    placeholder="محمود"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    رقم الهاتف أو واتساب *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                    placeholder="010XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                  الموضوع
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  placeholder="استفسار عن توفر منتج أو التوصيل"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                  الرسالة *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-cream/70 border border-ink/20 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none resize-none"
                  placeholder="اكتبي لنا استفسارك أو طلبك بالتفصيل..."
                />
              </div>

              {sent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  تم استلام رسالتك بنجاح! سيتواصل معكِ فريق خدمة عملاء كاريشما وإدارة نسرين الطنطاوي في أقرب وقت.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <LuxButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الإرسال وحفظ الرسالة..." : "إرسال الرسالة"} <Send className="h-4 w-4" />
                  </LuxButton>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-500/10 text-emerald-800 px-6 py-3 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    مراسلة فورية عبر واتساب
                  </a>
                </div>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-cream border border-ink/10 p-6 sm:p-8 space-y-6">
              <InfoItem
                icon={<MessageCircle className="h-5 w-5" />}
                label="واتساب والمبيعات"
                lines={["01000000000", "متاحون على مدار الأسبوع"]}
              />
              <InfoItem
                icon={<Phone className="h-5 w-5" />}
                label="الهاتف المباشر"
                lines={["01000000000", "من 10 صباحاً حتى 10 مساءً"]}
              />
              <InfoItem
                icon={<Mail className="h-5 w-5" />}
                label="البريد الإلكتروني"
                lines={["support@karisma-cosmetics.com"]}
              />
              <InfoItem
                icon={<MapPin className="h-5 w-5" />}
                label="المقر والتوزيع"
                lines={["القاهرة، جمهورية مصر العربية", "شحن وتوصيل لجميع المحافظات"]}
              />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoItem({
  icon,
  label,
  lines,
}: {
  icon: React.ReactNode;
  label: string;
  lines: string[];
}) {
  return (
    <div className="text-right">
      <div className="flex items-center gap-2.5 text-rose mb-2">
        <span className="h-9 w-9 rounded-full border border-rose/30 bg-rose/10 flex items-center justify-center text-rose">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-wider font-bold">{label}</span>
      </div>
      {lines.map((l) => (
        <p key={l} className="text-ink/75 font-light text-sm leading-relaxed">
          {l}
        </p>
      ))}
    </div>
  );
}
