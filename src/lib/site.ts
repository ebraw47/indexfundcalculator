export const SITE = "https://indexfundcalculator.net";

export type PageEntry = {
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export const SITE_PAGES: PageEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/funds", changeFrequency: "weekly", priority: 0.9 },
  { path: "/guides/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guides/dca-strategy", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guides/expense-ratios", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guides/sp500-returns", changeFrequency: "monthly", priority: 0.8 },
];

/** Brand / SEO images keyed by the page URL that owns them. */
export const SITE_IMAGES: { pagePath: string; images: string[] }[] = [
  {
    pagePath: "/",
    images: [
      "/images/brand/hero-logo.webp",
      "/images/brand/header-logo.webp",
      "/images/brand/logo.webp",
      "/images/brand/logo-v2.webp",
      "/images/topics/index-diversification.webp",
      "/images/topics/index-dca.webp",
      "/images/topics/index-expense-ratios.webp",
      "/favicon.png",
      "/apple-touch-icon.png",
    ],
  },
];

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE;
  return `${SITE}${path}`;
}
