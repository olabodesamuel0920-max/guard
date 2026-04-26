"use client";

import { useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek, getRiskAdvice } from "@/lib/utils";
import type { RiskLevel } from "@/lib/utils";
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
}

const symptoms: Symptom[] = [
  {
    id: "fever",
    label: "Fever or chills",
    description: "Temperature above 100.4°F / 38°C",
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
    id: "swelling",
    label: "Swelling",
    description: "In face, hands, or legs",
    icon: Heart,
    severity: "medium",
  },
  {
    id: "bleeding",
    label: "Vaginal bleeding",
    description: "Any amount of spotting or flow",
    icon: Droplets,
    severity: "high",
  },
  {
    id: "movement",
    label: "Decreased fetal movement",
    description: "Less kicks than usual",
    icon: Baby,
    severity: "high",
  },
  {
    id: "cramps",
    label: "Abdominal cramps",
    description: "Persistent or painful cramping",
    icon: Activity,
    severity: "medium",
  },
  {
    id: "breathing",
    label: "Breathing difficulty",
    description: "Shortness of breath at rest",
    icon: Stethoscope,
    severity: "high",
  },
];

const severityQuestions: Record<string, string[]> = {
  fever: [
    "How high is your temperature?",
    "When did it start?",
    "Are you taking any medication?",
  ],
  headache: [
    "On a scale of 1-10, how severe?",
    "Is it accompanied by vision changes?",
    "Have you had these before?",
  ],
  vision: ["When did you first notice changes?", "Is it in one eye or both?"],
  swelling: ["Where is the swelling?", "Did it come on suddenly?"],
  bleeding: [
    "How much bleeding? (spotting/light/heavy)",
    "Any pain with the bleeding?",
    "When did it start?",
  ],
  movement: [
    "When did you last feel movement?",
    "Have you tried drinking cold water?",
  ],
  cramps: ["How frequent are the cramps?", "Are they getting stronger?"],
  breathing: ["Does it happen at rest or with activity?", "Any chest pain?"],
};

