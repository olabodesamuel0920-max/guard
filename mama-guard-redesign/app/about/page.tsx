"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { 
  Heart, 
  Shield, 
  Info, 
  FileText, 
  CheckCircle, 
  Zap, 
  Lock, 
  ChevronRight, 
  ArrowRight, 
  Baby,
  Activity,
  AlertCircle,
  Users
} from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  const features = [
    { icon: Activity, title: "Track Symptoms", desc: "Monitor changes and track health patterns daily." },
    { icon: AlertCircle, title: "Warning Signs", desc: "Understand red flags and when to seek urgent care." },
    { icon: FileText, title: "Care Info", desc: "Prepare organized summaries for your healthcare team." },
    { icon: Users, title: "Care Team", desc: "Keep provider and hospital contacts in one secure place." },
    { icon: Shield, title: "Safety Plan", desc: "Access emergency steps and contacts instantly." },
    { icon: Baby, title: "Guidance", desc: "Evidence-informed pregnancy and postpartum support." }
  ];

  const steps = [
    { number: "01", title: "Setup", desc: "Configure your profile and care team contacts." },
    { number: "02", title: "Check-in", desc: "Complete daily or urgent symptom assessments." },
    { number: "03", title: "Review", desc: "Get instant risk guidance and recommended steps." },
    { number: "04", title: "Act", desc: "Use your safety plan or provider summary as needed." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header showAssistantButton={false} />

      <main className="pt-24 pb-32 px-5">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] text-[10px] font-bold uppercase tracking-wider mb-4">
            <Zap size={12} /> Early Access Companion
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            About Mama Guard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            Mama Guard is a maternal safety companion designed to help mothers track symptoms, 
            understand warning signs, and communicate effectively with healthcare providers.
          </p>
        </motion.section>

        {/* What it Helps With */}
        <section className="mb-12">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 px-1">
            How we support you
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[var(--surface-primary)] p-4 rounded-3xl border border-[var(--warm-200)] shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--warm-100)] flex items-center justify-center mb-3">
                  <f.icon size={18} className="text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1">{f.title}</h3>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-normal">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-[var(--surface-primary)] rounded-[32px] p-6 border border-[var(--warm-200)] shadow-sm">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
            The Process
          </h2>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="text-xl font-black text-[var(--warm-200)] leading-none pt-0.5">
                  {s.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{s.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Boundaries */}
        <section className="mb-12">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 px-1">
            Safety Boundaries
          </h2>
          <div className="bg-rose-50 rounded-3xl p-5 border border-rose-100 space-y-4">
            {[
              "Does not provide medical diagnosis",
              "Does not replace doctors or midwives",
              "Does not contact emergency services",
              "Does not store data on remote servers"
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                </div>
                <p className="text-xs font-medium text-rose-700">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="mb-12">
          <div className="bg-[var(--warm-900)] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <Lock className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">
              Data & Privacy
            </h2>
            <p className="text-xs leading-relaxed mb-4 opacity-90">
              In this early-access phase, Mama Guard uses a <strong>privacy-first architecture</strong> where your data is stored locally on your device.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex gap-2 text-[10px] opacity-80">
                <CheckCircle size={12} className="flex-shrink-0" />
                <span>Clearing browser data may remove saved records.</span>
              </li>
              <li className="flex gap-2 text-[10px] opacity-80">
                <CheckCircle size={12} className="flex-shrink-0" />
                <span>Secure cloud sync is planned for future versions.</span>
              </li>
              <li className="flex gap-2 text-[10px] opacity-80">
                <CheckCircle size={12} className="flex-shrink-0" />
                <span>Export or delete data anytime in your Profile.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* AI Positioning */}
        <section className="mb-12 px-1">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-[var(--rose-500)]" />
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              AI Positioning
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            The Mama Guard Assistant provides supportive guidance to help you organize symptoms and understand warning signs.
          </p>
          <div className="bg-[var(--warm-50)] p-3 rounded-xl border border-[var(--warm-100)] flex gap-3">
            <Info size={16} className="text-[var(--text-muted)] flex-shrink-0" />
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium italic">
              "Assistant is not an AI doctor and does not provide medical diagnosis or prescriptions."
            </p>
          </div>
        </section>

        {/* Future Vision */}
        <section className="mb-12 px-1">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Product Roadmap
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Secure accounts & cross-device cloud sync",
              "Expanded multilingual support (Pidgin, Yoruba, etc.)",
              "Healthcare provider collaboration interface",
              "Independent medical/safety review of educational modules"
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                <ArrowRight size={12} className="text-[var(--warm-300)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="space-y-3">
          <button 
            onClick={() => router.push("/checkin")}
            className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            Go to Check-in <ChevronRight size={18} />
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push("/safety")}
              className="py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Safety Plan
            </button>
            <button 
              onClick={() => router.push("/profile")}
              className="py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Your Profile
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
