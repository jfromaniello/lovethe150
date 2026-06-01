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

const description =
  "An interactive guide to the Cessna 150 — V-speeds, flaps, fuel, trim and procedures, in instruments you can actually touch.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lovethe150.com"),
  title: "Cessna 150 — Interactive Guide",
  description,
  openGraph: {
    title: "Cessna 150 — Interactive Guide",
    description,
    type: "website",
    url: "/",
    siteName: "lovethe150.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cessna 150 — Interactive Guide",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
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
      </body>
    </html>
  );
}
