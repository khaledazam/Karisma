import React from "react";
import logoImg from "@/assets/nesrin-tantawy-logo.png";
import logoTransparent from "@/assets/nesrin-tantawy-logo-transparent.png";

interface NesrinLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "transparent";
  showBrandText?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export function NesrinLogo({
  size = "md",
  variant = "badge",
  showBrandText = true,
  className = "",
  theme = "auto",
}: NesrinLogoProps) {
  // Size dimensions and explicit pixel values for layout stability
  const dims = {
    sm: { img: "h-9 w-9", px: 36, fontBrand: "text-base", fontSub: "text-[9px]" },
    md: { img: "h-11 w-11 sm:h-12 sm:w-12", px: 48, fontBrand: "text-lg sm:text-xl", fontSub: "text-[10px]" },
    lg: { img: "h-16 w-16 sm:h-20 sm:w-20", px: 80, fontBrand: "text-2xl sm:text-3xl", fontSub: "text-xs" },
    xl: { img: "h-24 w-24 sm:h-28 sm:w-28", px: 112, fontBrand: "text-3xl sm:text-4xl", fontSub: "text-sm" },
  }[size];

  const isDark = theme === "dark";
  const webpSrc =
    variant === "transparent"
      ? "/images/nesrin-tantawy-logo-transparent.webp"
      : "/images/nesrin-tantawy-logo.webp";

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`} dir="rtl">
      {/* Official Primary Logo: NT Nesrin Tantawy */}
      <div className="relative group shrink-0">
        <div
          className={`relative ${dims.img} rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
            variant === "badge"
              ? "bg-[#141416] p-0.5 border border-pink/30 shadow-md group-hover:border-baby-blue-deep group-hover:shadow-glow"
              : "p-0.5"
          }`}
        >
          <img
            src={webpSrc}
            alt="شعار نسرين الطنطاوي - Nesrin Tantawy"
            width={dims.px}
            height={dims.px}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Subtle decorative glow ring */}
        <div
          aria-hidden
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink/30 via-baby-blue/30 to-beige/30 blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
        />
      </div>

      {/* Brand & Admin Titles */}
      {showBrandText && (
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-display font-extrabold ${dims.fontBrand} tracking-tight ${
                isDark ? "text-cream" : "text-ink"
              }`}
            >
              كاريشما
            </span>
            <span className="text-gradient-gold font-medium text-xs sm:text-sm px-1.5 py-0.5 rounded-full bg-pink-light/60 border border-pink/30 text-rose">
              Karisma
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] sm:${dims.fontSub} font-medium ${isDark ? "text-cream/80" : "text-ink/75"}`}>
              وكيلة معتمدة: <strong className="text-pink-deep font-bold">نسرين الطنطاوي</strong>
            </span>
          </div>
          <span className={`hidden sm:inline-block text-[8px] sm:text-[9px] tracking-wider uppercase font-sans ${isDark ? "text-cream/50" : "text-ink/45"}`}>
            Nesrin Tantawy · Official Brand
          </span>
        </div>
      )}
    </div>
  );
}
