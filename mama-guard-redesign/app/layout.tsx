import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mama Guard — Your Maternal Health Companion",
  description: "AI-powered maternal health companion for pregnancy tracking, symptom checking, and personalized care guidance.",
  themeColor: "#FFFBF7",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFBF7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[var(--bg-primary)] min-h-screen">
        <div className="max-w-lg mx-auto min-h-screen relative">{children}</div>
      </body>
    </html>
  );
}
