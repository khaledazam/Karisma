import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { AuthProvider } from "@/hooks/use-auth";
import { ProductsProvider } from "@/hooks/use-products";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground font-display">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          عذراً، الصفحة التي تبحثين عنها غير متوفرة أو ربما تم تغيير مسارها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-gold px-6 py-2.5 text-xs uppercase tracking-widest text-ink font-semibold shadow-soft hover:shadow-luxe transition-all"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "كاريشما | Karisma — وكيلة معتمدة نسرين الطنطاوي | مستحضرات تجميل وعناية" },
      {
        name: "description",
        content:
          "اكتشفي تشكيلة راقية من مستحضرات التجميل والمكياج والعناية بالبشرة والشعر من كاريشما برعاية وإدارة نسرين الطنطاوي. جودة أصلية 100%، باقات توفير، وتوصيل لكافة المحافظات.",
      },
      {
        name: "keywords",
        content:
          "كاريشما, نسرين الطنطاوي, مستحضرات تجميل, مكياج كاريشما, روج مخملي, باليت ايشادو, فاونديشن, سيروم هيالورونيك, Karisma, Nesrin Tantawy, متجر تجميل مصر",
      },
      { name: "author", content: "كاريشما - نسرين الطنطاوي (Nesrin Tantawy)" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#FAF6F0" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "كاريشما" },
      { name: "application-name", content: "كاريشما" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:site_name", content: "كاريشما | Karisma" },
      { property: "og:title", content: "كاريشما | Karisma — وكيلة معتمدة نسرين الطنطاوي" },
      {
        property: "og:description",
        content:
          "اكتشفي عالم مستحضرات التجميل والعناية بالجمال مع كاريشما برعاية وإدارة نسرين الطنطاوي. جودة موثوقة وتوصيل فوري لجميع محافظات مصر.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_EG" },
      { property: "og:url", content: "https://karisma-cosmetics.com/" },
      { property: "og:image", content: "https://karisma-cosmetics.com/images/hero-poster.webp" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "كاريشما - مستحضرات تجميل نسرين الطنطاوي" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "كاريشما | Karisma — نسرين الطنطاوي" },
      {
        name: "twitter:description",
        content:
          "أرقى مستحضرات التجميل والعناية بالبشرة والشعر برعاية وإدارة نسرين الطنطاوي.",
      },
      { name: "twitter:image", content: "https://karisma-cosmetics.com/images/hero-poster.webp" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://karisma-cosmetics.com/",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "https://fonts.gstatic.com/s/alexandria/v6/UMBXrPdDqW66y0Y2usFeaijdA5E64BdCIg.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "https://fonts.gstatic.com/s/alexandria/v6/UMBXrPdDqW66y0Y2usFeai3dA5E64Bc.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&family=Cairo:wght@400;600;700&display=swap",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/hero-poster.webp",
        fetchPriority: "high",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.svg",
      },
      {
        rel: "apple-touch-icon",
        href: "/icons/apple-touch-icon.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "192x192",
        href: "/icons/icon-192.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

const schemaStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://karisma-cosmetics.com/#organization",
      "name": "كاريشما - Karisma",
      "alternateName": "Karisma by Nesrin Tantawy",
      "url": "https://karisma-cosmetics.com/",
      "logo": "https://karisma-cosmetics.com/images/nesrin-tantawy-logo.webp",
      "description":
        "علامة كاريشما برعاية وإدارة وكيلة معتمدة نسرين الطنطاوي، متخصصة في مستحضرات التجميل والعناية بالبشرة والشعر في مصر.",
      "founder": {
        "@type": "Person",
        "name": "نسرين الطنطاوي",
        "jobTitle": "وكيلة معتمدة وموزعة رسمية"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://karisma-cosmetics.com/#website",
      "url": "https://karisma-cosmetics.com/",
      "name": "كاريشما | Karisma",
      "publisher": { "@id": "https://karisma-cosmetics.com/#organization" },
      "inLanguage": "ar"
    }
  ]
};

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
        />
      </head>
      <body className="text-right">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Register PWA Service Worker on client mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <ProductsProvider>
        <WishlistProvider>
          <CartProvider>
            <Outlet />
          </CartProvider>
        </WishlistProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
