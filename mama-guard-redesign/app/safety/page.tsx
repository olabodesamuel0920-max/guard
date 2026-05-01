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
  HeartPulse,
  Shield,
  Heart,
  Sparkles,
  Activity,
  User,
  ArrowRight
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface UserData {
  name?: string;
  providerPhone?: string;
  nearestHospital?: string;
  emergencyContact?: string;
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
    "Severe headache that won't go away or gets worse",
    "Changes in vision (blurriness, spots, flashes)",
    "Significant decrease in baby's movement",
    "Severe abdominal pain or cramping",
    "Fever of 100.4°F (38°C) or higher",
    "Chest pain, fast-beating heart, or trouble breathing",
    "Sudden swelling in face, hands, or eyes",
    "Dizziness, fainting, or extreme fatigue",
    "Severe nausea and vomiting",
    "Severe swelling, redness, or pain in leg or arm",
    "Vaginal fluid leaking during pregnancy",
    "Heavy bleeding or discharge after pregnancy",
    "Thoughts of harming yourself or your baby"
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
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2 text-[var(--rose-600)]">
            <Shield size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Safety Protocol</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">Your Safety Plan</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
            Keep your provider details, nearest hospital, warning signs, and emergency guidance in one easy-to-find place.
          </p>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
            <p className="text-[10px] text-rose-800 leading-tight font-medium">
              <strong>Emergency Note:</strong> Mama Guard does not contact emergency services. If you feel unsafe or symptoms are severe, contact your healthcare provider or local emergency care immediately.
            </p>
          </div>
        </motion.div>        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Care Team</h3>
            <button onClick={() => router.push("/profile")} className="text-[11px] font-bold text-[var(--rose-600)] flex items-center gap-1">Update Profile <ArrowRight size={12} /></button>
          </div>
          <div className="space-y-3">
            {/* Provider */}
            <div className={`bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border transition-colors ${!userData.providerPhone ? 'border-amber-200 bg-amber-50/40' : 'border-[var(--warm-200)]'} flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-[var(--rose-100)] flex items-center justify-center text-[var(--rose-600)] shrink-0">
                <Phone size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">Primary Provider</div>
                <div className={`font-bold truncate ${userData.providerPhone ? 'text-[var(--text-primary)]' : 'text-amber-700 italic text-sm'}`}>
                  {userData.providerPhone || "Add provider in Profile"}
                </div>
              </div>
              {userData.providerPhone && (
                <a href={`tel:${userData.providerPhone}`} className="w-10 h-10 rounded-full bg-[var(--rose-500)] text-white flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-90 transition-all">
                  <Phone size={18} />
                </a>
              )}
            </div>

            {/* Hospital */}
            <div className={`bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border transition-colors ${!userData.nearestHospital ? 'border-amber-200 bg-amber-50/40' : 'border-[var(--warm-200)]'} flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-[var(--sage-100)] flex items-center justify-center text-[var(--sage-600)] shrink-0">
                <MapPin size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">Nearest Hospital</div>
                <div className={`font-bold truncate ${userData.nearestHospital ? 'text-[var(--text-primary)]' : 'text-amber-700 italic text-sm'}`}>
                  {userData.nearestHospital || "Add nearest hospital in Profile"}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className={`bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border transition-colors ${!userData.emergencyContact ? 'border-amber-200 bg-amber-50/40' : 'border-[var(--warm-200)]'} flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Heart size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">Emergency Contact</div>
                <div className={`font-bold truncate ${userData.emergencyContact ? 'text-[var(--text-primary)]' : 'text-amber-700 italic text-sm'}`}>
                  {userData.emergencyContact || "Add emergency contact in Profile"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Warning Signs to Watch For</h3>
          <div className="bg-[var(--surface-primary)] rounded-3xl overflow-hidden shadow-sm border border-[var(--warm-200)] divide-y divide-[var(--warm-100)]">
            {[
              "Fever 100.4°F / 38°C or higher",
              "Heavy bleeding or fluid leaking",
              "Severe headache that won't go away",
              "Vision changes (blurring, spots, flashes)",
              "Sudden swelling of face or hands",
              "Chest pain, racing heart, or shortness of breath",
              "Reduced baby movement",
              "Severe abdominal pain or stomach cramps",
              "Severe nausea or vomiting",
              "Dizziness, fainting, or seizures",
              "Thoughts of harming yourself or baby"
            ].map((sign, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-[var(--warm-50)] transition-colors">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0 shadow-sm shadow-rose-200" />
                <span className="text-sm font-medium text-[var(--text-secondary)] leading-tight">{sign}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Action Guide</h3>
          <div className="bg-white rounded-3xl p-5 border border-[var(--warm-200)] shadow-sm space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] flex items-center justify-center shrink-0 font-bold text-sm">1</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed"><span className="font-bold text-[var(--text-primary)]">Call your provider</span> if symptoms concern you or you notice any warning signs above.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] flex items-center justify-center shrink-0 font-bold text-sm">2</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed"><span className="font-bold text-[var(--text-primary)]">Go to nearest emergency care</span> if symptoms are severe, worsening, or life-threatening.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] flex items-center justify-center shrink-0 font-bold text-sm">3</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed"><span className="font-bold text-[var(--text-primary)]">Bring your provider summary</span> from the Assistant to help the care team understand your history.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)] flex items-center justify-center shrink-0 font-bold text-sm">4</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed"><span className="font-bold text-[var(--text-primary)]">Trust your maternal intuition.</span> If something feels wrong, seek care regardless of symptoms.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gradient-to-br from-[var(--surface-primary)] to-[var(--bg-cream)] rounded-3xl p-6 border border-[var(--warm-200)] shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--rose-100)] to-[var(--rose-200)] flex items-center justify-center"><Sparkles size={20} className="text-[var(--rose-600)]" /></div>
              <h4 className="font-bold text-[var(--text-primary)]">Organize your concern</h4>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              Mama Guard Assistant can help prepare a provider summary or guide you into a structured check-in.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push("/ai")} className="py-3 rounded-2xl bg-white border border-[var(--warm-200)] text-[var(--text-primary)] text-xs font-bold active:scale-[0.98] transition-all shadow-sm">Open Assistant</button>
              <button onClick={() => router.push("/checkin?from=safety")} className="py-3 rounded-2xl bg-[var(--rose-500)] text-white text-xs font-bold active:scale-[0.98] transition-all shadow-md shadow-rose-500/20">Start Check-in</button>
            </div>
          </div>
        </section>

        <div className="mb-8 px-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[var(--sage-500)]" />
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Early Access Transparency</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center px-6 leading-tight">
            Mama Guard stores safety plan details locally on this device.
            This tool provides supportive guidance only and is not a medical diagnosis.
          </p>
        </div>

        <MedicalDisclaimer variant="emergency" />
      </main>

      <BottomNav />
    </div>
  );
}
