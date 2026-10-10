import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "الكل",
  }),
  head: () => ({
    meta: [
      { title: "تسوقي منتجات كاريشما | Karisma — نسرين الطنطاوي" },
      {
        name: "description",
        content:
          "تصفحي كافة منتجات كاريشما برعاية وإدارة نسرين الطنطاوي من المكياج، العناية بالبشرة والشعر، العطور، وعروض التوفير الحصرية.",
      },
      { property: "og:title", content: "منتجات كاريشما — Karisma Cosmetics" },
      {
        property: "og:description",
        content: "تسوقي أفضل مستحضرات التجميل والعناية من كاريشما وتوصيل لكافة المحافظات.",
      },
      { property: "og:url", content: "https://karisma-cosmetics.com/shop" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/shop",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { products, categories } = useProducts();
  const { category } = Route.useSearch();
  const currentCategory = category || "الكل";

  const filteredProducts =
    currentCategory === "الكل"
      ? products
      : products.filter((p) => p.category === currentCategory);

  return (
    <SiteLayout>
      <section className="pt-32 sm:pt-44 pb-12 sm:pb-14 grain" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink/40 bg-pink-light/30 text-rose text-xs font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            <span>تشكيلة كاريشما المتكاملة — إدارة نسرين الطنطاوي</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-ink leading-tight text-balance">
            اختاري ما يناسب <span className="text-gradient-gold">جمالك</span>
          </h1>
          <div className="mt-4 sm:mt-6 mx-auto w-16 gold-line" />
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-ink/75 font-light text-sm sm:text-base md:text-lg">
            مستحضرات تجميل ومنتجات عناية تم اختيارها بعناية فائقة لتمنحكِ ثقة دائمة وإطلالة مشرقة في كل وقت.
          </p>

          {/* Categories Selector with Mobile Touch Swiper */}
          <div className="mt-8 sm:mt-12 flex items-center sm:justify-center gap-2 overflow-x-auto pb-3 sm:pb-0 sm:flex-wrap scrollbar-none">
            {categories.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c }}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-300 ${
                  currentCategory === c
                    ? "gradient-gold text-ink shadow-soft scale-105"
                    : "border border-ink/15 bg-cream/80 text-ink/70 hover:border-ink hover:text-ink"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8 pb-4 border-b border-ink/10 text-xs text-ink/60">
            <span>
              عرض {filteredProducts.length} منتج في قسم:{" "}
              <strong className="text-ink font-semibold">{currentCategory}</strong>
            </span>
            <span>توصيل متاح لكافة المحافظات</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
