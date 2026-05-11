"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Shield, Activity, Users, ArrowRight, Zap, Sparkles } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

export default function RootPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStart = () => {
    const data = safeStorage.get<{ name: string; dueDate: string } | null>(STORAGE_KEYS.ONBOARDING, null);
    if (data && data.name && data.dueDate) {
      router.push("/home");
    } else {
      router.push("/onboarding");
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* 3D-Lite Floating Background Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          x: [0, 10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] -left-20 w-64 h-64 bg-[var(--rose-200)]/10 rounded-full blur-[80px] pointer-events-none"
      />
      <motion.div
        animate={{ 
          y: [0, 25, 0],
          x: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] -right-20 w-80 h-80 bg-[var(--rose-300)]/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        {/* Hero Illustration Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[280px]"
        >
          {/* Main Illustration */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 drop-shadow-2xl"
          >
            <Image
              src="/illustrations/maternal-safety-hero.png"
              alt="Mother and child protected by a soft safety glow"
              width={560}
              height={560}
              className="rounded-3xl w-full h-auto"
              priority
            />
          </motion.div>

          {/* Background Glow Effect */}
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-rose-400/20 rounded-full blur-[60px] -z-10"
          />
          
          {/* Small Floating Accent */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 flex items-center justify-center shadow-lg z-20"
          >
            <Heart size={20} className="text-rose-500 fill-rose-500" />
          </motion.div>
        </motion.div>

        {/* Hero Copy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] text-[10px] font-bold uppercase tracking-wider mb-6 border border-[var(--rose-200)] shadow-sm">
            <Sparkles size={12} className="animate-pulse" /> Early Access Companion
          </div>
          
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight mb-4">
            Mama Guard
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
            Personalized safety support for your pregnancy and postpartum journey.
          </p>
        </motion.div>

        {/* Value Propositions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 gap-4"
        >
          {[
            { icon: Activity, title: "Symptom Tracking", desc: "Organize daily check-ins." },
            { icon: Shield, title: "Warning Signs", desc: "Recognize red flags early." },
            { icon: Users, title: "Care Readiness", desc: "Prepare provider summaries." }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02, y: -4, rotateX: 2, rotateY: -2 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-[var(--warm-200)]/60 shadow- premium-sm text-left transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--rose-50)] flex items-center justify-center text-[var(--rose-600)] shrink-0 shadow-inner">
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm">{item.title}</h3>
                <p className="text-xs text-[var(--text-tertiary)] font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-4"
        >
          <button 
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white font-bold text-base shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            Start Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => router.push("/worker")}
            className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-secondary)] font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Users size={18} /> Stakeholder Preview
          </button>
        </motion.div>

        {/* Safety Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8 border-t border-[var(--warm-200)]/50"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <Shield size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Privacy First Architecture</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight max-w-[280px] font-medium">
              Educational companion only. Does not provide medical diagnosis or replace professional care. Data stored locally.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
