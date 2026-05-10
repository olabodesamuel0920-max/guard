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
      <main className="pt-20 pb-28 px-5 max-w-lg lg:max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* Left Column: Context & Status */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-2">
              <div className="flex items-center justify-between items-end mb-2">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight">{greeting}</h1>
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} className="relative overflow-hidden rounded-[var(--radius-3xl)] glass-card p-6 lg:p-8 shadow-premium">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[var(--rose-200)]/30 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[var(--rose-300)]/20 blur-xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5"><Baby size={16} className="text-[var(--rose-500)]" /><span className="text-xs font-bold text-[var(--rose-600)] uppercase tracking-wider">{trimester}</span></div>
                    <div className="text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-1 tracking-tight">Week {week}</div>
                    <div className="text-sm lg:text-base text-[var(--text-secondary)] font-medium">Baby is the size of a {babySize.fruit}</div>
                  </div>
                  <div className="text-5xl lg:text-7xl select-none drop-shadow-xl transform hover:scale-110 transition-transform duration-500" role="img" aria-label={babySize.fruit}>{babySize.emoji}</div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mb-2 font-bold uppercase tracking-[0.1em]"><span>Week 0</span><span>Week 40</span></div>
                  <div className="h-4 bg-[var(--rose-100)]/50 rounded-full overflow-hidden shadow-inner p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }} className="h-full bg-gradient-to-r from-[var(--rose-400)] to-[var(--rose-600)] rounded-full shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </motion.div>
                  </div>
                </div>
                {nextMilestone && <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--text-tertiary)] font-bold uppercase tracking-tight"><Calendar size={13} className="text-[var(--rose-400)]" /><span>{nextMilestone.label} in {nextMilestone.week - week} weeks</span></div>}
              </div>
            </motion.div>

            {lastCheckIn && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-[var(--radius-2xl)] bg-white p-6 shadow-md border border-[var(--warm-200)]/60 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Heart size={16} className={lastCheckIn.risk === "high" ? "text-rose-500" : lastCheckIn.risk === "medium" ? "text-amber-500" : "text-emerald-500"} /><span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Latest Check-in</span></div>
                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--warm-100)] px-2.5 py-1 rounded-full uppercase">{getRelativeTime(lastCheckIn.date)}</div>
                </div>
                
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className={`text-xl lg:text-2xl font-extrabold tracking-tight ${lastCheckIn.risk === "high" ? "text-rose-600" : lastCheckIn.risk === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
                      {lastCheckIn.risk.charAt(0).toUpperCase() + lastCheckIn.risk.slice(1)} Risk
                    </div>
                    <div className="text-xs lg:text-sm text-[var(--text-tertiary)] font-medium italic">Reported on {new Date(lastCheckIn.date).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => router.push("/profile")}
                    className="p-2.5 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] hover:bg-[var(--warm-200)] transition-colors shadow-sm"
                  >
                    <Clock size={20} />
                  </button>
                </div>

                {lastCheckIn.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {lastCheckIn.symptoms.slice(0, 3).map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-[var(--warm-50)] text-[11px] font-bold text-[var(--text-secondary)] border border-[var(--warm-100)] shadow-sm">{s}</span>
                    ))}
                    {lastCheckIn.symptoms.length > 3 && <span className="px-3 py-1.5 rounded-xl bg-[var(--warm-50)] text-[11px] font-bold text-[var(--text-tertiary)]">+{lastCheckIn.symptoms.length - 3} more</span>}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button onClick={() => router.push("/checkin")} className="flex-1 py-3 rounded-xl bg-[var(--rose-100)] text-[var(--rose-700)] text-xs font-bold hover:bg-[var(--rose-200)] transition-all active:scale-[0.98] shadow-sm">New Check-in</button>
                  <button onClick={() => router.push("/profile")} className="flex-1 py-3 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] text-xs font-bold hover:bg-[var(--warm-200)] transition-all active:scale-[0.98] shadow-sm">View History</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Actions & Education */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-2">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 px-1">Primary Actions</div>
              <button onClick={() => router.push("/checkin")} className="w-full relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] p-6 text-left shadow-premium hover:scale-[1.02] transition-transform duration-300 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm"><Activity size={28} className="text-white" /></div>
                    <div>
                      <div className="text-white font-bold text-xl mb-0.5 tracking-tight">Start Check-in</div>
                      <div className="text-white/80 text-xs leading-snug max-w-[200px] font-medium">Log symptoms and create clearer information for your care team.</div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={20} className="text-white" />
                  </div>
                </div>
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-1 gap-4 mb-2">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 px-1">Walkthrough Journey</div>
              <div className="rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--warm-50)] to-[var(--bg-cream)] p-5 border border-[var(--warm-200)]/60 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--rose-500)]" />
                  Maternal Journey Guide
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "01", label: "Safety Check-in", desc: "Log symptoms and assess current risk level.", path: "/checkin" },
                    { step: "02", label: "Care Team Summary", desc: "Prepare organized data for your next visit.", path: "/ai" },
                    { step: "03", label: "Safety Protocol", desc: "Access emergency contacts and hospital info.", path: "/safety" }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => router.push(item.path)}
                      className="w-full flex items-start gap-3 group text-left transition-all active:scale-[0.98]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white border border-[var(--warm-200)] flex items-center justify-center text-[10px] font-bold text-[var(--text-tertiary)] shrink-0 group-hover:border-[var(--rose-300)] group-hover:text-[var(--rose-600)] transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--rose-600)] transition-colors">{item.label}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">{item.desc}</div>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-[var(--warm-300)] group-hover:text-[var(--rose-400)] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-2xl bg-gradient-to-br from-[var(--sage-50)] to-[var(--sage-100)] p-6 mb-2 shadow-md border border-[var(--sage-200)]/50">
              <div className="flex items-center gap-2 mb-3"><Zap size={15} className="text-[var(--sage-600)]" /><span className="text-xs font-bold text-[var(--sage-700)] uppercase tracking-wider">Education Spotlight</span></div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 font-medium">
                {week < 12 ? "Stay hydrated and take your prenatal vitamins daily. Small, frequent meals can help with morning sickness." : week < 28 ? "Practice good posture to support your growing belly. Consider starting prenatal yoga or gentle stretching." : "Pack your hospital bag and finalize your birth plan. Rest as much as you can — you're in the home stretch!"}
              </p>
              <button onClick={() => router.push("/learn")} className="text-xs font-bold text-[var(--sage-700)] flex items-center gap-1 hover:translate-x-1 transition-transform">View Educational Modules <ArrowRight size={14} /></button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="rounded-2xl bg-[var(--surface-primary)] p-6 shadow-md border border-[var(--warm-200)]/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100"><CheckCircle2 size={20} className="text-amber-600" /></div>
                  <div>
                    <div className="font-bold text-[var(--text-primary)] text-sm">Wellness Streak</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] font-medium leading-tight">{lastCheckIn ? "Consistency builds better insights" : "Check in daily to track your progress"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[var(--text-primary)] leading-none">{streak}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mt-1">Days</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="pt-6 flex flex-col items-center gap-2 border-t border-[var(--warm-200)]/50">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[var(--sage-500)]" />
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Early Access Privacy</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center px-4 leading-tight font-medium">
                Mama Guard uses privacy-first local-device storage. Cloud synchronization is a future roadmap item.
                This tool provides supportive guidance only and is not a medical diagnosis. Mama Guard does not contact emergency services automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <AssistantFloatingButton /><BottomNav />
    </div>
  );
}
