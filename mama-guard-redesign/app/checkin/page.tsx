"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek, getRiskAdvice, getTrimester } from "@/lib/utils";
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
  status?: "pregnant" | "postpartum";
  providerPhone?: string;
  nearestHospital?: string;
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
      { label: "Heavy (soaking through one or more pads in an hour)", value: "heavy", riskModifier: 2 },
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
    label: "Headache",
    description: "Persistent, intense, or worsening pain",
    icon: Brain,
    severity: "medium",
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

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAssistant = searchParams.get("from") === "assistant";
  const incomingSymptom = searchParams.get("symptom");

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "symptoms" | "severity" | "result"
  >("symptoms");
  const [currentSeverityIndex, setCurrentSeverityIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [showAssistantInsights, setShowAssistantInsights] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const userData = safeStorage.get<UserData>(STORAGE_KEYS.ONBOARDING, { name: "", dueDate: "" });
  const week = getGestationalWeek(userData.dueDate);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((symptomId) => symptomId !== id) : [...prev, id]
    );
  };

  const calculateRisk = (currentSymptoms: string[], answers: Record<string, string>): RiskLevel => {
    const selected = symptoms.filter((symptom) =>
      currentSymptoms.includes(symptom.id)
    );

    // High severity symptoms like fever still trigger high risk immediately
    if (selected.some((symptom) => symptom.severity === "high")) return "high";

    // Nuanced Headache Logic
    if (currentSymptoms.includes("headache")) {
      const headacheAnswer = answers["headache"];
      
      // Headache + 7-10 Severe/worsening = NEEDS CARE
      if (headacheAnswer === "7-10 (Severe or worsening)") return "high";

      // Headache + Red Flags = NEEDS CARE
      const redFlags = ["vision", "swelling", "breathing", "bleeding", "movement", "self_harm"];
      const fatigueAnswer = answers["tiredness"];
      const hasFainting = fatigueAnswer === "Accompanied by fainting/dizziness";
      
      if (currentSymptoms.some(id => redFlags.includes(id)) || hasFainting) {
        return "high";
      }
      
      // Headache + 1-3 Mild or 4-6 Moderate = REVIEW
      return "medium";
    }

    if (selected.some((symptom) => symptom.severity === "medium")) return "medium";

    return "low";
  };

  const handleSubmitSymptoms = () => {
    const risk = calculateRisk(selectedSymptoms, {});
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
      const finalRisk = calculateRisk(selectedSymptoms, followUpAnswers);
      setRiskLevel(finalRisk);
      saveCheckIn(finalRisk, followUpAnswers);
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
      <Header status={currentStep === "result" ? (riskLevel === "high" ? "urgent" : riskLevel === "medium" ? "review" : "safe") : "safe"} />

      <main className="pt-20 pb-[260px] md:pb-24 px-5 max-w-lg mx-auto md:max-w-7xl">
        <div className="flex items-center gap-2 mb-6 md:mb-10">
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
              className="md:grid md:grid-cols-12 md:gap-10 lg:gap-16 items-start"
            >
              <div className="md:col-span-4 lg:col-span-4 md:sticky md:top-24 space-y-8">
                {fromAssistant && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[var(--rose-50)] to-white border border-[var(--rose-100)] rounded-3xl p-4 sm:p-5 shadow-sm flex gap-4 items-start relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={40} className="text-[var(--rose-500)]" />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[var(--rose-100)] flex items-center justify-center shrink-0 shadow-inner">
                      <Sparkles size={20} className="text-[var(--rose-600)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[var(--rose-950)] leading-tight mb-1">
                        Assistant Handoff
                      </p>
                      <p className="text-[11px] text-[var(--rose-800)]/80 leading-relaxed font-medium mb-2 hidden sm:block">
                        The Assistant suggested a structured check-in so you can organize your symptoms and prepare next-step guidance for your provider.
                      </p>
                      <p className="text-[11px] text-[var(--rose-800)]/80 leading-relaxed font-medium mb-2 sm:hidden">
                        Use this check-in to organize your concern for your provider.
                      </p>
                      {incomingSymptom && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[var(--rose-200)] shadow-sm">
                          <Activity size={12} className="text-[var(--rose-600)]" />
                          <span className="text-[10px] font-bold text-[var(--rose-700)] uppercase tracking-wider">
                            Reported concern: {decodeURIComponent(incomingSymptom)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[var(--rose-600)]">
                    <Activity size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Safety Check-in</span>
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-5 leading-[1.15]">
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

                {selectedSymptoms.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl bg-white border border-[var(--warm-200)] shadow-sm hidden md:block"
                  >
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Currently Selected</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(id => {
                        const symptom = symptoms.find(s => s.id === id);
                        return (
                          <span key={id} className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--warm-200)] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--rose-500)]" />
                            {symptom?.label}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="md:col-span-8 lg:col-span-8 mt-8 md:mt-0">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-8">
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

                            {(symptom.severity === "high" || symptom.id === "headache") && (
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

                <div className="md:hidden">
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
                </div>

                <div className="fixed bottom-[76px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[var(--warm-200)] px-5 pt-3 pb-4 shadow-[0_-8px_30px_rgb(0,0,0,0.05)] md:relative md:bottom-0 md:bg-transparent md:backdrop-blur-none md:border-t-0 md:px-0 md:pb-0 md:shadow-none md:mt-8">
                  <div className="max-w-lg mx-auto md:max-w-none space-y-3">
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
              </div>
            </motion.div>
          )}

          {currentStep === "severity" && (
            <motion.div
              key="severity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="md:grid md:grid-cols-12 md:gap-10 items-start"
            >
              <div className="md:col-span-4 lg:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-[var(--rose-500)]" />
                    <span className="text-xs font-semibold text-[var(--rose-600)] uppercase tracking-wider">
                      Assistant Follow-up
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Tell us a bit more
                  </h1>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    These details help us give you better guidance and prepare you for a conversation with your provider.
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 lg:col-span-8 mt-8 md:mt-0">
                {currentSeveritySymptom && (
                  <div className="bg-[var(--surface-primary)] rounded-3xl p-6 shadow-md border border-[var(--warm-200)] mb-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--warm-100)]">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--rose-100)] flex items-center justify-center">
                        {(() => {
                          const SymptomIcon = currentSeveritySymptom.icon;
                          return <SymptomIcon size={24} className="text-[var(--rose-600)]" />;
                        })()}
                      </div>

                      <div>
                        <div className="font-bold text-lg text-[var(--text-primary)]">
                          {currentSeveritySymptom.label}
                        </div>

                        <div className="text-xs text-[var(--text-tertiary)] font-medium">
                          Question {currentSeverityIndex + 1} of {selectedSeverityIds.length}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-base font-semibold text-[var(--text-primary)] mb-4">
                        {getCurrentSeverityConfig()?.question}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {getCurrentSeverityConfig()?.options.map((option) => {
                          const isSelected = followUpAnswers[currentSeveritySymptom.id] === option.label;
                          
                          return (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => setFollowUpAnswers(prev => ({ ...prev, [currentSeveritySymptom.id]: option.label }))}
                              className={`w-full text-left p-5 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                                isSelected 
                                  ? "border-[var(--rose-400)] bg-[var(--rose-50)] shadow-sm" 
                                  : "border-[var(--warm-200)] hover:border-[var(--rose-300)] bg-white"
                              }`}
                            >
                              <span className={`text-sm ${isSelected ? "text-[var(--rose-700)] font-bold" : "text-[var(--text-secondary)] font-medium"}`}>
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSeverityNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white font-bold shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {currentSeverityIndex < selectedSeverityIds.length - 1
                    ? "Next Question"
                    : "See Results"}{" "}
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="md:grid md:grid-cols-12 md:gap-10 items-start"
            >
              <div className="md:col-span-4 lg:col-span-5 md:sticky md:top-24">
                <div
                  className={`rounded-3xl p-6 md:p-8 mb-5 ${
                    riskLevel === "high"
                      ? "bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 shadow-rose-100/50 shadow-lg"
                      : riskLevel === "medium"
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-amber-100/50 shadow-lg"
                      : "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-emerald-100/50 shadow-lg"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                        riskLevel === "high"
                          ? "bg-rose-500"
                          : riskLevel === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    >
                      {riskLevel === "high" ? (
                        <AlertTriangle size={32} className="text-white" />
                      ) : riskLevel === "medium" ? (
                        <Clock size={32} className="text-white" />
                      ) : (
                        <ThumbsUp size={32} className="text-white" />
                      )}
                    </div>

                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 block ${
                          riskLevel === "high"
                            ? "text-rose-600"
                            : riskLevel === "medium"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {riskLevel === "high" ? "Urgent Action Recommended" : riskLevel === "medium" ? "Monitoring Advised" : "No Concerns Detected"}
                      </span>

                      <h2 className="text-2xl font-extrabold text-[var(--text-primary)] leading-tight">
                        {riskLevel === "high"
                          ? "Contact Your Care Team"
                          : riskLevel === "medium"
                          ? "Track Symptoms Closely"
                          : "Continue Routine Care"}
                      </h2>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-5 mb-2 ${
                    riskLevel === "high" ? "bg-rose-100/50" : riskLevel === "medium" ? "bg-amber-100/50" : "bg-emerald-100/50"
                  }`}>
                    <p className={`text-[15px] leading-relaxed font-bold ${
                      riskLevel === "high" ? "text-rose-950" : riskLevel === "medium" ? "text-amber-950" : "text-emerald-950"
                    }`}>
                      {getRiskAdvice(riskLevel, week)}
                    </p>
                  </div>

                  {selectedSymptoms.includes("headache") && riskLevel !== "high" && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-100/50 border border-amber-200">
                      <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                        If the headache does not go away, gets worse, or comes with vision changes, swelling, dizziness, chest pain, or reduced baby movement, contact your healthcare provider or emergency care.
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-[var(--text-tertiary)] italic leading-relaxed mt-4 font-medium opacity-80">
                    Mama Guard provides supportive risk guidance only. It does not diagnose or replace professional medical care.
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 lg:col-span-7 mt-5 md:mt-0 space-y-6">
                <div className="bg-white border border-[var(--warm-200)] rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays size={16} className="text-[var(--text-tertiary)]" />
                    <h3 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Check-in Summary · Today</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedSymptoms.map((id) => {
                      const symptom = symptoms.find((item) => item.id === id);
                      const answer = followUpAnswers[id];
                      return symptom ? (
                        <div key={id} className="flex flex-col gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--warm-100)]">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-primary)] font-bold text-sm">{symptom.label}</span>
                            {(() => {
                              let label = symptom.severity === 'high' ? 'Important' : 'Review';
                              let color = symptom.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700';
                              
                              if (id === 'headache') {
                                const redFlags = ["vision", "swelling", "breathing", "bleeding", "movement", "self_harm"];
                                const hasRedFlags = selectedSymptoms.some(sid => redFlags.includes(sid));
                                if (answer === "7-10 (Severe or worsening)" || hasRedFlags) {
                                  label = "Important";
                                  color = "bg-rose-100 text-rose-700";
                                }
                                // Otherwise stays 'Review' with amber styling
                              }
                              
                              return (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${color}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                          {answer && (
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-white/60 rounded-xl px-3 py-2 border border-black/5">
                              <Sparkles size={12} className="text-[var(--rose-500)]" />
                              <span className="font-medium">
                                {id === 'fever' && answer === 'Under 100.4°F' 
                                  ? "Chills or feeling feverish; temperature under 100.4°F" 
                                  : answer}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })}
                    {selectedSymptoms.length === 0 && (
                      <div className="flex items-center gap-3 py-4 text-emerald-700">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="text-sm font-bold italic">No concerning symptoms reported today.</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {riskLevel === "high" && (
                    <>
                      {userData.providerPhone ? (
                        <a
                          href={`tel:${userData.providerPhone}`}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <Phone size={20} /> Call Provider
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => router.push("/profile")}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <Phone size={20} /> Add Provider Contact
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => alert("Prototype Notice: In a real version, this would show nearby emergency care centers. Please contact local emergency services or go to the nearest emergency care center.")}
                        className="w-full py-4 rounded-2xl bg-white border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-bold active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                      >
                        <MapPin size={20} /> Emergency Care
                      </button>
                    </>
                  )}

                  {riskLevel === "medium" && (
                    <button
                      type="button"
                      onClick={() => router.push("/safety")}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 sm:col-span-2"
                    >
                      <ShieldAlert size={20} strokeWidth={2.5} /> View Safety Plan
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const statusText = riskLevel === "high" ? "NEEDS CARE" : riskLevel === "medium" ? "REVIEW" : "SAFE";
                      const adviceText = getRiskAdvice(riskLevel, week);
                      const trimester = getTrimester(week);
                      const stageText = userData.dueDate ? `Week ${week}, ${trimester}` : "Not added yet";
                      
                      const summary = `Mama Guard Check-in Summary\n\nName: ${userData.name || "Not added yet"}\nPregnancy stage: ${stageText}\nDate: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\nResult status: ${statusText}\n\nReported symptom(s):\n${selectedSymptoms.map(id => {
                        const s = symptoms.find(item => item.id === id);
                        return `• ${s ? s.label : id}`;
                      }).join("\n") || "No symptoms reported"}\n\nSeverity/details:\n${selectedSymptoms.map(id => {
                        const s = symptoms.find(item => item.id === id);
                        let answer = followUpAnswers[id];
                        if (id === 'fever' && answer === 'Under 100.4°F') {
                          answer = "Chills or feeling feverish; temperature under 100.4°F";
                        }
                        return `• ${s?.label}: ${answer || "Standard severity"}`;
                      }).join("\n") || "No details"}\n\nSuggested next step:\n${adviceText}\n\nCare team contact:\n- Provider phone: ${userData.providerPhone || "Not added yet"}\n- Nearest hospital: ${userData.nearestHospital || "Not added yet"}\n\nImportant note:\nMama Guard provides supportive organization and risk guidance only. It does not diagnose or replace professional medical care.`;
                      
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(summary)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          })
                          .catch(() => {
                            alert("Clipboard copy failed. Please take a screenshot of your results.");
                          });
                      } else {
                        alert("Clipboard access is not available on this browser. Please take a screenshot of your results.");
                      }
                    }}
                    className={`w-full py-4 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${
                      copied 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-white border-[var(--warm-200)] text-[var(--text-primary)] hover:border-[var(--warm-300)]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-emerald-500" /> Summary Copied
                      </>
                    ) : (
                      <>
                        <Share2 size={18} className="text-[var(--rose-500)]" /> Share Summary
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-6 border-t border-[var(--warm-100)] space-y-3">
                  <button
                    type="button"
                    onClick={resetCheckIn}
                    className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-bold active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <RotateCcw size={18} /> Start New Check-in
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/home")}
                    className="w-full py-3 text-[var(--rose-600)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Return to Dashboard <ArrowRight size={18} />
                  </button>
                </div>
              </div>
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
