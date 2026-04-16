import { ReactNode } from "react";

const HERO_IMAGES: Record<string, string> = {
  flights:  "/images/hero-flights.webp",
  hotels:   "/images/hero-hotels.webp",
  buses:    "/images/hero-buses.webp",
  packages: "/images/hero-holidays.webp",
};

interface PageHeroProps {
  tab: "flights" | "hotels" | "buses" | "packages";
  headline: ReactNode;
  sub?: ReactNode;
  centered?: boolean;
  badge?: ReactNode;
  children?: ReactNode;
  extraContent?: ReactNode;
}

export function PageHero({
  tab,
  headline,
  sub,
  centered = false,
  badge,
  children,
  extraContent,
}: PageHeroProps) {
  const image = HERO_IMAGES[tab] ?? HERO_IMAGES.flights;

  return (
    <div className="relative overflow-hidden text-white">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

      <div className={`relative container mx-auto px-4 py-12 md:py-20 ${centered ? "text-center" : ""}`}>
        {badge && <div className="mb-4 md:mb-5">{badge}</div>}

        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 leading-tight ${centered ? "mx-auto max-w-3xl" : "max-w-2xl"}`}
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
        >
          {headline}
        </h1>

        {sub && (
          <p
            className={`text-sm sm:text-base md:text-lg text-white/85 mb-6 md:mb-8 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
          >
            {sub}
          </p>
        )}

        {children}
        {extraContent}
      </div>
    </div>
  );
}
