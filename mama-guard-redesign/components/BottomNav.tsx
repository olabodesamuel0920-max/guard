"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/checkin", label: "Check In", icon: ClipboardList },
  { path: "/learn", label: "Learn", icon: BookOpen },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home" || pathname === "/";
    return pathname === path || pathname?.startsWith(path);
  };

  return (
    <nav className="fixed md:relative bottom-0 left-0 right-0 z-50 md:z-auto">
      <div className="h-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
      <div className="bg-[var(--surface-glass)] backdrop-blur-xl border-t border-[var(--warm-200)]/60 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-lg md:max-w-6xl mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]",
                  active ? "text-[var(--rose-600)] bg-[var(--rose-50)]/80" : "text-[var(--text-tertiary)]"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} className={cn("transition-all", active && "scale-105")} />
                <span className={cn("text-[11px] font-medium", active && "font-semibold")}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
