import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const libre = Libre_Baskerville({ weight: "700", subsets: ["latin"], variable: "--font-libre", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "E&J Kitchen and Bathroom Remodeling, LLC",
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#040D18", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${libre.variable} ${inter.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
