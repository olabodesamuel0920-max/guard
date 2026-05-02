"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek, getRiskAdvice } from "@/lib/utils";
import type { RiskLevel } from "@/lib/utils";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Activity,
  Thermometer,
  Brain,
  Eye,
  Heart,
  Droplets,
  Baby,
  AlertTriangle,
  ArrowRight,
  Phone,
  MapPin,
  Share2,
  RotateCcw,
  Stethoscope,
  Clock,
  ThumbsUp,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CalendarDays,
} from "lucide-react";

interface Symptom {
  id: string;
  label: string;
  description: string;
  icon: ElementType;
  severity: "high" | "medium" | "low";
}

interface UserData {
  name: string;
  dueDate: string;
}

interface CheckInRecord {
  date: string;
  risk: RiskLevel;
  symptoms: string[];
  followUpAnswers?: Record<string, string>;
}

interface SeverityConfig {
  question: string;
  options: { label: string; value: string; riskModifier?: number }[];
}

const severityConfigs: Record<string, SeverityConfig> = {
  fever: {
    question: "What is your temperature?",
    options: [
      { label: "Under 100.4°F", value: "under_100", riskModifier: 0 },
      { label: "100.4°F or higher", value: "over_100", riskModifier: 2 },
    ],
  },
  headache: {
    question: "How severe is the pain (1-10)?",
    options: [
      { label: "1-3 (Mild)", value: "1_3", riskModifier: 0 },
      { label: "4-6 (Moderate)", value: "4_6", riskModifier: 1 },
      { label: "7-10 (Severe or worsening)", value: "7_10", riskModifier: 2 },
    ],
  },
  vision: {
    question: "What changes are you noticing?",
    options: [
      { label: "Slight blurriness", value: "slight", riskModifier: 1 },
      { label: "Spots or flashes", value: "spots", riskModifier: 2 },
      { label: "Partial vision loss", value: "loss", riskModifier: 2 },
    ],
  },
  swelling: {
    question: "Where is the swelling most prominent?",
    options: [
      { label: "Legs / Ankles", value: "legs", riskModifier: 0 },
      { label: "Hands / Fingers", value: "hands", riskModifier: 1 },
      { label: "Face / Eyes", value: "face", riskModifier: 2 },
    ],
  },
  bleeding: {
    question: "How would you describe the flow?",
    options: [
      { label: "Spotting", value: "spotting", riskModifier: 1 },
      { label: "Light (like period start)", value: "light", riskModifier: 2 },
      { label: "Heavy (soaking a pad)", value: "heavy", riskModifier: 2 },
    ],
  },
  movement: {
    question: "When did you last feel movement?",
    options: [
      { label: "Normal (frequent)", value: "normal", riskModifier: 0 },
      { label: "Less than usual", value: "reduced", riskModifier: 1 },
      { label: "None for 2+ hours", value: "none", riskModifier: 2 },
    ],
  },
  cramps: {
    question: "How intense is the cramping?",
    options: [
      { label: "Mild (like period)", value: "mild", riskModifier: 0 },
      { label: "Strong / Regular", value: "strong", riskModifier: 1 },
      { label: "Severe / Constant", value: "severe", riskModifier: 2 },
    ],
  },
  breathing: {
    question: "What breathing concerns do you have?",
    options: [
      { label: "Short of breath with activity", value: "activity", riskModifier: 1 },
      { label: "Short of breath at rest", value: "rest", riskModifier: 2 },
      { label: "Chest pain or racing heart", value: "chest", riskModifier: 2 },
    ],
  },
  nausea: {
    question: "How severe is the nausea/vomiting?",
    options: [
      { label: "Mild / Occasional", value: "mild", riskModifier: 0 },
      { label: "Moderate (hard to eat)", value: "moderate", riskModifier: 1 },
      { label: "Severe (cannot keep fluid down)", value: "severe", riskModifier: 2 },
    ],
  },
  leg_pain: {
    question: "Where is the pain located?",
    options: [
      { label: "Generalized muscle ache", value: "muscle", riskModifier: 0 },
      { label: "Severe pain in one leg/arm", value: "localized", riskModifier: 2 },
      { label: "Redness or warmth in one area", value: "inflammation", riskModifier: 2 },
    ],
  },
  tiredness: {
    question: "How would you describe the fatigue?",
    options: [
      { label: "Normal pregnancy tiredness", value: "normal", riskModifier: 0 },
      { label: "Overwhelming / Cannot function", value: "severe", riskModifier: 1 },
      { label: "Accompanied by fainting/dizziness", value: "fainting", riskModifier: 2 },
    ],
  },
};

