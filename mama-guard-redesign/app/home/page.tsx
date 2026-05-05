"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { AssistantFloatingButton } from "@/components/AssistantFloatingButton";
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
      <main className="pt-20 pb-28 px-5 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <div className="flex items-center justify-between items-end mb-2">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{greeting}</h1>
              <p className="text-[var(--text-tertiary)] text-xs font-medium uppercase tracking-wider">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--rose-50)] px-3 py-1.5 rounded-full border border-[var(--rose-100)]">
              <Shield size={12} className="text-[var(--rose-500)]" />
              <span className="text-[10px] font-bold text-[var(--rose-700)] uppercase tracking-tight">Early Access</span>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-3 max-w-[90%]">
            Your maternal safety companion for tracking symptoms, understanding warning signs, and preparing care information.
          </p>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 px-1">Primary Actions</div>
          <button onClick={() => router.push("/checkin")} className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] p-5 text-left shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Activity size={24} className="text-white" /></div>
                <div>
                  <div className="text-white font-bold text-lg mb-0.5">Start Check-in</div>
                  <div className="text-white/80 text-xs leading-snug max-w-[200px]">Log symptoms and create clearer information for your care team.</div>
                </div>
              </div>
              <ChevronRight size={24} className="text-white/70" />
            </div>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="grid grid-cols-1 gap-3 mb-6">
          <button onClick={() => router.push("/ai")} className="rounded-2xl bg-[var(--surface-primary)] p-5 text-left shadow-md border border-[var(--warm-200)]/60 active:scale-[0.98] transition-transform flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--rose-100)] to-[var(--rose-200)] flex items-center justify-center shrink-0"><Sparkles size={24} className="text-[var(--rose-600)]" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <div className="font-bold text-[var(--text-primary)] text-base">Mama Guard Assistant</div>
                <ChevronRight size={18} className="text-[var(--text-tertiary)]" />
              </div>
              <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">Understand warning signs and prepare provider summaries.</div>
              <div className="text-[9px] text-[var(--rose-500)] font-bold uppercase tracking-wider mt-1.5">Supportive guidance only</div>
            </div>
          </button>

          <button onClick={() => router.push("/safety")} className="rounded-2xl bg-[var(--surface-primary)] p-5 text-left shadow-md border border-[var(--warm-200)]/60 active:scale-[0.98] transition-transform flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shrink-0"><Shield size={24} className="text-rose-600" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <div className="font-bold text-[var(--text-primary)] text-base">Safety Plan</div>
                <ChevronRight size={18} className="text-[var(--text-tertiary)]" />
              </div>
              <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">Keep provider details and hospital info easy to find.</div>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Heart size={16} className={lastCheckIn.risk === "high" ? "text-rose-500" : lastCheckIn.risk === "medium" ? "text-amber-500" : "text-emerald-500"} /><span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Latest Check-in</span></div>
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--warm-100)] px-2 py-0.5 rounded-full uppercase">{getRelativeTime(lastCheckIn.date)}</div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-lg font-bold ${lastCheckIn.risk === "high" ? "text-rose-600" : lastCheckIn.risk === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
                  {lastCheckIn.risk.charAt(0).toUpperCase() + lastCheckIn.risk.slice(1)} Risk
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">Reported on {new Date(lastCheckIn.date).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => router.push("/profile")}
                className="p-2 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] active:scale-95"
              >
                <Clock size={18} />
              </button>
            </div>

            {lastCheckIn.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lastCheckIn.symptoms.slice(0, 3).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-[var(--warm-50)] text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--warm-100)]">{s}</span>
                ))}
                {lastCheckIn.symptoms.length > 3 && <span className="px-2.5 py-1 rounded-lg bg-[var(--warm-50)] text-[10px] font-medium text-[var(--text-tertiary)]">+{lastCheckIn.symptoms.length - 3} more</span>}
              </div>
            )}
            
            <div className="flex gap-2">
              <button onClick={() => router.push("/checkin")} className="flex-1 py-2.5 rounded-xl bg-[var(--rose-100)] text-[var(--rose-700)] text-xs font-bold active:scale-[0.98]">New Check-in</button>
              <button onClick={() => router.push("/profile")} className="flex-1 py-2.5 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] text-xs font-bold active:scale-[0.98]">View History</button>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="rounded-2xl bg-[var(--surface-primary)] p-5 shadow-md border border-[var(--warm-200)]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100"><CheckCircle2 size={20} className="text-amber-600" /></div>
              <div>
                <div className="font-semibold text-[var(--text-primary)] text-sm">Wellness Streak</div>
                <div className="text-xs text-[var(--text-tertiary)]">{lastCheckIn ? "Consistency builds better insights" : "Check in daily to track your progress"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{streak}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter">Days</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-8 flex flex-col items-center gap-2 py-4 border-t border-[var(--warm-200)]/50">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[var(--sage-500)]" />
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Early Access Privacy</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center px-6 leading-tight">
            Mama Guard uses privacy-first local-device storage. Cloud synchronization is a future roadmap item.
            This tool provides supportive guidance only and is not a medical diagnosis. Mama Guard does not contact emergency services automatically.
          </p>
        </motion.div>
      </main>
      <AssistantFloatingButton /><BottomNav />
    </div>
  );
}
