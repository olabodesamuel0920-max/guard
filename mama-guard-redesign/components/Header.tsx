"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGestationalWeek, getTrimester, cn } from "@/lib/utils";
import { Sparkles, Shield, ShieldAlert, Clock } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

export type HeaderStatus = "safe" | "urgent" | "review";

export function Header({ 
  showAssistantButton = true,
  status = "safe"
}: { 
  showAssistantButton?: boolean;
  status?: HeaderStatus;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; dueDate: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = safeStorage.get<{ name: string; dueDate: string } | null>(STORAGE_KEYS.ONBOARDING, null);
    if (stored) {
      setUser(stored);
    }
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const week = user ? getGestationalWeek(user.dueDate) : 0;
  const trimester = getTrimester(week);

  const statusConfigs = {
    safe: {
      label: "Safe",
      icon: Shield,
      bg: "bg-[var(--sage-100)]",
      border: "border-[var(--sage-200)]",
      text: "text-[var(--sage-700)]",
      iconColor: "text-[var(--sage-600)]"
    },
    urgent: {
      label: "Needs Care",
      icon: ShieldAlert,
      bg: "bg-rose-100",
      border: "border-rose-200",
      text: "text-rose-700",
      iconColor: "text-rose-600"
    },
    review: {
      label: "Review",
      icon: Clock,
      bg: "bg-amber-100",
      border: "border-amber-200",
      text: "text-amber-700",
      iconColor: "text-amber-600"
    }
  };

  const config = statusConfigs[status];
  const StatusIcon = config.icon;

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
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors duration-300",
            config.bg,
            config.border
          )}>
            <StatusIcon size={12} className={config.iconColor} />
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              config.text
            )}>{config.label}</span>
          </div>
          {showAssistantButton && (
            <button 
              onClick={() => router.push("/ai")} 
              className="flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-md active:scale-95 transition-all"
              aria-label="Open Mama Guard Assistant"
            >
              <Sparkles size={14} strokeWidth={2.5} />
              <span className="text-[12px] font-semibold">Assistant</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
