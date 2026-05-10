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
  Users,
  Sparkles
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
      <Header title="About Mama Guard" showAssistantButton={true} />

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
            Our Mission
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            Mama Guard is an <strong>early-access maternal safety companion</strong> dedicated to reducing preventable complications by empowering mothers with symptom tracking, warning-sign education, and provider-ready communication tools.
          </p>
        </motion.section>

        {/* What it Helps With */}
        <section className="mb-12">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 px-1">
            Evidence-Informed Support
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, rotateX: 2, rotateY: -2, scale: 1.02 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[var(--surface-primary)] p-4 rounded-3xl border border-[var(--warm-200)] shadow-premium-sm transition-all duration-300 transform-style-3d perspective-1000"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--warm-100)] flex items-center justify-center mb-3 shadow-inner">
                  <f.icon size={18} className="text-[var(--rose-500)]" />
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1">{f.title}</h3>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-normal font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-white/50 backdrop-blur-sm rounded-[32px] p-6 border border-[var(--warm-200)] shadow-sm">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
            The User Journey
          </h2>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4 group items-start">
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  className="text-xl font-black text-[var(--warm-200)] leading-none pt-0.5 group-hover:text-[var(--rose-300)] transition-colors drop-shadow-sm"
                >
                  {s.number}
                </motion.div>
                <div className="relative">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--rose-600)] transition-colors">{s.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Boundaries */}
        <section className="mb-12">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 px-1">
            Medical Safety Governance
          </h2>
          <div className="bg-rose-50 rounded-3xl p-5 border border-rose-100 space-y-4">
            {[
              "Provides supportive guidance, not clinical diagnosis",
              "Complements, never replaces, licensed clinical care",
              "Educational only: Does not contact emergency services",
              "Privacy First: Zero remote server data storage"
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-rose-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                </div>
                <p className="text-xs font-bold text-rose-800">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="mb-12">
          <div className="bg-[var(--text-primary)] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <Lock className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">
              Data Sovereignty
            </h2>
            <p className="text-xs leading-relaxed mb-4 opacity-90 font-medium">
              Mama Guard uses a <strong>Privacy-First Architecture</strong> where all personal health data is stored exclusively on your device.
            </p>
            <ul className="space-y-2 mb-2">
              <li className="flex gap-2 text-[10px] opacity-80 font-medium">
                <CheckCircle size={12} className="flex-shrink-0 text-emerald-400" />
                <span>Zero-knowledge client-side storage model.</span>
              </li>
              <li className="flex gap-2 text-[10px] opacity-80 font-medium">
                <CheckCircle size={12} className="flex-shrink-0 text-emerald-400" />
                <span>Encrypted cloud synchronization roadmap.</span>
              </li>
              <li className="flex gap-2 text-[10px] opacity-80 font-medium">
                <CheckCircle size={12} className="flex-shrink-0 text-emerald-400" />
                <span>Absolute user control over data export/deletion.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Product Roadmap */}
        <section className="mb-12 px-1">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Development Roadmap
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { text: "Secure accounts & encrypted cloud sync", done: false },
              { text: "Multilingual localization (Pidgin, Yoruba, etc.)", done: false },
              { text: "Healthcare provider collaboration gateway", done: false },
              { text: "Independent medical/safety audit of modules", done: true, highlight: true }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${item.highlight ? 'bg-[var(--rose-50)] border-[var(--rose-100)]' : 'bg-white border-[var(--warm-200)]'} transition-colors`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.highlight ? 'bg-[var(--rose-100)] text-[var(--rose-600)]' : 'bg-[var(--warm-100)] text-[var(--text-tertiary)]'}`}>
                  {item.highlight ? <Sparkles size={12} /> : <ArrowRight size={12} />}
                </div>
                <span className={`text-[11px] font-bold ${item.highlight ? 'text-[var(--rose-700)]' : 'text-[var(--text-secondary)]'}`}>{item.text}</span>
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
