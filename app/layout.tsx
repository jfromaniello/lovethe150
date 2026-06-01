import type { Metadata, Viewport } from "next";
import { Roboto_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./aviation.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: ["400", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://lovethe150.com";
const title = "Cessna 150 — Interactive Guide";
const description =
  "An interactive guide to the Cessna 150 — V-speeds, flaps, fuel, trim and procedures, in instruments you can actually touch.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "lovethe150",
  authors: [{ name: "José F. Romaniello", url: "https://x.com/jfroma" }],
  creator: "José F. Romaniello",
  keywords: [
    "Cessna 150",
    "Cessna 150 guide",
    "V-speeds",
    "Owner's Manual",
    "POH",
    "flight training",
    "two-seat trainer",
    "Continental O-200",
    "student pilot",
    "general aviation",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: "lovethe150.com",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@jfroma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "aviation",
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "lovethe150.com",
  url: SITE_URL,
  description,
  inLanguage: ["en", "es"],
  author: {
    "@type": "Person",
    name: "José F. Romaniello",
    url: "https://x.com/jfroma",
  },
  about: {
    "@type": "Product",
    name: "Cessna 150",
    category: "Aircraft",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoCondensed.variable} ${jetBrainsMono.variable}`}
    >
      <body
        className="min-h-screen bg-[#f4efe6] text-[#1a1a1a] antialiased"
        style={{ fontFamily: "var(--font-roboto-condensed), Arial, sans-serif" }}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
