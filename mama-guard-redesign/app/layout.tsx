import type { Metadata, Viewport } from "next";
import { Shield } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mama Guard — Your Maternal Health Companion",
  description: "A private, supportive maternal health early-access companion for pregnancy tracking, symptom checking, and care guidance.",
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
      <body className="font-sans mesh-gradient min-h-screen selection:bg-[var(--rose-100)] selection:text-[var(--rose-900)]">
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
          <nav className="max-w-7xl mx-auto glass-card rounded-2xl px-6 py-3 flex items-center justify-between shadow-premium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] flex items-center justify-center shadow-glow">
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Mama Guard</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="/home" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--rose-600)] transition-colors">Home</a>
              <a href="/learn" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--rose-600)] transition-colors">Learn</a>
              <a href="/safety" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--rose-600)] transition-colors">Safety</a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[var(--sage-50)] px-3 py-1.5 rounded-full border border-[var(--sage-100)] shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-500)] animate-pulse" />
                <span className="text-[10px] font-bold text-[var(--sage-700)] uppercase tracking-wider">System Live</span>
              </div>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
