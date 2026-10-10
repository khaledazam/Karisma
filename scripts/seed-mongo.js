import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://khaled141ma_db_user:SZcvQBHq32mFS9wd@cluster0.ccctrec.mongodb.net/karisma?retryWrites=true&w=majority&appName=Cluster0";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    originalPrice: String,
    discount: String,
    image: String,
    description: String,
    badge: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const initialProducts = [
  {
    id: "m1",
    name: "أحمر شفاه كاريشما المخملي مات",
    category: "مكياج",
    price: "420 ج.م",
    originalPrice: "520 ج.م",
    discount: "وفري 100 ج.م",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80",
    description: "تركيبة غنية وثابتة بلون كلاسيكي ناعم تمنح الشفاه مظهراً مخملياً جذاباً يدوم طوال اليوم دون جفاف.",
    badge: "الأكثر مبيعاً",
  },
  {
    id: "m2",
    name: "لوحة ظلال العيون الملكية 18 لون",
    category: "مكياج",
    price: "790 ج.م",
    originalPrice: "950 ج.م",
    discount: "خصم 17%",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80",
    description: "مزيج فاخر من الدرجات الترابية والميتاليك اللامعة لتمنحك إطلالات يومية وسهرات ساحرة بانسيابية فائقة.",
    badge: "مميز",
  },
  {
    id: "m3",
    name: "فاونديشن كاريشما السائل بتغطية حريرية",
    category: "مكياج",
    price: "560 ج.م",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    description: "تغطية متوسطة إلى كاملة قابلة للبناء تعطي مظهراً طبيعياً مشرقاً وملمساً ناعماً متجانساً للبشرة.",
    badge: "جديد",
  },
  {
    id: "m4",
    name: "أحمر خدود بودري ناعم درجات الورد",
    category: "مكياج",
    price: "380 ج.م",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    description: "لمسة لونية مشرقة تندمج بسلاسة مع بشرتك لتمنح وجنتيك تورداً حيوياً وجذاباً كالإشراقة الطبيعية.",
  },
  {
    id: "m5",
    name: "ماسكارا تكثيف وتطويل الرموش ثلاثية الأبعاد",
    category: "مكياج",
    price: "340 ج.م",
    image: "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80",
    description: "فرشاة مخصصة ترفع كل رمش من الجذور وتمنحك سواداً فاحماً وكثافة مذهلة طوال اليوم دون تكتل.",
  },
  {
    id: "s1",
    name: "سيروم الهيالورونيك والنياسيناميد المركز",
    category: "عناية بالبشرة",
    price: "680 ج.م",
    originalPrice: "850 ج.م",
    discount: "وفري 170 ج.م",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    description: "ترطيب عميق ودعم حاجز البشرة لتقليل مظهر المسام ومنح وجهك نضارة ملحوظة وإشراقة صحية متجددة.",
    badge: "الأعلى تقييماً",
  },
  {
    id: "s2",
    name: "كريم الترطيب العميق بمستخلصات طبيعية",
    category: "عناية بالبشرة",
    price: "520 ج.م",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    description: "قوام غني وخفيف يمتص سريعاً ليغذي البشرة الجافة والعادية ويتركها ناعمة كالحرير على مدار 24 ساعة.",
  },
  {
    id: "s3",
    name: "غسول الوجه الرغوي المنقي واللطيف",
    category: "عناية بالبشرة",
    price: "320 ج.م",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    description: "ينظف الشوائب والزيوت الزائدة بلطف دون تجريد البشرة من رطوبتها الطبيعية، مناسب للاستخدام اليومي.",
  },
  {
    id: "s4",
    name: "سيروم فيتامين C لتفتيح وتوحيد اللون",
    category: "عناية بالبشرة",
    price: "720 ج.م",
    image: "https://images.unsplash.com/photo-1608248597359-5033501a3577?auto=format&fit=crop&w=1200&q=80",
    description: "مضادات أكسدة فعالة تساعد على حماية البشرة وتمنحها حيوية وإشراقة ملفتة مع تقليل مظهر التعب والإرهاق.",
  },
  {
    id: "h1",
    name: "زيت الأرغان وزبدة الشيا المغذي للشعر",
    category: "عناية بالشعر",
    price: "490 ج.م",
    originalPrice: "600 ج.م",
    discount: "خصم 18%",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1200&q=80",
    description: "إكسير مركز يعالج أطراف الشعر المتقصفة ويمنحه لمعاناً حريرياً ويحميه من حرارة التصفيف دون أي ملمس دهني.",
    badge: "مفضل العملاء",
  },
  {
    id: "h2",
    name: "ماسك الترميم المكثف للشعر التالف والجاف",
    category: "عناية بالشعر",
    price: "450 ج.م",
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80",
    description: "عناية أسبوعية فائقة تعيد بناء ألياف الشعر وتقوي خصلاته من الجذور حتى الأطراف لملمس ناعم وسهل التمشيط.",
  },
  {
    id: "h3",
    name: "شامبو خالي من السلفات ومقوي للبصيلات",
    category: "عناية بالشعر",
    price: "360 ج.م",
    image: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?auto=format&fit=crop&w=1200&q=80",
    description: "تركيبة لطيفة تحافظ على ترطيب فروة الرأس واللون المصبوغ، وتمنح الشعر حيوية وكثافة واضحة بعد كل غسلة.",
  },
  {
    id: "f1",
    name: "عطر كاريشما روز إيليجانس - 100 مل",
    category: "عطور",
    price: "1,250 ج.م",
    originalPrice: "1,450 ج.م",
    discount: "وفري 200 ج.م",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
    description: "توليفة أنثوية ساحرة تجمع بين نفحات الورد الدمشقي، والمسك الأبيض، مع لمسة دافئة من خشب الصندل الشرقي.",
    badge: "العطر الأكثر طلباً",
  },
  {
    id: "f2",
    name: "عطر عنبر سولتير المركز - 80 مل",
    category: "عطور",
    price: "1,100 ج.م",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
    description: "عطر شرقي دافئ يجمع الفخامة والغموض بنفحات العنبر الأصيل والياسمين المصري الفواح لإطلالة لا تُنسى.",
  },
  {
    id: "f3",
    name: "معطر الجسم والشعر جولد شيمر - 250 مل",
    category: "عطور",
    price: "390 ج.م",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    description: "رذاذ منعش برائحة الزهور والفواكه المنعشة مع حبيبات بريق ناعمة تضفي على إطلالتك سحراً خاصاً طوال اليوم.",
  },
  {
    id: "c1",
    name: "مجموعة فرش المكياج الاحترافية (12 قطعة)",
    category: "مستحضرات تجميل",
    price: "650 ج.م",
    originalPrice: "800 ج.م",
    discount: "خصم 19%",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
    description: "شعيرات صناعية فائقة النعومة مع حافظة فاخرة، صُممت لتطبيق دقيق واحترافي لكافة أنواع البودرة والكريمات.",
    badge: "طقم احترافي",
  },
  {
    id: "c2",
    name: "إسفنجة دمج المكياج الثلاثية مع حامل ذهبي",
    category: "مستحضرات تجميل",
    price: "240 ج.م",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    description: "إسفنجة فائقة المرونة تمنحك تغطية سلسة وموحدة لمستحضرات الأساس والكونسيلر دون امتصاص الفائض.",
  },
  {
    id: "c3",
    name: "مثبت مكياج ديوي جلو طويل الأمد",
    category: "مستحضرات تجميل",
    price: "390 ج.م",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    description: "رذاذ تثبيت يحافظ على انتعاش وثبات المكياج حتى 16 ساعة مع ترطيب خفيف يعزز إشراقة المظهر النهائي.",
  },
  {
    id: "o1",
    name: "بوكس العناية الملكي المتكامل من كاريشما",
    category: "عروض وخصومات",
    price: "1,390 ج.م",
    originalPrice: "1,950 ج.م",
    discount: "وفري 560 ج.م",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    description: "يشمل: سيروم الهيالورونيك، كريم الترطيب الفاخر، غسول الوجه اللطيف، وماسك الترميم — المجموعة الأكثر توفيراً.",
    badge: "عرض حصري",
  },
  {
    id: "o2",
    name: "ثنائي أحمر الشفاه المخملي + قلم التحديد",
    category: "عروض وخصومات",
    price: "550 ج.م",
    originalPrice: "750 ج.م",
    discount: "خصم 26%",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80",
    description: "اختاري لونك المفضل واحصلي على قلم تحديد شفاه مطابق لمنح شفتيك رسماً دقيقاً ومظهراً ممتلئاً يدوم طويلاً.",
    badge: "عرض مميز",
  },
  {
    id: "o3",
    name: "طقم سهرة كاريشما (عطر + معطر لمعان)",
    category: "عروض وخصومات",
    price: "1,450 ج.م",
    originalPrice: "1,840 ج.م",
    discount: "وفري 390 ج.م",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
    description: "عطر روز إيليجانس الفاخر 100 مل مع معطر الجسم والبريق اللامع 250 مل في علبة هدايا أنيقة مجهزة للإهداء.",
    badge: "الأكثر طلباً",
  },
];

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  for (const p of initialProducts) {
    await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true });
  }

  const count = await Product.countDocuments();
  console.log(`✅ Success! Seeded/Updated ${count} products in MongoDB.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
