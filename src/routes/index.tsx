import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Tag,
  Headphones,
  CheckCircle2,
  Percent,
  Award,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { LuxButton } from "@/components/LuxButton";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Reviews } from "@/components/Reviews";
import { ContactCTA } from "@/components/ContactCTA";
import { NesrinLogo } from "@/components/NesrinLogo";
import lipstickVideo from "@/assets/Lipstick.mp4";
import blushVideo from "@/assets/Blush.mp4";
import makeupVideo from "@/assets/Makeup.mp4";

const heroVideo = { url: "/videos/hero-kit.mp4" };
const LIPSTICK_END_TRIM_SECONDS = 2;

function LazySpotlightVideo({
  src,
  poster,
  ariaLabel,
  className = "",
  onTimeUpdate,
  loop = false,
}: {
  src: string;
  poster: string;
  ariaLabel: string;
  className?: string;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  loop?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && videoRef.current) {
      void videoRef.current.play().catch(() => {});
    }
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={poster}
        muted
        playsInline
        loop={loop}
        preload="none"
        suppressHydrationWarning
        onTimeUpdate={onTimeUpdate}
        aria-label={ariaLabel}
        className={className}
      >
        <track kind="captions" src="" label="بدون صوت" default />
      </video>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "كاريشما | Karisma — وكيلة معتمدة نسرين الطنطاوي | الرئيسية" },
      {
        name: "description",
        content:
          "اكتشفي مجموعة متنوعة من مستحضرات التجميل والعناية بالجمال من كاريشما بإدارة نسرين الطنطاوي، واختاري منتجاتك بسهولة مع توصيل لجميع المحافظات.",
      },
      { property: "og:title", content: "كاريشما | Karisma — نسرين الطنطاوي" },
      {
        property: "og:description",
        content:
          "اكتشفي عالم مستحضرات التجميل والعناية بالجمال مع كاريشما برعاية نسرين الطنطاوي.",
      },
      { property: "og:url", content: "https://karisma-cosmetics.com/" },
      { property: "og:image", content: "https://karisma-cosmetics.com/images/hero-poster.webp" },
      { name: "twitter:image", content: "https://karisma-cosmetics.com/images/hero-poster.webp" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { products, categories } = useProducts();
  const specialOffers = products.filter(
    (p) => p.category === "عروض وخصومات" || Boolean(p.discount),
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const wasHeroVisibleRef = useRef(false);

  useEffect(() => {
    const sectionEl = heroSectionRef.current;
    const videoEl = heroVideoRef.current;

    if (!sectionEl || !videoEl) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry?.isIntersecting ?? false;

        if (isVisible && !wasHeroVisibleRef.current) {
          videoEl.currentTime = 0;
          void videoEl.play().catch(() => {
            // Ignore autoplay rejection when browser policies block playback.
          });
        }

        wasHeroVisibleRef.current = isVisible;
      },
      { threshold: 0.55 },
    );

    observer.observe(sectionEl);

    return () => observer.disconnect();
  }, []);

  const handleLipstickTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = event.currentTarget;

    if (!Number.isFinite(videoEl.duration) || videoEl.duration <= LIPSTICK_END_TRIM_SECONDS) {
      return;
    }

    const loopCutoff = videoEl.duration - LIPSTICK_END_TRIM_SECONDS;

    if (videoEl.currentTime >= loopCutoff) {
      videoEl.currentTime = 0;
      void videoEl.play().catch(() => {
        // Ignore autoplay rejection.
      });
    }
  };

  const filteredProducts =
    selectedCategory === "الكل"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SiteLayout>
      {/* 2. HERO SECTION — Arabic-first, elegant, confident */}
      <section
        ref={heroSectionRef}
        className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden bg-ink flex items-center justify-center pt-24 pb-16"
        dir="rtl"
      >
        <video
          ref={heroVideoRef}
          src={heroVideo.url}
          poster="/images/hero-poster.webp"
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          suppressHydrationWarning
          aria-label="فيديو جمالي لكاريشما نسرين الطنطاوي"
          className="video-smooth absolute inset-0 h-full w-full object-cover opacity-50"
        >
          <track kind="captions" src="" label="بدون صوت" default />
        </video>

        {/* Gradient overlays for readability and luxury tone */}
        <div className="absolute inset-0 bg-radial from-transparent via-ink/60 to-ink/95 pointer-events-none" />
        <div
          className="absolute inset-x-0 bottom-0 h-44 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, oklch(0.985 0.012 85) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center text-cream">
          {/* Official Primary Logo in Hero */}
          <div className="mb-6 flex justify-center">
            <NesrinLogo size="lg" theme="dark" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-pink/30 bg-pink-light/10 backdrop-blur-md text-pink text-[11px] sm:text-sm font-medium mb-4 sm:mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-pink" />
            <span>كاريشما — Karisma · إدارة وتوزيع نسرين الطنطاوي</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.15] sm:leading-[1.1] text-balance">
            جمالك يبدأ من{" "}
            <span className="text-gradient-gold">كاريشما</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl lg:text-2xl text-cream/85 leading-relaxed max-w-3xl mx-auto font-light">
            تشكيلة راقية من مستحضرات التجميل والعناية بالجمال برعاية وإشراف وكيلة معتمدة نسرين الطنطاوي، لتتألقي بثقة وجاذبية في كل لحظة.
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link to="/shop" search={{ category: "الكل" }}>
              <LuxButton>
                تسوقي الآن <ShoppingBag className="h-4 w-4" />
              </LuxButton>
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection("products")}
              className="rounded-full border border-baby-blue/40 bg-baby-blue/15 backdrop-blur-md px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-wider font-semibold text-cream hover:bg-cream hover:text-ink transition-all duration-300 shadow-soft"
            >
              اكتشفي منتجاتنا
            </button>
          </div>

          {/* Value highlights */}
          <div className="mt-10 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-cream/75 max-w-3xl mx-auto border-t border-cream/15 pt-6 sm:pt-8">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold shrink-0" />
              <span>جودة موثوقة 100%</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold shrink-0" />
              <span>توصيل لجميع المحافظات</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold shrink-0" />
              <span>أسعار وعروض مناسبة</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <HeartHandshake className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold shrink-0" />
              <span>دفع عند الاستلام</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT KARISMA & NESRIN TANTAWY */}
      <section className="py-20 md:py-28 grain" dir="rtl">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 text-center">
          <p className="text-xs uppercase tracking-widest text-rose font-bold">
            — عن كاريشما
          </p>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-ink leading-tight text-balance">
            مستحضرات تجميل مختارة{" "}
            <span className="text-gradient-gold">لتبرز جمالك الطبيعي</span>
          </h2>
          <div className="mt-6 mx-auto w-16 gold-line" />
          <p className="mt-8 text-base sm:text-lg text-ink/75 leading-relaxed max-w-3xl mx-auto font-light">
            في <strong>كاريشما (Karisma)</strong> برعاية وإدارة وكيلة معتمدة <strong>نسرين الطنطاوي (Nesrin Tantawy)</strong>، نؤمن بأن كل امرأة تستحق أن تشعر بالتألق والثقة في كل لحظة. نحرص على تقديم تشكيلة واسعة من مستحضرات التجميل ومنتجات العناية بالبشرة والشعر المختارة بعناية فائقة، مع التركيز التام على الجودة، والتنوع الذي يلبي كافة الأذواق، لنمنحك تجربة تسوق ممتعة ومريحة تبدأ من لحظة تصفحك وحتى وصول طلبك.
          </p>
        </div>
      </section>

      {/* 5. WHY KARISMA (لماذا كاريشما؟) — 6 Clear Points */}
      <section className="py-14 sm:py-20 md:py-24 bg-cream/70 border-y border-ink/8" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">
              — لماذا تختاريننا؟
            </p>
            <h2 className="mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink">
              مميزات التسوق مع <span className="text-gradient-gold">كاريشما</span>
            </h2>
            <div className="mt-4 mx-auto w-12 gold-line" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-gold" />}
              title="منتجات متنوعة"
              description="تشكيلة متكاملة من المكياج والعناية بالبشرة والشعر والعطور تناسب إطلالاتك اليومية ومناسباتك الخاصة."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-gold" />}
              title="جودة موثوقة"
              description="نختار كل منتج بعناية وتدقيق لضمان فاعلية تامة ونتائج تمنحك الثقة والرضا الكامل."
            />
            <FeatureCard
              icon={<Tag className="h-6 w-6 text-gold" />}
              title="أسعار مناسبة"
              description="توازن مدروس بين القيمة والجودة لنقدم لكِ أرقى المستحضرات بأسعار عادلة تناسب ميزانيتك."
            />
            <FeatureCard
              icon={<ShoppingBag className="h-6 w-6 text-gold" />}
              title="تجربة شراء سهلة"
              description="تصفح مرن، سلة تسوق مريحة، وإمكانية الطلب المباشر عبر الموقع أو عبر تطبيق واتساب بضغطة واحدة."
            />
            <FeatureCard
              icon={<Headphones className="h-6 w-6 text-gold" />}
              title="خدمة عملاء مميزة"
              description="فريق دعم متواجد للإجابة على استفساراتك ومساعدتك في اختيار المنتجات والدرجات الأنسب لكِ."
            />
            <FeatureCard
              icon={<Percent className="h-6 w-6 text-gold" />}
              title="عروض مستمرة"
              description="خصومات حصرية وباقات توفير مميزة متجددة على مدار العام لتستمتعي بأفضل الأسعار دائماً."
            />
          </div>
        </div>
      </section>

      {/* 6. OFFERS SECTION (عروض كيريشنا) */}
      <section id="offers" className="py-16 sm:py-20 md:py-28 relative overflow-hidden" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="rounded-3xl gradient-blush border border-rose/30 p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-luxe">
            <div
              className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{ background: "var(--gradient-gold)" }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
              <div className="text-right max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose/15 text-rose text-xs font-bold mb-3 sm:mb-4">
                  <Percent className="h-3.5 w-3.5" />
                  خصومات لفترة محدودة
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink leading-tight">
                  عروض كاريشما
                </h2>
                <p className="mt-2 sm:mt-3 text-base sm:text-xl text-ink/80 font-medium">
                  خصومات مميزة على مجموعة مختارة من منتجات التجميل والعناية
                </p>
                <p className="mt-2 text-xs sm:text-sm text-ink/65 font-light">
                  وفري مع باقات التوفير الملكية وعروض المكياج الحصرية المصممة خصيصاً لتمنحك أفضل قيمة.
                </p>
              </div>

              <Link
                to="/shop"
                search={{ category: "عروض وخصومات" }}
                className="shrink-0 w-full sm:w-auto text-center rounded-full gradient-gold px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-ink shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all"
              >
                شاهدي العروض
              </Link>
            </div>

            {/* Special offers products mini-grid */}
            <div className="relative z-10 mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {specialOffers.slice(0, 3).map((item) => (
                <ProductCard key={item.id} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CINEMATIC SPOTLIGHT 1: LIPSTICK */}
      <section className="relative" dir="rtl">
        <div className="grid lg:grid-cols-12 gap-0 items-center">
          <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:min-h-[560px] overflow-hidden">
            <LazySpotlightVideo
              src={lipstickVideo}
              poster="/images/lipstick-poster.webp"
              onTimeUpdate={handleLipstickTimeUpdate}
              ariaLabel="فيديو أحمر شفاه كاريشما المخملي"
              className="video-smooth absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          <div className="lg:col-span-5 bg-blush/60 flex items-center px-5 sm:px-8 lg:px-16 py-12 sm:py-16 text-right">
            <div>
              <p className="text-xs uppercase tracking-widest text-rose font-bold">
                — لمسة الشفاه
              </p>
              <h2 className="mt-3 sm:mt-4 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight">
                أحمر شفاه
                <br />
                <span className="text-gradient-gold">كاريشما المخملي</span>
              </h2>
              <div className="mt-4 w-12 gold-line" />
              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-ink/75 leading-relaxed font-light">
                تركيبة غنية تمنحك لوناً كثيفاً وثابتاً مع ملمس ناعم كالحرير لا يسبب الجفاف. صُمم ليمنحك إطلالة أنثوية واثقة ترافقك طوال يومك.
              </p>
              <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-5 flex-wrap">
                <Link to="/shop" search={{ category: "مكياج" }}>
                  <LuxButton variant="outline">اكتشفي مجموعة المكياج</LuxButton>
                </Link>
                <span className="font-display font-bold text-xl sm:text-2xl text-ink">420 ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS SECTION (معرض المنتجات) */}
      <section id="products" className="py-16 sm:py-20 md:py-32" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-rose font-bold">
                — تشكيلة كاريشما
              </p>
              <h2 className="mt-2 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-ink leading-tight">
                منتجات مختارة <span className="text-gradient-gold">لعنايتك</span>
              </h2>
            </div>
            <Link
              to="/shop"
              search={{ category: "الكل" }}
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-ink hover:text-rose transition-colors"
            >
              عرض كافة المنتجات
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>

          {/* Categories Filter Tabs with Mobile Swiper */}
          <div id="categories" className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 sm:mb-10 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-300 ${
                  selectedCategory === cat
                    ? "gradient-gold text-ink shadow-soft scale-105"
                    : "bg-cream border border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-10 sm:mt-14 text-center">
            <Link to="/shop" search={{ category: selectedCategory }}>
              <LuxButton>
                شاهدي المزيد من {selectedCategory === "الكل" ? "المنتجات" : selectedCategory}
              </LuxButton>
            </Link>
          </div>
        </div>
      </section>

      {/* CINEMATIC SPOTLIGHT 2: BLUSH & GLOW */}
      <section className="py-14 sm:py-20 md:py-24 bg-blush/20" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 text-right">
            <p className="text-xs uppercase tracking-widest text-rose font-bold">
              — إشراقة وتألق
            </p>
            <h2 className="mt-2 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink leading-tight">
              تورد طبيعي
              <br />
              <span className="text-gradient-gold">بلمسة حريرية</span>
            </h2>
            <div className="mt-4 w-12 gold-line" />
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-ink/75 leading-relaxed font-light">
              بودرة ناعمة خفيفة كالغيوم تندمج بسلاسة مع بشرتك لتمنحك إشراقة متجددة وإطلالة صحية مفعمة بالحيوية في كافة الأوقات.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link to="/shop" search={{ category: "مكياج" }}>
                <LuxButton variant="outline">اكتشفي درجات البلاشر</LuxButton>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-video overflow-hidden rounded-2xl shadow-luxe">
            <LazySpotlightVideo
              src={blushVideo}
              poster="/images/blush-poster.webp"
              loop
              ariaLabel="فيديو بودرة وأحمر خدود كاريشما"
              className="video-smooth absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER EXPERIENCE (تجارب العملاء) */}
      <Reviews />

      {/* 8. CONTACT / ORDER SECTION (جاهزة تختاري منتجاتك؟) */}
      <ContactCTA />
    </SiteLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-cream border border-ink/10 p-6 text-right hover:shadow-soft hover:border-gold/40 transition-all duration-300">
      <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-ink mb-2">{title}</h3>
      <p className="text-xs text-ink/70 leading-relaxed font-light">{description}</p>
    </div>
  );
}
