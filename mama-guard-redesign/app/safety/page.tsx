"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  AlertCircle, 
  ChevronRight,
  LifeBuoy,
  Stethoscope,
  HeartPulse
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface UserData {
  providerPhone?: string;
  nearestHospital?: string;
}

export default function SafetyPlanPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({});

  useEffect(() => {
    const stored = safeStorage.get<UserData | null>(STORAGE_KEYS.ONBOARDING, null);
    if (stored) {
      setUserData(stored);
    }
  }, []);

  const emergencySigns = [
    "Severe vaginal bleeding (soaking a pad in an hour)",
    "Severe headache that won't go away",
    "Changes in vision (blurriness, spots, flashes)",
    "Significant decrease in baby's movement",
    "Severe abdominal pain or cramping",
    "Fever above 102.4°F (39°C)",
    "Difficulty breathing or chest pain",
    "Sudden swelling in face, hands, or eyes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--warm-200)]/50 px-5 h-16 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="w-9 h-9 rounded-full bg-[var(--warm-100)] flex items-center justify-center active:scale-95"
        >
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <h1 className="font-bold text-[var(--text-primary)] text-lg">Safety Plan</h1>
      </header>

      <main className="pt-20 pb-28 px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 mb-6 text-white shadow-xl shadow-rose-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-bold">Urgent Action</h2>
          </div>
          <p className="text-sm font-medium text-rose-50 leading-relaxed mb-4">
            If you experience any red-flag symptoms, please contact your care team or local emergency services immediately.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1 opacity-80">Prototype Notice</p>
            <p className="text-xs leading-tight opacity-90">
              Mama Guard does not contact emergency services. In urgent situations, contact local emergency services or go to the nearest hospital.
            </p>
          </div>
        </motion.div>

        <section className="mb-6">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Your Care Team</h3>
          <div className="space-y-3">
            <div className="bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border border-[var(--warm-200)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--rose-100)] flex items-center justify-center text-[var(--rose-600)]">
                <Phone size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[var(--text-tertiary)] font-medium">Provider Phone</div>
                <div className="font-bold text-[var(--text-primary)]">{userData.providerPhone || "Not set"}</div>
              </div>
              {userData.providerPhone ? (
                <a 
                  href={`tel:${userData.providerPhone}`}
                  className="px-4 py-2 rounded-xl bg-[var(--rose-500)] text-white text-xs font-bold active:scale-95 transition-all"
                >
                  Call Now
                </a>
              ) : (
                <button 
                  onClick={() => router.push("/profile")}
                  className="text-[var(--rose-600)] font-bold text-xs flex items-center gap-1"
                >
                  Add <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border border-[var(--warm-200)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--sage-100)] flex items-center justify-center text-[var(--sage-600)]">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[var(--text-tertiary)] font-medium">Nearest Hospital</div>
                <div className="font-bold text-[var(--text-primary)]">{userData.nearestHospital || "Not set"}</div>
              </div>
              <button 
                onClick={() => router.push("/profile")}
                className="text-[var(--sage-600)] font-bold text-xs flex items-center gap-1"
              >
                Update <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Red Flag Symptoms</h3>
          <div className="bg-[var(--surface-primary)] rounded-2xl overflow-hidden shadow-sm border border-[var(--warm-200)]">
            {emergencySigns.map((sign, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-3 p-4 ${i !== emergencySigns.length - 1 ? 'border-b border-[var(--warm-100)]' : ''}`}
              >
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                <span className="text-sm text-[var(--text-secondary)] leading-tight">{sign}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Support Resources</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[var(--surface-primary)] p-4 rounded-2xl shadow-sm border border-[var(--warm-200)] text-left">
              <LifeBuoy size={20} className="text-[var(--rose-500)] mb-2" />
              <div className="font-bold text-[var(--text-primary)] text-sm">Crisis Support</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">24/7 Helpline</div>
            </button>
            <button className="bg-[var(--surface-primary)] p-4 rounded-2xl shadow-sm border border-[var(--warm-200)] text-left">
              <HeartPulse size={20} className="text-[var(--rose-500)] mb-2" />
              <div className="font-bold text-[var(--text-primary)] text-sm">Mental Health</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Counseling & Care</div>
            </button>
          </div>
        </section>

        <MedicalDisclaimer variant="emergency" />
      </main>

      <BottomNav />
    </div>
  );
}
