"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGestationalWeek, getTrimester, cn } from "@/lib/utils";
import { Sparkles, Shield } from "lucide-react";

export function Header({ showAIButton = true }: { showAIButton?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; dueDate: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mamaguard_onboarding");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const week = user ? getGestationalWeek(user.dueDate) : 0;
  const trimester = getTrimester(week);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--warm-200)]/50 shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--rose-300)] to-[var(--rose-500)] flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || "M"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">{user?.name || "Welcome"}</span>
            {week > 0 && <span className="text-[11px] text-[var(--text-tertiary)] leading-tight">Week {week} · {trimester}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--sage-100)] border border-[var(--sage-200)]">
            <Shield size={12} className="text-[var(--sage-600)]" />
            <span className="text-[10px] font-semibold text-[var(--sage-700)] uppercase tracking-wider">Safe</span>
          </div>
          {showAIButton && (
            <button onClick={() => router.push("/ai")} className="flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-md active:scale-95 transition-all">
              <Sparkles size={14} strokeWidth={2.5} />
              <span className="text-[12px] font-semibold">AI</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
