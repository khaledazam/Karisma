import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, MessageCircle, Sparkles } from "lucide-react";
import { NesrinLogo } from "./NesrinLogo";

export function SiteFooter() {
  const whatsappUrl =
    "https://wa.me/201000000000?text=" +
    encodeURIComponent("مرحباً، أود الاستفسار عن منتجات كاريشما - نسرين الطنطاوي");

  return (
    <footer className="relative bg-ink text-cream pt-20 pb-10 overflow-hidden" dir="rtl">
      <div className="absolute inset-x-0 top-0 gold-line" />
      <div
        className="absolute -top-40 -left-20 h-96 w-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "var(--gradient-gold)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid gap-10 md:grid-cols-4">
        {/* Brand identity */}
        <div className="md:col-span-2 text-right">
          <Link to="/" className="inline-block mb-4">
            <NesrinLogo size="lg" theme="dark" />
          </Link>

          <p className="mt-4 max-w-md text-sm text-cream/70 leading-relaxed font-light">
            علامة <strong>كاريشما (Karisma)</strong> برعاية وإدارة وكيلة معتمدة <strong>نسرين الطنطاوي (Nesrin Tantawy)</strong>، متخصصة في تقديم أحدث مستحضرات التجميل والعناية بالبشرة والشعر المختارة بعناية فائقة وتوصيلها لجميع محافظات مصر.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="h-9 w-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="h-9 w-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Youtube"
              className="h-9 w-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="h-9 w-9 rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-right">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold mb-4">
            روابط سريعة
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li>
              <Link to="/" className="hover:text-gold transition-colors">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "الكل" }} className="hover:text-gold transition-colors">
                المنتجات
              </Link>
            </li>
            <li>
              <Link to="/" hash="categories" className="hover:text-gold transition-colors">
                الأقسام
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold transition-colors">
                من نحن
              </Link>
            </li>
            <li>
              <Link to="/" hash="offers" className="hover:text-gold transition-colors">
                العروض
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold transition-colors">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories & Newsletter */}
        <div className="text-right">
          <h3 className="text-xs uppercase tracking-widest text-gold font-bold mb-4">
            أقسام الجمال
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/70 mb-6">
            <li>
              <Link to="/shop" search={{ category: "مكياج" }} className="hover:text-gold transition-colors">
                مكياج وإطلالات
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "عناية بالبشرة" }} className="hover:text-gold transition-colors">
                عناية بالبشرة
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "عناية بالشعر" }} className="hover:text-gold transition-colors">
                عناية بالشعر
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "عطور" }} className="hover:text-gold transition-colors">
                عطور فاخرة
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "عروض وخصومات" }} className="hover:text-gold transition-colors text-gold">
                عروض وخصومات مميزة
              </Link>
            </li>
          </ul>

          <p className="text-xs text-cream/60 mb-2">توصيل سريع متاح لجميع محافظات مصر</p>
        </div>
      </div>

      <div className="relative mt-16 pt-6 border-t border-cream/10 mx-auto max-w-7xl px-6 lg:px-10 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-cream/50">
        <span>© 2026 كاريشما (Karisma) · إدارة وتوزيع نسرين الطنطاوي (Nesrin Tantawy) · جميع الحقوق محفوظة</span>
        <span className="text-[11px] text-cream/40">صنع بكل فخر في جمهورية مصر العربية</span>
      </div>
    </footer>
  );
}