const symptoms: Symptom[] = [
  {
    id: "fever",
    label: "Fever or chills",
    description: "100.4°F / 38°C or higher",
    icon: Thermometer,
    severity: "high",
  },
  {
    id: "headache",
    label: "Severe headache",
    description: "Persistent or intense pain",
    icon: Brain,
    severity: "high",
  },
  {
    id: "vision",
    label: "Vision changes",
    description: "Blurry vision, spots, or flashes",
    icon: Eye,
    severity: "high",
  },
  {
    id: "bleeding",
    label: "Bleeding or leaking",
    description: "Fluid or blood from vagina",
    icon: Droplets,
    severity: "high",
  },
  {
    id: "movement",
    label: "Decreased movement",
    description: "Baby moving less than usual",
    icon: Baby,
    severity: "high",
  },
  {
    id: "breathing",
    label: "Chest or Breathing",
    description: "Pain, racing heart, or shortness of breath",
    icon: Stethoscope,
    severity: "high",
  },
  {
    id: "nausea",
    label: "Severe Nausea",
    description: "Vomiting or cannot eat/drink",
    icon: Activity,
    severity: "high",
  },
  {
    id: "leg_pain",
    label: "Leg or Arm Pain",
    description: "Severe pain, redness, or heat",
    icon: Activity,
    severity: "high",
  },
  {
    id: "swelling",
    label: "Swelling",
    description: "In face, hands, or eyes",
    icon: Heart,
    severity: "high",
  },
  {
    id: "cramps",
    label: "Abdominal cramps",
    description: "Persistent or painful cramping",
    icon: Activity,
    severity: "high",
  },
  {
    id: "tiredness",
    label: "Extreme Fatigue",
    description: "Overwhelming or fainting",
    icon: Clock,
    severity: "high",
  },
  {
    id: "self_harm",
    label: "Thoughts of self-harm",
    description: "Thoughts of harming yourself or your baby",
    icon: Brain,
    severity: "high",
  },
];

