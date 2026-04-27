"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { AIFloatingButton } from "@/components/AIFloatingButton";
import { getGestationalWeek, getTrimester, getBabySize, getGreeting, getRelativeTime } from "@/lib/utils";
import { Heart, Activity, BookOpen, ChevronRight, Calendar, Sparkles, Shield, CheckCircle2, Clock, Baby, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

interface CheckInRecord { date: string; risk: "low" | "medium" | "high"; symptoms: string[]; }

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; status: string; dueDate: string } | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord | null>(null);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = safeStorage.get<{ name: string; status: string; dueDate: string } | null>(STORAGE_KEYS.ONBOARDING, null);
    if (data) {
      setUser(data);
      if (!data.name) router.replace("/onboarding");
    } else {
      router.replace("/onboarding");
    }

    const checkins = safeStorage.get<CheckInRecord[]>(STORAGE_KEYS.CHECKINS, []);
    if (checkins.length > 0) {
      setLastCheckIn(checkins[checkins.length - 1]);
      
      // Basic streak
      const dates = checkins.map(c => new Date(c.date).toDateString());
      const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        let s = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const current = new Date(uniqueDates[i]);
          const next = new Date(uniqueDates[i+1]);
          if ((current.getTime() - next.getTime()) / 86400000 <= 1.1) s++;
          else break;
        }
        setStreak(s);
      }
    }
  }, [router]);

  if (!mounted || !user) return null;

  const week = getGestationalWeek(user.dueDate);
  const trimester = getTrimester(week);
  const babySize = getBabySize(week);
  const greeting = getGreeting(user.name);
  const progress = Math.min(100, Math.max(0, (week / 40) * 100));
  const milestones = [{ week: 12, label: "End of 1st trimester" }, { week: 20, label: "Halfway point" }, { week: 28, label: "3rd trimester begins" }, { week: 37, label: "Full term" }];
  const nextMilestone = milestones.find((m) => m.week > week);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header />
      <main className="pt-20 pb-28 px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{greeting}</h1>
          <p className="text-[var(--text-tertiary)] text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--rose-50)] via-[#FFF5F0] to-[var(--bg-secondary)] p-6 mb-5 shadow-lg border border-[var(--rose-200)]/40">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[var(--rose-200)]/20 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[var(--rose-300)]/15 blur-xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><Baby size={16} className="text-[var(--rose-500)]" /><span className="text-xs font-semibold text-[var(--rose-600)] uppercase tracking-wider">{trimester}</span></div>
                <div className="text-4xl font-extrabold text-[var(--text-primary)] mb-1">Week {week}</div>
                <div className="text-sm text-[var(--text-secondary)]">Baby is the size of a {babySize.fruit}</div>
              </div>
              <div className="text-5xl select-none" role="img" aria-label={babySize.fruit}>{babySize.emoji}</div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1.5"><span>Week 0</span><span>Week 40</span></div>
              <div className="h-2.5 bg-[var(--rose-100)] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[var(--rose-400)] to-[var(--rose-600)] rounded-full" />
              </div>
            </div>
            {nextMilestone && <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]"><Calendar size={13} /><span>{nextMilestone.label} in {nextMilestone.week - week} weeks</span></div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-5">
          <button onClick={() => router.push("/checkin")} className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] p-5 text-left shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Activity size={24} className="text-white" /></div>
                <div>
                  <div className="text-white font-bold text-lg mb-0.5">Daily Check-in</div>
                  <div className="text-white/80 text-sm">{lastCheckIn ? `Last check-in: ${getRelativeTime(lastCheckIn.date)}` : "How are you feeling today?"}</div>
                </div>
              </div>
              <ChevronRight size={24} className="text-white/70" />
            </div>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => router.push("/ai")} className="rounded-2xl bg-[var(--surface-primary)] p-4 text-left shadow-md border border-[var(--warm-200)]/60 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--rose-100)] to-[var(--rose-200)] flex items-center justify-center mb-3"><Sparkles size={20} className="text-[var(--rose-600)]" /></div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-0.5">Assistant</div>
            <div className="text-xs text-[var(--text-tertiary)]">Get personalized guidance</div>
          </button>
          <button onClick={() => router.push("/learn")} className="rounded-2xl bg-[var(--surface-primary)] p-4 text-left shadow-md border border-[var(--warm-200)]/60 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-100)] to-[var(--sage-200)] flex items-center justify-center mb-3"><BookOpen size={20} className="text-[var(--sage-600)]" /></div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-0.5">Learn</div>
            <div className="text-xs text-[var(--text-tertiary)]">Tips for week {week}</div>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-2xl bg-gradient-to-br from-[var(--sage-50)] to-[var(--sage-100)] p-5 mb-5 shadow-md border border-[var(--sage-200)]/50">
          <div className="flex items-center gap-2 mb-2"><Zap size={15} className="text-[var(--sage-600)]" /><span className="text-xs font-semibold text-[var(--sage-700)] uppercase tracking-wider">Today&apos;s Tip</span></div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            {week < 12 ? "Stay hydrated and take your prenatal vitamins daily. Small, frequent meals can help with morning sickness." : week < 28 ? "Practice good posture to support your growing belly. Consider starting prenatal yoga or gentle stretching." : "Pack your hospital bag and finalize your birth plan. Rest as much as you can — you're in the home stretch!"}
          </p>
          <button onClick={() => router.push("/learn")} className="text-xs font-semibold text-[var(--sage-700)] flex items-center gap-1 hover:underline">Read more <ArrowRight size={12} /></button>
        </motion.div>

        {lastCheckIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="rounded-2xl bg-[var(--surface-primary)] p-5 mb-5 shadow-md border border-[var(--warm-200)]/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Heart size={15} className={lastCheckIn.risk === "high" ? "text-[var(--rose-500)]" : lastCheckIn.risk === "medium" ? "text-amber-500" : "text-[var(--sage-500)]"} /><span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Recent Status</span></div>
              <span className={`badge ${lastCheckIn.risk === "high" ? "badge-high" : lastCheckIn.risk === "medium" ? "badge-medium" : "badge-low"}`}>{lastCheckIn.risk.toUpperCase()} RISK</span>
            </div>
            {lastCheckIn.symptoms.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{lastCheckIn.symptoms.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-[var(--warm-100)] text-xs text-[var(--text-secondary)] border border-[var(--warm-200)]">{s}</span>)}</div>}
            <button onClick={() => router.push("/checkin")} className="text-xs font-semibold text-[var(--rose-600)] flex items-center gap-1">Check in again <ArrowRight size={12} /></button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="rounded-2xl bg-[var(--surface-primary)] p-5 shadow-md border border-[var(--warm-200)]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--amber-100)] flex items-center justify-center"><CheckCircle2 size={20} className="text-[var(--amber-600)]" /></div>
              <div>
                <div className="font-semibold text-[var(--text-primary)] text-sm">Wellness Streak</div>
                <div className="text-xs text-[var(--text-tertiary)]">{lastCheckIn ? "Keep checking in daily for better insights" : "Start your first check-in to begin tracking"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{streak}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">days</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6 flex items-center justify-center gap-2 py-4">
          <Shield size={14} className="text-[var(--sage-500)]" />
          <span className="text-[11px] text-[var(--text-muted)]">Your information is stored privately on this device for this prototype.</span>
        </motion.div>
      </main>
      <AIFloatingButton /><BottomNav />
    </div>
  );
}
