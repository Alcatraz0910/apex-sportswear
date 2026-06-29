import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import Analytics from "@/components/analytics/Analytics";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.apexswear.co.uk"),
  title: {
    default: "Apex Sportswear — Football, NBA & F1 Kits",
    template: "%s | Apex Sportswear",
  },
  description:
    "Premium football club kits, national-team shirts, NBA jerseys & F1 gear — shipped worldwide. Join the free Apex Club for early drops and live shirt giveaways.",
  keywords: [
    "football shirts",
    "football kits",
    "NBA jerseys",
    "F1 gear",
    "sportswear",
  ],
  openGraph: {
    type: "website",
    siteName: "Apex Sportswear",
    title: "Apex Sportswear — Wear your allegiance",
    description:
      "Premium football, NBA & F1 kits, shipped worldwide. Join the free Apex Club for early drops and live shirt giveaways.",
    url: "https://www.apexswear.co.uk",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Apex Sportswear — Wear your allegiance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Sportswear — Wear your allegiance",
    description:
      "Premium football, NBA & F1 kits, shipped worldwide. Join the free Apex Club.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