// Removed old severityQuestions record in favor of severityConfigs

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAssistant = searchParams.get("from") === "assistant";

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "symptoms" | "severity" | "result"
  >("symptoms");
  const [currentSeverityIndex, setCurrentSeverityIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [showAssistantInsights, setShowAssistantInsights] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});

  const getUserData = () => {
    return safeStorage.get(STORAGE_KEYS.ONBOARDING, { name: "", dueDate: "", providerPhone: "", nearestHospital: "" });
  };

  const userData = getUserData();
  const week = getGestationalWeek(userData.dueDate);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((symptomId) => symptomId !== id) : [...prev, id]
    );
  };

  const calculateRisk = (): RiskLevel => {
    const selected = symptoms.filter((symptom) =>
      selectedSymptoms.includes(symptom.id)
    );

    if (selected.some((symptom) => symptom.severity === "high")) return "high";
    if (selected.some((symptom) => symptom.severity === "medium")) return "medium";

    return "low";
  };

  const handleSubmitSymptoms = () => {
    const risk = calculateRisk();
    setRiskLevel(risk);
    
    const followUpIds = getSelectedSeverityIds();
    if (followUpIds.length > 0) {
      setCurrentStep("severity");
    } else {
      saveCheckIn(risk, {});
      setCurrentStep("result");
    }
  };

  const saveCheckIn = (risk: RiskLevel, answers: Record<string, string>) => {
    const checkInRecord: CheckInRecord = {
      date: new Date().toISOString(),
      risk,
      symptoms: selectedSymptoms.map(
        (id) => symptoms.find((symptom) => symptom.id === id)?.label || id
      ),
      followUpAnswers: answers,
    };

    const existing = safeStorage.get<CheckInRecord[]>(STORAGE_KEYS.CHECKINS, []);
    existing.push(checkInRecord);
    safeStorage.set(STORAGE_KEYS.CHECKINS, existing);
  };

  const getSelectedSeverityIds = () => {
    return selectedSymptoms.filter((id) => severityConfigs[id]);
  };

  const handleSeverityNext = () => {
    const selected = getSelectedSeverityIds();

    if (currentSeverityIndex < selected.length - 1) {
      setCurrentSeverityIndex((prev) => prev + 1);
    } else {
      saveCheckIn(riskLevel, followUpAnswers);
      setCurrentStep("result");
    }
  };

  const getCurrentSeveritySymptom = () => {
    const selected = getSelectedSeverityIds();
    return symptoms.find((symptom) => symptom.id === selected[currentSeverityIndex]);
  };

  const getCurrentSeverityConfig = () => {
    const selected = getSelectedSeverityIds();
    const id = selected[currentSeverityIndex];
    return id ? severityConfigs[id] : null;
  };

  const resetCheckIn = () => {
    setSelectedSymptoms([]);
    setCurrentStep("symptoms");
    setCurrentSeverityIndex(0);
    setRiskLevel("low");
    setShowAssistantInsights(false);
    setFollowUpAnswers({});
  };

  const currentSeveritySymptom = getCurrentSeveritySymptom();
  const selectedSeverityIds = getSelectedSeverityIds();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header />

      <main className="pt-20 pb-[260px] px-5">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() =>
              currentStep === "symptoms"
                ? router.push("/home")
                : setCurrentStep("symptoms")
            }
            className="w-9 h-9 rounded-full bg-[var(--surface-primary)] shadow-sm border border-[var(--warm-200)] flex items-center justify-center active:scale-95"
          >
            <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
          </button>

          <div className="flex-1 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-[var(--rose-500)]" />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                currentStep === "severity" || currentStep === "result"
                  ? "bg-[var(--rose-500)]"
                  : "bg-[var(--warm-200)]"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                currentStep === "result"
                  ? "bg-[var(--rose-500)]"
                  : "bg-[var(--warm-200)]"
              }`}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "symptoms" && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {fromAssistant && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-3xl p-5 mb-8 shadow-sm flex gap-4 items-start relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={40} className="text-rose-500" />
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles size={20} className="text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-rose-950 leading-tight mb-1">
                      Mama Guard Assistant Handoff
                    </p>
                    <p className="text-[11px] text-rose-800/80 leading-relaxed font-medium">
                      Select what you shared with the Assistant. This check-in organizes your symptoms to help you prepare clearer information for your healthcare provider.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-full border border-rose-100">
                      Supportive guidance only
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2 text-[var(--rose-600)]">
                  <Activity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Safety Check-in</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 leading-tight">
                  Check in with your symptoms
                </h1>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  Select what you are experiencing so Mama Guard can help organize your symptoms and prepare supportive next-step guidance.
                </p>
                <div className="bg-[var(--bg-secondary)] border border-[var(--warm-200)] rounded-2xl p-4 flex gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[var(--warm-100)]">
                    <AlertTriangle size={16} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-[var(--text-primary)] font-bold mb-0.5">Medical Disclaimer</p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                      This tool provides supportive risk guidance only and is not a medical diagnosis. If you feel unsafe or symptoms are severe, contact emergency care immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {symptoms.map((symptom, index) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  const Icon = symptom.icon;

                  return (
                    <motion.button
                      type="button"
                      key={symptom.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`relative flex items-center gap-4 p-5 rounded-3xl text-left transition-all duration-300 border-2 ${
                        isSelected
                          ? "border-[var(--rose-400)] bg-[var(--rose-50)] shadow-md shadow-rose-200/20"
                          : "border-[var(--warm-200)] bg-white hover:border-[var(--warm-300)] shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-inner ${
                          isSelected
                            ? "bg-[var(--rose-500)] text-white scale-105"
                            : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                        }`}
                      >
                        <Icon size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                          <span className="font-bold text-[var(--text-primary)] text-base">
                            {symptom.label}
                          </span>

                          {symptom.severity === "high" && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-[9px] font-bold text-rose-700 uppercase tracking-wider">
                              Important
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--text-tertiary)] leading-snug">
                          {symptom.description}
                        </p>
                      </div>

                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-7 h-7 rounded-full bg-[var(--rose-500)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30"
                        >
                          <Check size={16} className="text-white" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-[var(--warm-200)] flex-shrink-0 transition-colors group-hover:border-[var(--rose-200)]" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {selectedSymptoms.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-white border border-[var(--warm-200)] shadow-sm"
                >
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Selected Symptoms</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(id => {
                      const symptom = symptoms.find(s => s.id === id);
                      return (
                        <span key={id} className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px] font-medium border border-[var(--warm-200)]">
                          {symptom?.label}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="fixed bottom-[76px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[var(--warm-200)] px-5 pt-3 pb-4 shadow-[0_-8px_30px_rgb(0,0,0,0.05)]">
                <div className="max-w-lg mx-auto space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className={`w-full py-3 rounded-2xl text-center font-bold text-[10px] uppercase tracking-widest transition-all ${
                      selectedSymptoms.length === 0
                        ? "bg-[var(--sage-50)] text-[var(--sage-600)] border border-[var(--sage-200)]"
                        : "bg-white text-[var(--text-tertiary)] border border-dashed border-[var(--warm-200)]"
                    }`}
                  >
                    {selectedSymptoms.length === 0 ? "✅ I'm feeling fine — no symptoms" : "Clear Selection"}
                  </button>

                  <button
                    type="button"
                    disabled={selectedSymptoms.length === 0}
                    onClick={handleSubmitSymptoms}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                      selectedSymptoms.length > 0
                        ? "bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-rose-500/20 active:scale-[0.98]"
                        : "bg-[var(--warm-200)] text-[var(--text-muted)] cursor-not-allowed"
                    }`}
                  >
                    Continue to Guidance <ChevronRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "severity" && (
            <motion.div
              key="severity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[var(--rose-500)]" />
                  <span className="text-xs font-semibold text-[var(--rose-600)] uppercase tracking-wider">
                    Assistant Follow-up
                  </span>
                </div>

                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Tell us a bit more
                </h1>

                <p className="text-sm text-[var(--text-secondary)]">
                  These details help us give you better guidance
                </p>
              </div>

              {currentSeveritySymptom && (
                <div className="bg-[var(--surface-primary)] rounded-2xl p-5 shadow-md border border-[var(--warm-200)] mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--rose-100)] flex items-center justify-center">
                      {(() => {
                        const SymptomIcon = currentSeveritySymptom.icon;

                        return (
                          <SymptomIcon
                            size={20}
                            className="text-[var(--rose-600)]"
                          />
                        );
                      })()}
                    </div>

                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {currentSeveritySymptom.label}
                      </div>

                      <div className="text-xs text-[var(--text-tertiary)]">
                        Question {currentSeverityIndex + 1} of{" "}
                        {selectedSeverityIds.length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getCurrentSeverityConfig()?.options.map((option) => {
                      const isSelected = followUpAnswers[currentSeveritySymptom.id] === option.label;
                      
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => setFollowUpAnswers(prev => ({ ...prev, [currentSeveritySymptom.id]: option.label }))}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                            isSelected 
                              ? "border-[var(--rose-400)] bg-[var(--rose-50)] shadow-sm" 
                              : "border-[var(--warm-200)] hover:border-[var(--rose-300)]"
                          }`}
                        >
                          <span className={`text-sm ${isSelected ? "text-[var(--rose-700)] font-medium" : "text-[var(--text-secondary)]"}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSeverityNext}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white font-semibold shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {currentSeverityIndex < selectedSeverityIds.length - 1
                  ? "Next Question"
                  : "See Results"}{" "}
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className={`rounded-3xl p-6 mb-5 ${
                  riskLevel === "high"
                    ? "bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200"
                    : riskLevel === "medium"
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200"
                    : "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      riskLevel === "high"
                        ? "bg-rose-500"
                        : riskLevel === "medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  >
                    {riskLevel === "high" ? (
                      <AlertTriangle size={28} className="text-white" />
                    ) : riskLevel === "medium" ? (
                      <Clock size={28} className="text-white" />
                    ) : (
                      <ThumbsUp size={28} className="text-white" />
                    )}
                  </div>

                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block ${
                        riskLevel === "high"
                          ? "text-rose-600"
                          : riskLevel === "medium"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {riskLevel === "high" ? "Urgent Action Recommended" : riskLevel === "medium" ? "Monitoring Advised" : "No Concerns Detected"}
                    </span>

                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {riskLevel === "high"
                        ? "Contact Your Care Team"
                        : riskLevel === "medium"
                        ? "Track Symptoms Closely"
                        : "Continue Routine Care"}
                    </h2>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 mb-5 border border-white/40 shadow-sm">
                  <h3 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em] mb-3 border-b border-black/5 pb-2">Check-in Summary</h3>
                  <div className="space-y-3">
                    {selectedSymptoms.map((id) => {
                      const symptom = symptoms.find((item) => item.id === id);
                      const answer = followUpAnswers[id];
                      return symptom ? (
                        <div key={id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-primary)] font-bold">{symptom.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${symptom.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                              {symptom.severity === 'high' ? 'Important' : 'Normal'}
                            </span>
                          </div>
                          {answer && (
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-black/5 rounded-lg px-2 py-1.5">
                              <Sparkles size={12} className="text-[var(--rose-500)]" />
                              <span>{answer}</span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })}
                    {selectedSymptoms.length === 0 && (
                      <div className="text-sm text-[var(--text-tertiary)] italic py-2">No concerning symptoms reported today.</div>
                    )}
                  </div>
                </div>

                <div className={`rounded-2xl p-4 mb-2 ${
                  riskLevel === "high" ? "bg-rose-100/50" : riskLevel === "medium" ? "bg-amber-100/50" : "bg-emerald-100/50"
                }`}>
                  <p className={`text-sm leading-relaxed font-semibold ${
                    riskLevel === "high" ? "text-rose-900" : riskLevel === "medium" ? "text-amber-900" : "text-emerald-900"
                  }`}>
                    {getRiskAdvice(riskLevel, week)}
                  </p>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] italic leading-tight mt-4">
                  Mama Guard provides supportive risk guidance only. It does not diagnose or replace professional medical care.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                {riskLevel === "high" && (
                  <>
                    {userData.providerPhone ? (
                      <a
                        href={`tel:${userData.providerPhone}`}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Phone size={20} /> Call Provider ({userData.providerPhone})
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push("/profile")}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Phone size={20} /> Add Provider Phone
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => alert("Prototype Notice: In a real version, this would show nearby emergency care centers. Please contact local emergency services or go to the nearest emergency care center.")}
                      className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-semibold active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MapPin size={20} /> Find emergency care
                    </button>
                  </>
                )}

                {riskLevel === "medium" && (
                  <button
                    type="button"
                    onClick={() => router.push("/safety")}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={20} /> View Safety Plan
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const statusText = riskLevel === "high" ? "URGENT ACTION RECOMMENDED" : riskLevel === "medium" ? "MONITORING ADVISED" : "ROUTINE MONITORING";
                    const adviceText = getRiskAdvice(riskLevel, week);
                    
                    const summary = `Mama Guard Check-in Summary\n--------------------------\nDate: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\nGestational Week: ${week}\nGuidance Level: ${statusText}\n\nSymptoms Reported:\n${selectedSymptoms.map(id => {
                      const s = symptoms.find(item => item.id === id);
                      const answer = followUpAnswers[id];
                      return `• ${s ? s.label : id}${answer ? ` (${answer})` : ""}`;
                    }).join("\n") || "No symptoms reported"}\n\nSuggested Next Steps:\n${adviceText}\n\n--------------------------\nNote: This is a prototype summary generated by Mama Guard for supportive risk guidance only. It is not a medical diagnosis or clinical record.`;
                    
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(summary).then(() => alert("Summary copied! You can now paste this to your provider.")).catch(() => alert("Failed to copy. Please take a screenshot."));
                    } else {
                      alert("Clipboard not available. Please take a screenshot of this result.");
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-white border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-bold active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 size={18} className="text-[var(--rose-500)]" /> Copy Summary for Provider
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-semibold text-sm active:scale-[0.95] flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={resetCheckIn}
                  className="py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-semibold text-sm active:scale-[0.95] flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> New Check-in
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAssistantInsights((prev) => !prev)}
                className="w-full py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-primary)] font-medium active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
              >
                <Sparkles size={18} className="text-[var(--rose-500)]" />
                {showAssistantInsights ? "Hide" : "View"} Assistant Insights
              </button>

              <AnimatePresence>
                {showAssistantInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <div className="rounded-2xl bg-gradient-to-br from-[var(--rose-50)] to-[var(--bg-secondary)] p-5 border border-[var(--rose-200)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-[var(--rose-500)]" />
                        <span className="text-sm font-semibold text-[var(--rose-700)]">
                          Assistant Context
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                        <p>
                          Based on your symptoms at week {week} of pregnancy,
                          here&apos;s what to consider:
                        </p>

                        {selectedSymptoms.includes("fever") && (
                          <p>
                            • Fever in the{" "}
                            {week > 28 ? "third" : week > 12 ? "second" : "first"}{" "}
                            trimester should be monitored closely. Stay hydrated
                            and track your temperature.
                          </p>
                        )}

                        {selectedSymptoms.includes("headache") && (
                          <p>
                            • Persistent headaches with vision changes can
                            indicate blood pressure concerns. Rest in a dark room
                            and monitor.
                          </p>
                        )}

                        {selectedSymptoms.includes("bleeding") && (
                          <p>
                            • Any vaginal bleeding at {week} weeks warrants
                            prompt medical evaluation, even if light.
                          </p>
                        )}

                        {selectedSymptoms.length === 0 && (
                          <p>
                            • No concerning symptoms reported. Continue your
                            prenatal vitamins and stay active with light exercise.
                          </p>
                        )}

                        <p className="text-[var(--text-tertiary)] text-xs mt-3 pt-3 border-t border-[var(--warm-200)]">
                          This is not a medical diagnosis. Always consult your
                          healthcare provider for personalized medical advice.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={resetCheckIn}
                className="w-full py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-medium active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw size={16} /> Start New Check-in
              </button>

              <button
                type="button"
                onClick={() => router.push("/home")}
                className="w-full mt-4 py-3 text-[var(--rose-600)] font-semibold text-sm flex items-center justify-center gap-1"
              >
                Return to Home <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><Activity className="text-[var(--rose-500)] animate-pulse" size={32} /></div>}>
      <CheckInContent />
    </Suspense>
  );
}
