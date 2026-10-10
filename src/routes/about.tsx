import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { LuxButton } from "@/components/LuxButton";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, Heart, Award } from "lucide-react";
import { NesrinLogo } from "@/components/NesrinLogo";
import powder from "@/assets/powder-explosion.jpg";
import brushes from "@/assets/product-brushes.jpg";
import cream from "@/assets/product-cream.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن كاريشما | Karisma — وكيلة معتمدة نسرين الطنطاوي" },
      {
        name: "description",
        content:
          "تعرفي على كاريشما، علامة مصرية بإدارة وتوزيع نسرين الطنطاوي تقدم تشكيلة مختارة من مستحضرات التجميل والعناية بتركيز على الجودة والجمال الأصيل.",
      },
      { property: "og:title", content: "عن كاريشما — إدارة نسرين الطنطاوي" },
      {
        property: "og:description",
        content: "منتجات تجميل وعناية مختارة بعناية لتبرز جمالك الطبيعي مع كاريشما.",
      },
      { property: "og:url", content: "https://karisma-cosmetics.com/about" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/about",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    no: "٠١",
    title: "مستحضرات مختارة بعناية",
    text: "نختار كل منتج في تشكيلتنا بدقة وتأنٍ لنضمن لكِ أداءً فعالاً وملمساً ناعماً يمنح بشرتك وإطلالتك عناية متكاملة.",
  },
  {
    no: "٠٢",
    title: "تنوع يناسب كافة الأذواق",
    text: "سواء كنتِ تبحثين عن إطلالة صباحية ناعمة أو مكياج سهرة لافت أو روتين عناية يومي، تجدين في كاريشما خيارات متعددة تناسبك.",
  },
  {
    no: "٠٣",
    title: "تجربة تسوق مريحة وسريعة",
    text: "نهتم بكل تفاصيل رحلتك معنا، من سهولة التصفح وسرعة الرد على الاستفسارات، وحتى التوصيل السريع إلى باب منزلك في مصر.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-32 sm:pt-44 pb-16 sm:pb-20 relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 gradient-blush opacity-60 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 text-center">
          <div className="mb-6 flex justify-center">
            <NesrinLogo size="xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink/40 bg-pink-light/30 text-rose text-xs font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            <span>قصتنا ورؤيتنا</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-ink leading-tight text-balance">
            عن كاريشما <span className="text-gradient-gold">بإدارة نسرين الطنطاوي</span>
          </h1>
          <div className="mt-4 sm:mt-6 mx-auto w-16 gold-line" />
          <p className="mt-6 sm:mt-8 max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-ink/75 leading-relaxed font-light">
            علامة تأسست بحب وشغف بالجمال، بإشراف وتوزيع <strong>نسرين الطنطاوي (Nesrin Tantawy)</strong>، لتكون وجهتكِ الأولى لاختيار مستحضرات التجميل والعناية التي تمنحكِ الثقة والتألق في كل مناسبة.
          </p>
        </div>
      </section>

      {/* Editorial split: Karisma & Nesrin Tantawy */}
      <section className="py-14 sm:py-20" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-luxe border border-pink/20">
            <img
              src={brushes}
              alt="مستحضرات كاريشما"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">
              — فلسفة الجمال والتميز
            </p>
            <h2 className="mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink leading-tight">
              جمالك يبدأ من <span className="text-gradient-gold">اختياراتك</span>
            </h2>
            <div className="mt-4 w-12 gold-line" />

            <p className="mt-6 text-ink/75 leading-relaxed font-light text-sm sm:text-base md:text-lg">
              في <strong>كاريشما (Karisma)</strong> بقيادة وكيلة معتمدة <strong>نسرين الطنطاوي (Nesrin Tantawy)</strong>، نحرص على تقديم مستحضرات تجميل وعناية بالبشرة والشعر تتناغم مع طبيعة المرأة العصرية وتلبي تطلعاتها. نحن نؤمن بأن الجمال الحقيقي يكمن في البساطة والنضارة والاهتمام بالتفاصيل.
            </p>

            <p className="mt-4 text-ink/75 leading-relaxed font-light text-sm sm:text-base md:text-lg">
              لهذا صممنا تجربة متكاملة تركز على توفير منتجات موثوقة ذات جودة عالية وبأسعار مدروسة، مع توفير دعم متواصل وخدمة عملاء حريصة على راحتك وإرضائك في كل خطوة.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink/80 font-medium">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                <span>تشكيلة متجددة تتبع أحدث صيحات الجمال والمكياج</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink/80 font-medium">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                <span>خدمة توصيل سريعة ودقيقة تغطي كافة محافظات مصر</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink/80 font-medium">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                <span>سهولة التواصل وطلب المنتجات مباشرة عبر واتساب</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Section for Nesrin Tantawy (Official Distributor & Admin) */}
      <section className="py-14 sm:py-20 bg-baby-blue/15 border-y border-baby-blue/30" dir="rtl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="rounded-3xl bg-cream/90 border border-pink/30 p-6 sm:p-10 md:p-12 shadow-luxe flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="shrink-0 flex justify-center">
              <NesrinLogo size="xl" showBrandText={false} variant="badge" />
            </div>

            <div className="flex-1 text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink/20 text-rose text-xs font-bold mb-3">
                <Award className="h-4 w-4" />
                وكيلة معتمدة وإدارة المتجر
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-3xl text-ink">
                نسرين الطنطاوي — Nesrin Tantawy
              </h3>
              <p className="mt-3 text-xs sm:text-base text-ink/80 leading-relaxed font-light">
                بصفتها الإدارة الرسمية ووكيلة معتمدة لبراند كاريشما، تضمن نسرين الطنطاوي تقديم أعلى معايير الجودة والأصالة لكل منتج يصل إليكِ، مع متابعة دقيقة لكل تفاصيل طلبك لضمان تجربة تسوق راقية تلبي تطلعاتك.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-ink/70">
                <span className="flex items-center gap-1.5 text-pink-deep">
                  <ShieldCheck className="h-4 w-4" /> ضمان المنتجات الأصلية 100%
                </span>
                <span className="flex items-center gap-1.5 text-baby-blue-deep">
                  <Heart className="h-4 w-4" /> استشارات لاختيار درجات المكياج
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-14 sm:py-20 bg-cream/70 border-b border-ink/8" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">
              — ركائزنا
            </p>
            <h2 className="mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink">
              ما يميز تجربة <span className="text-gradient-gold">كاريشما</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {pillars.map((p) => (
              <div key={p.no} className="group rounded-2xl bg-cream border border-ink/10 p-6 sm:p-8 text-right hover:shadow-soft transition-all">
                <p className="font-display font-bold text-4xl sm:text-5xl text-gradient-gold">{p.no}</p>
                <div className="my-4 w-10 gold-line" />
                <h3 className="font-display font-bold text-lg sm:text-xl text-ink mb-2 sm:mb-3">{p.title}</h3>
                <p className="text-ink/70 leading-relaxed font-light text-xs sm:text-sm">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product texture visual strip */}
      <section className="py-12 sm:py-16" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid grid-cols-2 gap-3 sm:gap-4 md:gap-7">
          <div className="aspect-square overflow-hidden rounded-2xl shine-sweep shadow-soft">
            <img src={cream} alt="قوام كريم كاريشما" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden rounded-2xl shine-sweep shadow-soft">
            <img src={powder} alt="بودرة مكياج كاريشما" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 text-center grain" dir="rtl">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink text-balance">
            اكتشفي الآن مجموعتنا <span className="text-gradient-gold">المميزة</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-ink/75 font-light text-sm sm:text-base">
            تصفحي التشكيلة واختاري مستحضراتك المفضلة لتصلكِ أينما كنتِ.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link to="/shop" search={{ category: "الكل" }}>
              <LuxButton>
                تسوقي التشكيلة الكاملة <ArrowLeft className="h-4 w-4" />
              </LuxButton>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
