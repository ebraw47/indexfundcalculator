import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Index Fund Calculator — Project Growth, Fees & DCA | IndexPath",
    template: "%s | IndexPath",
  },
  description:
    "Free index fund calculator for S&P 500 and total-market ETFs. Model DCA contributions, expense ratios, DRIP, inflation, and long-term compound growth.",
  keywords: [
    "index fund calculator",
    "S&P 500 calculator",
    "DCA calculator",
    "expense ratio",
    "compound interest ETF",
  ],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }, { url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  openGraph: {
    title: "Index Fund Calculator | IndexPath",
    description:
      "Project index fund balances with contributions, fees, dividends, and inflation.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <div className="shell flex flex-col flex-1">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
