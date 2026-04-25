"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem("mamaguard_onboarding");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.name && data.dueDate) { router.replace("/home"); return; }
      } catch { /* ignore */ }
    }
    router.replace("/onboarding");
  }, [router]);
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-[var(--rose-400)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
