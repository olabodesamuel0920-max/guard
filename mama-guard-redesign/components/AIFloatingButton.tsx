"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function AIFloatingButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push("/ai")} className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-lg shadow-rose-500/30 flex items-center justify-center active:scale-95 transition-all" aria-label="Ask MamaGuard AI">
      <Sparkles size={22} strokeWidth={2} />
    </button>
  );
}
