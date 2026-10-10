import { Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, ArrowLeft, Sparkles } from "lucide-react";
import { LuxButton } from "./LuxButton";

export function ContactCTA() {
  const whatsappUrl =
    "https://wa.me/201000000000?text=" +
    encodeURIComponent("مرحباً، أود الاستفسار والطلب من كاريشما - نسرين الطنطاوي");

  return (
    <section className="relative py-16 sm:py-24 md:py-36 bg-ink text-cream overflow-hidden" dir="rtl">
      {/* glowing orbs */}
      <div
        className="absolute -top-40 right-1/2 translate-x-1/2 h-[550px] w-[550px] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--gradient-blush)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Main CTA copy */}
        <div className="lg:col-span-7 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink/30 bg-pink-light/10 text-pink text-xs font-semibold mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3" />
            <span>كاريشما — إدارة وتوزيع نسرين الطنطاوي</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-balance">
            جاهزة تختاري{" "}
            <span className="text-gradient-gold">منتجاتك؟</span>
          </h2>

          <p className="mt-6 max-w-xl text-cream/75 text-base sm:text-lg font-light leading-relaxed">
            تسوقي من كاريشما الآن واستمتعي بتجربة مختلفة برعاية وإشراف وكيلة معتمدة نسرين الطنطاوي. تشكيلة مختارة من أرقى مستحضرات التجميل والعناية بأسعار مناسبة وتوصيل فوري لباب بيتك.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/shop" search={{ category: "الكل" }}>
              <LuxButton>
                اطلبي الآن <ArrowLeft className="h-4 w-4" />
              </LuxButton>
            </Link>

            <Link to="/contact">
              <button
                type="button"
                className="rounded-full border border-cream/30 bg-cream/5 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-cream hover:border-gold hover:text-gold transition-colors"
              >
                تواصلي معنا
              </button>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 px-5 py-3 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              طلب سريع عبر واتساب
            </a>
          </div>
        </div>

        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-cream/[0.04] border border-cream/10 hover:border-gold/40 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:-translate-x-1"
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="h-10 w-10 rounded-full border border-gold/40 flex items-center justify-center text-gold bg-gold/10">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-gold font-bold block">
                  خدمة العملاء والطلبات
                </span>
                <span className="text-[11px] text-cream/60">متاحون للرد السريع طوال اليوم</span>
              </div>
            </div>
            <p className="font-display font-bold text-xl text-cream group-hover:text-gold transition-colors">
              واتساب: 01000000000
            </p>
          </a>

          <div className="bg-cream/[0.04] border border-cream/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="h-10 w-10 rounded-full border border-gold/40 flex items-center justify-center text-gold bg-gold/10">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-gold font-bold block">
                  مقر الشركة والتوصيل
                </span>
                <span className="text-[11px] text-cream/60">القاهرة، جمهورية مصر العربية</span>
              </div>
            </div>
            <p className="font-display text-base text-cream/80 leading-relaxed">
              شحن وتوصيل متاح لجميع المحافظات خلال 24 - 48 ساعة مع إمكانية المعاينة عند الاستلام.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
