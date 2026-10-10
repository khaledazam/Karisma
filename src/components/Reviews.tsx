import { Star, Quote, CheckCircle2 } from "lucide-react";

export interface ReviewItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  text: string;
  purchasedProduct: string;
  verified: boolean;
}

// Editable structured review data - can be replaced with API or CMS later
export const reviewsData: ReviewItem[] = [
  {
    id: "rev-1",
    name: "سارة محمود",
    city: "القاهرة",
    rating: 5,
    date: "منذ أسبوع",
    purchasedProduct: "أحمر شفاه كاريشما المخملي",
    text: "جربت أحمر الشفاه المخملي وكنت منبهرة بثباته ونعومته على الشفايف. لونه طبيعي وفخم جداً وما بيشققش خالص طوال اليوم.",
    verified: true,
  },
  {
    id: "rev-2",
    name: "نورهان حسن",
    city: "الإسكندرية",
    rating: 5,
    date: "منذ أسبوعين",
    purchasedProduct: "سيروم الهيالورونيك والنياسيناميد",
    text: "سيروم الهيالورونيك فرق جداً في ترطيب ونضارة بشرتي، والمسام بقت أقل وضوحاً بعد أسبوعين استخدام. التوصيل كان سريع والتعامل راقي جداً.",
    verified: true,
  },
  {
    id: "rev-3",
    name: "ياسمين عبد العزيز",
    city: "الجيزة",
    rating: 5,
    date: "منذ 3 أسابيع",
    purchasedProduct: "عطر كاريشما روز إيليجانس",
    text: "العطر ريحته أنثوية فخمة وفواحة جداً، وكل زميلاتي في الشغل سألوني عليه. التغليف جه في منتهى الشياكة وينفع هدية راقية جداً.",
    verified: true,
  },
  {
    id: "rev-4",
    name: "مريم فؤاد",
    city: "المنصورة",
    rating: 5,
    date: "منذ شهر",
    purchasedProduct: "مجموعة فرش المكياج الاحترافية",
    text: "الفرش ناعمة جداً كالحرير والدمج بيها سهل وسريع. بجد كاريشما بتقدم جودة تضاهي الماركات العالمية بأسعار معقولة جداً.",
    verified: true,
  },
];

export function Reviews() {
  return (
    <section className="py-16 sm:py-24 md:py-36 bg-blush/30 grain overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs uppercase tracking-widest text-rose font-bold">
            — تجارب حقيقية
          </p>
          <h2 className="mt-3 sm:mt-4 font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight text-balance">
            ماذا تقول عميلات <span className="text-gradient-gold">كاريشما؟</span>
          </h2>
          <div className="mt-4 sm:mt-6 mx-auto w-16 gold-line" />
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 text-gold">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 sm:h-5 w-4 sm:w-5 fill-current" />
              ))}
            </div>
            <span className="mr-2 sm:mr-3 text-xs sm:text-sm font-semibold text-ink/75">
              4.9 من 5 بناءً على آراء عميلاتنا في مصر
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviewsData.map((review) => (
            <article
              key={review.id}
              className="group relative bg-cream rounded-2xl p-6 sm:p-7 border border-ink/8 shadow-soft hover:shadow-luxe transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: review.rating }).map((_, k) => (
                      <Star key={k} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-gold/30" />
                </div>

                <p className="font-display text-sm sm:text-base text-ink/85 leading-relaxed">
                  "{review.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-display font-bold text-sm text-ink">{review.name}</p>
                      {review.verified && (
                        <span title="عميلة مؤكدة" role="img" aria-label="عميلة مؤكدة">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink/50 mt-0.5">{review.city}</p>
                  </div>
                  <span className="text-[10px] text-ink/40">{review.date}</span>
                </div>
                <p className="mt-2 text-[10px] text-rose font-medium line-clamp-1">
                  المنتج: {review.purchasedProduct}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
