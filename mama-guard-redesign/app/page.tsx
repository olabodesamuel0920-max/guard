"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const data = safeStorage.get<{ name: string; dueDate: string } | null>(STORAGE_KEYS.ONBOARDING, null);
    if (data && data.name && data.dueDate) {
      router.replace("/home");
      return;
    }
    router.replace("/onboarding");
  }, [router]);
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-[var(--rose-400)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
