import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/PwaProvider";
import InstallBanner from "@/components/InstallBanner";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ── Viewport (theme-color lives here in Next.js 14+) ──────────────────────────
export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── Page metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Sequence Tracker — Special Date & Time Sequences",
  description:
    "Track magical moments when the date and time perfectly align: 10/10 at 10:10, 11/11 at 11:11, and more. Set reminders and never miss a sequence.",
  keywords: [
    "sequence dates",
    "special dates",
    "countdown",
    "reminder",
    "10/10",
    "11/11",
    "12/12",
  ],
  // apple-touch-icon
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NextSequence",
    startupImage: "/apple-touch-icon.png",
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950`}>
        <PwaProvider>
          {children}
          {/* iOS "Add to Home Screen" tip banner */}
          <InstallBanner />
        </PwaProvider>
      </body>
    </html>
  );
}