export default function CheckInPage() {
  const router = useRouter();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "symptoms" | "severity" | "result"
  >("symptoms");
  const [currentSeverityIndex, setCurrentSeverityIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [showAIInsights, setShowAIInsights] = useState(false);

  const getUserData = (): UserData => {
    try {
      if (typeof window === "undefined") {
        return { name: "", dueDate: "" };
      }

      const stored = localStorage.getItem("mamaguard_onboarding");
      return stored ? JSON.parse(stored) : { name: "", dueDate: "" };
    } catch {
      return { name: "", dueDate: "" };
    }
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

    const checkInRecord: CheckInRecord = {
      date: new Date().toISOString(),
      risk,
      symptoms: selectedSymptoms.map(
        (id) => symptoms.find((symptom) => symptom.id === id)?.label || id
      ),
    };

    try {
      const existingRaw = localStorage.getItem("mamaguard_checkins");
      const existing: CheckInRecord[] = existingRaw ? JSON.parse(existingRaw) : [];

      existing.push(checkInRecord);
      localStorage.setItem("mamaguard_checkins", JSON.stringify(existing));
    } catch {
      localStorage.setItem("mamaguard_checkins", JSON.stringify([checkInRecord]));
    }

    setCurrentStep(selectedSymptoms.length > 0 ? "severity" : "result");
  };

  const getSelectedSeverityIds = () => {
    return selectedSymptoms.filter((id) => severityQuestions[id]);
  };

  const handleSeverityNext = () => {
    const selected = getSelectedSeverityIds();

    if (currentSeverityIndex < selected.length - 1) {
      setCurrentSeverityIndex((prev) => prev + 1);
    } else {
      setCurrentStep("result");
    }
  };

  const getCurrentSeveritySymptom = () => {
    const selected = getSelectedSeverityIds();
    return symptoms.find((symptom) => symptom.id === selected[currentSeverityIndex]);
  };

  const getCurrentSeverityQuestions = () => {
    const selected = getSelectedSeverityIds();
    const currentSymptomId = selected[currentSeverityIndex];

    return currentSymptomId ? severityQuestions[currentSymptomId] || [] : [];
  };

  const resetCheckIn = () => {
    setSelectedSymptoms([]);
    setCurrentStep("symptoms");
    setCurrentSeverityIndex(0);
    setRiskLevel("low");
    setShowAIInsights(false);
  };

  const currentSeveritySymptom = getCurrentSeveritySymptom();
  const selectedSeverityIds = getSelectedSeverityIds();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header />

      <main className="pt-20 pb-28 px-5">
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
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  How are you feeling?
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Select any symptoms you&apos;re experiencing today. Tap again
                  to deselect.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6">
                {symptoms.map((symptom, index) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  const Icon = symptom.icon;

                  return (
                    <motion.button
                      type="button"
                      key={symptom.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 border-2 ${
                        isSelected
                          ? "border-[var(--rose-400)] bg-[var(--rose-50)] shadow-md"
                          : "border-[var(--warm-200)] bg-[var(--surface-primary)] shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? "bg-[var(--rose-500)] text-white"
                            : "bg-[var(--warm-100)] text-[var(--text-tertiary)]"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)] text-[15px]">
                            {symptom.label}
                          </span>

                          {symptom.severity === "high" && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[10px] font-bold text-[var(--rose-700)] uppercase">
                              Important
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {symptom.description}
                        </p>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-[var(--rose-500)] flex items-center justify-center flex-shrink-0"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setSelectedSymptoms([])}
                className={`w-full py-3.5 rounded-2xl text-center font-medium text-sm transition-all mb-6 ${
                  selectedSymptoms.length === 0
                    ? "bg-[var(--sage-100)] text-[var(--sage-700)] border-2 border-[var(--sage-300)]"
                    : "bg-transparent text-[var(--text-tertiary)] border-2 border-dashed border-[var(--warm-200)]"
                }`}
              >
                I&apos;m feeling fine today — no symptoms
              </button>

              <button
                type="button"
                onClick={handleSubmitSymptoms}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)] text-white font-semibold shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={20} />
              </button>
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
                    AI Follow-up
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
                    {getCurrentSeverityQuestions().map((question, index) => (
                      <button
                        type="button"
                        key={`${question}-${index}`}
                        className="w-full text-left p-4 rounded-xl border-2 border-[var(--warm-200)] hover:border-[var(--rose-300)] hover:bg-[var(--rose-50)] transition-all active:scale-[0.98]"
                      >
                        <span className="text-sm text-[var(--text-secondary)]">
                          {question}
                        </span>
                      </button>
                    ))}
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
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
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
                      className={`text-xs font-bold uppercase tracking-wider ${
                        riskLevel === "high"
                          ? "text-rose-600"
                          : riskLevel === "medium"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {riskLevel} Risk
                    </span>

                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {riskLevel === "high"
                        ? "Please Seek Care"
                        : riskLevel === "medium"
                        ? "Monitor Closely"
                        : "Looking Good"}
                    </h2>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    riskLevel === "high"
                      ? "text-rose-800"
                      : riskLevel === "medium"
                      ? "text-amber-800"
                      : "text-emerald-800"
                  }`}
                >
                  {getRiskAdvice(riskLevel, week)}
                </p>

                {selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((id) => {
                      const symptom = symptoms.find((item) => item.id === id);

                      return symptom ? (
                        <span
                          key={id}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            riskLevel === "high"
                              ? "bg-rose-200 text-rose-800"
                              : riskLevel === "medium"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-emerald-200 text-emerald-800"
                          }`}
                        >
                          {symptom.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {riskLevel === "high" && (
                <div className="space-y-3 mb-5">
                  <button
                    type="button"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Phone size={20} /> Call Your Provider
                  </button>

                  <button
                    type="button"
                    className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-semibold active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <MapPin size={20} /> Find Nearest ER
                  </button>
                </div>
              )}

              {riskLevel === "medium" && (
                <div className="space-y-3 mb-5">
                  <button
                    type="button"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Phone size={20} /> Call Advice Line
                  </button>

                  <button
                    type="button"
                    className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-semibold active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <CalendarDays size={20} /> Schedule Appointment
                  </button>
                </div>
              )}

              {riskLevel === "low" && (
                <div className="space-y-3 mb-5">
                  <button
                    type="button"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={20} /> Log Wellness Entry
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAIInsights((prev) => !prev)}
                className="w-full py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-primary)] font-medium active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
              >
                <Sparkles size={18} className="text-[var(--rose-500)]" />
                {showAIInsights ? "Hide" : "View"} AI Insights
              </button>

              <AnimatePresence>
                {showAIInsights && (
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
                          Personalized Context
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {}}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-medium active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 size={16} /> Share
                </button>

                <button
                  type="button"
                  onClick={resetCheckIn}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--surface-primary)] border border-[var(--warm-200)] text-[var(--text-secondary)] font-medium active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw size={16} /> Check In Again
                </button>
              </div>

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
