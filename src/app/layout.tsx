import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apexsportswear.com"),
  title: {
    default: "Apex Sportswear — Football, NBA & F1 Kits",
    template: "%s | Apex Sportswear",
  },
  description:
    "Premium football club kits, NBA jerseys and F1 gear. Wear your allegiance — join the free Apex Club for early access and members-only offers.",
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
    url: "https://apexsportswear.com",
  },
  twitter: {
    card: "summary_large_image",
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
      </body>
    </html>
  );
}
