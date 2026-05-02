"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Baby, Sparkles, ChevronRight, ChevronLeft, Calendar, User, Shield, Check, Activity } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

const slides = [
  { id: "welcome", title: "Welcome to Mama Guard", subtitle: "A supportive prototype for your maternal health journey", icon: Heart, color: "from-rose-400 to-rose-600" },
  { id: "features", title: "Personalized Support", subtitle: "Daily check-ins and educational resources tailored to your week", icon: Sparkles, color: "from-violet-400 to-violet-600" },
  { id: "safety", title: "Safe & Private", subtitle: "Your information is stored privately on this device for this prototype.", icon: Shield, color: "from-emerald-400 to-emerald-600" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ 
    name: "", 
    status: "pregnant" as "pregnant" | "postpartum", 
    dueDate: "",
    providerPhone: "",
    nearestHospital: ""
  });
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    if (step < 7) { setStep(step + 1); }
    else {
      safeStorage.set(STORAGE_KEYS.ONBOARDING, data);
      safeStorage.set(STORAGE_KEYS.ONBOARDED_DATE, new Date().toISOString());
      router.push("/home");
    }
  };

  const handleBack = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };
  const canProceed = () => { 
    if (step === 3) return data.name.trim().length > 0; 
    if (step === 5) return data.dueDate.length > 0; 
    return true; 
  };
  const SlideIcon = slides[step]?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)] flex flex-col max-w-lg mx-auto">
      <div className="pt-6 px-6">
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[var(--rose-500)]" : "bg-[var(--warm-200)]"}`} />)}
        </div>
      </div>
      {step > 0 && (
        <button onClick={handleBack} className="absolute top-6 left-5 w-10 h-10 rounded-full bg-[var(--surface-primary)] shadow-sm border border-[var(--warm-200)] flex items-center justify-center active:scale-95 transition-transform z-10">
          <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
        </button>
      )}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }} transition={{ duration: 0.35 }}>
            {step === 0 ? (
              <div className="text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20">
                  <Heart size={32} className="text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-[var(--text-primary)] leading-tight mb-4">
                  Welcome to <br />
                  <span className="text-rose-500">Mama Guard</span>
                </h1>
                <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed">
                  Supportive guidance for your maternal health journey.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { title: "Track Symptoms", desc: "Daily check-ins for your well-being.", icon: Activity },
                    { title: "Know Warning Signs", desc: "Learn what signs require urgent care.", icon: Shield },
                    { title: "Prepare Your Plan", desc: "Keep your care team details ready.", icon: Baby }
                  ].map((card, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <card.icon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">{card.title}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{card.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-medium leading-tight">
                  <Shield size={14} className="shrink-0" />
                  <span>Privacy First: All data is stored locally on this device only. This is a medical prototype.</span>
                </div>
              </div>
            ) : step === 1 || step === 2 ? (
              <div className="text-center">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[step].color} flex items-center justify-center mx-auto mb-8 shadow-xl`}>{SlideIcon && <SlideIcon size={40} className="text-white" />}</div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">{slides[step].title}</h1>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-xs mx-auto">{slides[step].subtitle}</p>
              </div>
            ) : step === 3 ? (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center mb-6 shadow-lg"><User size={28} className="text-white" /></div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">What&apos;s your name?</h1>
                <p className="text-[var(--text-secondary)] mb-8">We&apos;ll personalize your experience</p>
                <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Enter your name" className="w-full text-xl font-medium bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--rose-400)] focus:outline-none transition-colors shadow-sm" autoFocus />
              </div>
            ) : step === 4 ? (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center mb-6 shadow-lg"><Baby size={28} className="text-white" /></div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">What&apos;s your journey?</h1>
                <p className="text-[var(--text-secondary)] mb-8">This helps us tailor the experience</p>
                <div className="space-y-3">
                  {([{ value: "pregnant", label: "I'm Pregnant", desc: "Track pregnancy & get weekly guidance" }, { value: "postpartum", label: "I'm Postpartum", desc: "Recovery support & newborn care" }] as const).map((option) => (
                    <button key={option.value} onClick={() => setData({ ...data, status: option.value })} className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${data.status === option.value ? "border-[var(--rose-400)] bg-[var(--rose-50)] shadow-md" : "border-[var(--warm-200)] bg-[var(--surface-primary)]"}`}>
                      <div className="flex items-center justify-between">
                        <div><div className="font-semibold text-[var(--text-primary)] mb-0.5">{option.label}</div><div className="text-xs text-[var(--text-tertiary)]">{option.desc}</div></div>
                        {data.status === option.value && <div className="w-6 h-6 rounded-full bg-[var(--rose-500)] flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : step === 5 ? (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center mb-6 shadow-lg"><Calendar size={28} className="text-white" /></div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">When is your due date?</h1>
                <p className="text-[var(--text-secondary)] mb-8">We&apos;ll calculate your week and milestones</p>
                <input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} className="w-full text-lg font-medium bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:border-[var(--rose-400)] focus:outline-none transition-colors shadow-sm mb-6" />
              </div>
            ) : step === 6 ? (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center mb-6 shadow-lg"><Shield size={28} className="text-white" /></div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Provider Contact</h1>
                <p className="text-[var(--text-secondary)] mb-8">Optional info for your safety plan</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase ml-1 mb-1.5 block">Doctor/Midwife Phone</label>
                    <input 
                      type="tel" 
                      value={data.providerPhone} 
                      onChange={(e) => setData({ ...data, providerPhone: e.target.value })} 
                      placeholder="+1 (555) 000-0000" 
                      className="w-full bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] focus:border-[var(--rose-400)] focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase ml-1 mb-1.5 block">Nearest Hospital/Facility</label>
                    <input 
                      type="text" 
                      value={data.nearestHospital} 
                      onChange={(e) => setData({ ...data, nearestHospital: e.target.value })} 
                      placeholder="e.g. City General Hospital" 
                      className="w-full bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] focus:border-[var(--rose-400)] focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">You&apos;re all set!</h1>
                <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">
                  Remember: Mama Guard stores data <strong>on this device only</strong>. This is a prototype and not a substitute for professional medical care.
                </p>
                <MedicalDisclaimer />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="px-6 pb-10 pt-4">
        <button onClick={handleNext} disabled={!canProceed()} className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${canProceed() ? "bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-lg shadow-rose-500/25 active:scale-[0.98]" : "bg-[var(--warm-200)] text-[var(--text-muted)] cursor-not-allowed"}`}>
          {step === 7 ? "Get Started" : "Continue"}<ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
