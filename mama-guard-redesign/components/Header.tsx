"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGestationalWeek, getTrimester, cn } from "@/lib/utils";
import { Sparkles, Shield, ShieldAlert, Clock } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

export type HeaderStatus = "safe" | "urgent" | "review";

export function Header({ 
  showAssistantButton = true,
  status = "safe",
  title
}: { 
  showAssistantButton?: boolean;
  status?: HeaderStatus;
  title?: string;
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 md:px-6 md:py-4",
      scrolled ? "bg-[var(--surface-glass)]/80 backdrop-blur-xl border-b border-[var(--warm-200)]/50 shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-lg md:max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & User Group */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div 
            onClick={() => router.push("/home")}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] flex items-center justify-center shadow-glow shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            <Shield size={18} className="text-white" />
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] md:text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">
                {title || "Mama Guard"}
              </span>
              {!title && (
                <div className={cn(
                  "hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border shrink-0",
                  config.bg,
                  config.border
                )}>
                  <StatusIcon size={10} className={config.iconColor} />
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-wider",
                    config.text
                  )}>{config.label}</span>
                </div>
              )}
            </div>
            {!title && user?.name && (
              <span className="text-[10px] text-[var(--text-tertiary)] font-medium truncate opacity-80">
                {user.name} · Week {week}
              </span>
            )}
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn(
            "flex sm:hidden items-center gap-1 px-2 py-1 rounded-full border",
            config.bg,
            config.border
          )}>
            <StatusIcon size={10} className={config.iconColor} />
          </div>

          {showAssistantButton && (
            <button 
              onClick={() => router.push("/ai")} 
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-premium active:scale-95 transition-all hover:opacity-90"
              aria-label="Open Mama Guard Assistant"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">Assistant</span>
            </button>
          )}

          {user?.name && (
            <div className="hidden md:flex w-9 h-9 rounded-full bg-white border border-[var(--warm-200)] items-center justify-center shadow-sm">
              <span className="text-[var(--rose-600)] text-xs font-bold uppercase">{user.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
