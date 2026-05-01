"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Loader2, Heart, Baby, Activity, Shield, AlertTriangle, CheckCircle2, Stethoscope, BookOpen, Phone, X, FileText, User } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { getGestationalWeek, getTrimester } from "@/lib/utils";

interface Message { 
  id: string; 
  role: "user" | "assistant"; 
  content: string; 
  type?: "text" | "action" | "warning" | "safety" | "summary"; 
  actions?: { label: string; icon: React.ElementType; action: string }[]; 
  structuredWarning?: {
    title: string;
    subtitle: string;
    sections: { label: string; content: string }[];
  };
  safetyCard?: {
    provider?: string;
    hospital?: string;
    contact?: string;
  };
  summaryData?: string;
}

interface UserProfile {
  name: string;
  status: "pregnant" | "postpartum";
  dueDate: string;
  providerPhone?: string;
  nearestHospital?: string;
  emergencyContact?: string;
}

const quickPromptGroups = [
  {
    category: "Urgent symptoms",
    prompts: [
      { label: "Severe headache", icon: AlertTriangle, prompt: "I have a severe headache" },
      { label: "Baby moving less", icon: Baby, prompt: "My baby is moving less" },
      { label: "Dizzy or faint", icon: Activity, prompt: "I feel dizzy or faint" },
      { label: "Bleeding or Fluid", icon: Shield, prompt: "I have bleeding or fluid leaking" },
    ]
  },
  {
    category: "Prepare care",
    prompts: [
      { label: "Build Safety Plan", icon: Shield, prompt: "Help me build my safety plan" },
      { label: "Provider Summary", icon: FileText, prompt: "Help me prepare a provider summary" },
      { label: "What to tell Dr.", icon: Stethoscope, prompt: "What should I tell my provider?" },
    ]
  },
  {
    category: "Learn",
    prompts: [
      { label: "Warning signs", icon: Shield, prompt: "What warning signs should I watch for?" },
      { label: "Movement meaning", icon: Activity, prompt: "What does reduced movement mean?" },
      { label: "Urgent care timing", icon: Heart, prompt: "When should I seek urgent care?" },
    ]
  }
];

const suggestedActions = [
  { label: "Call Provider", icon: Phone, action: "call" },
  { label: "Find emergency care", icon: AlertTriangle, action: "er" },
  { label: "Provider Summary", icon: FileText, action: "summary" },
  { label: "Read Article", icon: BookOpen, action: "learn" },
];

function generateResponse(input: string): { 
  content: string; 
  type: "text" | "action" | "warning" | "safety"; 
  actions?: { label: string; icon: React.ElementType; action: string }[];
  structuredWarning?: Message["structuredWarning"];
  safetyCard?: Message["safetyCard"];
} {
  const lower = input.toLowerCase();

  // Escalation for critical symptoms
  const criticalSymptoms = [
    { keywords: ["bleed", "hemorrhage", "leaking", "fluid", "gush"], label: "Bleeding or Leaking" },
    { keywords: ["headache", "migraine", "worst headache"], label: "Severe Headache" },
    { keywords: ["vision", "blur", "spots", "flashes", "vision changes"], label: "Vision Changes" },
    { keywords: ["swelling", "puffy", "swollen hands", "swollen face"], label: "Severe Swelling" },
    { keywords: ["fever", "100.4", "38", "temperature"], label: "Fever" },
    { keywords: ["movement", "kick", "baby not moving", "less movement", "reduced movement"], label: "Reduced Baby Movement" },
    { keywords: ["breath", "shortness of breath", "chest pain", "heart racing", "fast heartbeat", "racing heart", "trouble breathing"], label: "Chest or Breathing Issues" },
    { keywords: ["abdominal pain", "stomach pain", "intense cramp", "severe pain"], label: "Severe Abdominal Pain" },
    { keywords: ["nausea", "vomiting", "throw up", "cannot keep food down"], label: "Severe Nausea/Vomiting" },
    { keywords: ["dizzy", "faint", "passed out", "seizure", "fit", "twitching"], label: "Dizziness or Seizures" },
    { keywords: ["harm", "suicide", "hurt myself", "hurt baby", "self-harm"], label: "Mental Health Urgent Concerns" },
    { keywords: ["tired", "exhausted", "extreme tiredness", "fatigue"], label: "Extreme Fatigue" },
  ];

  const matchedCritical = criticalSymptoms.find(s => s.keywords.some(k => lower.includes(k)));

  if (matchedCritical) {
    let whyItMatters = "These symptoms during pregnancy or postpartum can indicate conditions that need immediate clinical attention to ensure the safety of you and your baby.";
    let nextStep = "Contact your healthcare provider immediately or go to the nearest emergency care center.";
    let whatToTell = `Tell them: "I am having ${matchedCritical.label} and I'm concerned."`;

    if (lower.includes("bleed") || lower.includes("leak")) {
      whyItMatters = "Vaginal bleeding or leaking fluid could indicate issues with the placenta or premature rupture of membranes.";
    } else if (lower.includes("headache") || lower.includes("vision") || lower.includes("swell")) {
      whyItMatters = "Severe headaches, vision changes, or facial swelling can be signs of preeclampsia (high blood pressure in pregnancy).";
    } else if (lower.includes("movement")) {
      whyItMatters = "A significant decrease in movement can be a sign that the baby is in distress.";
    } else if (lower.includes("breath") || lower.includes("chest") || lower.includes("heart")) {
      whyItMatters = "These can be signs of heart or lung issues that require immediate rule-out in an emergency setting.";
    } else if (lower.includes("harm")) {
      whyItMatters = "Your mental health is just as important as your physical health. Help is available and you are not alone.";
      nextStep = "Contact a crisis line, your provider, or go to emergency care immediately.";
      whatToTell = "Tell them honestly how you are feeling so they can support you.";
    } else if (lower.includes("fever")) {
      whyItMatters = "A high fever can indicate an infection that may affect you or the baby.";
    }

    return { 
      content: matchedCritical.label,
      type: "warning", 
      actions: [
        { label: "Call Provider", icon: Phone, action: "call" },
        { label: "Find emergency care", icon: AlertTriangle, action: "er" },
        { label: "Provider Summary", icon: FileText, action: "summary" },
        { label: "Start Check-in", icon: Activity, action: "checkin" },
      ],
      structuredWarning: {
        title: `Urgent Notice: ${matchedCritical.label}`,
        subtitle: "This may need urgent medical attention. Mama Guard cannot diagnose this.",
        sections: [
          { label: "What you shared", content: `You mentioned concerns related to ${matchedCritical.label.toLowerCase()}.` },
          { label: "Why it matters", content: whyItMatters },
          { label: "Suggested next step", content: nextStep },
          { label: "What to tell your provider", content: whatToTell },
          { label: "Safety note", content: "Always trust your maternal intuition. If something feels wrong, seek care regardless of symptoms." }
        ]
      }
    };
  }

  if (lower.includes("safety plan") || lower.includes("emergency plan") || lower.includes("hospital") || lower.includes("provider") || lower.includes("care contact")) {
    const onboarding = safeStorage.get<UserProfile | null>(STORAGE_KEYS.ONBOARDING, null);
    return {
      content: "Building your safety plan is a critical step for your care journey. Here is a summary of your current emergency details and guidance on what to watch for.",
      type: "safety",
      safetyCard: {
        provider: onboarding?.providerPhone || "Add your provider in Profile",
        hospital: onboarding?.nearestHospital || "Add nearest hospital in Profile",
        contact: onboarding?.emergencyContact || "Add emergency contact in Profile"
      },
      actions: [
        { label: "Open Safety Plan", icon: Shield, action: "safety" },
        { label: "Update Profile", icon: User, action: "profile" },
        { label: "Start Check-in", icon: Activity, action: "checkin" },
      ]
    };
  }

  if (lower.includes("normal") || lower.includes("symptom") || lower.includes("feel") || lower.includes("pain")) {
    const isNormal = lower.includes("normal");
    return { 
      content: isNormal 
        ? `It's natural to wonder what's normal. Many changes are typical, but some require professional review.\n\nCommon normal symptoms:\n• Mild stretching sensations\n• Increased fatigue\n• Breast tenderness\n• Mild morning sickness\n\nHowever, contact your provider if:\n• Symptoms are severe or worsening\n• You have bleeding or fluid leakage\n• You have concerns about baby's movement\n• You experience severe headache or vision changes\n\nAlways consult your healthcare provider for medical advice.`
        : `Thank you for sharing how you're feeling. I can provide supportive guidance, but it's important to track these symptoms formally to share with your provider.\n\nWould you like to log this in a structured check-in?`, 
      type: "text",
      actions: [
        { label: "Log in Check-in", icon: Activity, action: "checkin" },
        { label: "Provider Summary", icon: FileText, action: "summary" },
        { label: "Read Article", icon: BookOpen, action: "learn" },
      ]
    };
  }
  
  if (lower.includes("baby") && lower.includes("week")) return { content: `At this stage, your baby is reaching many milestones! \n\nHighlights:\n• Major organs are maturing\n• Hearing development is progressing\n• Movement is becoming more rhythmic\n\nHealth Reminders:\n• Continue prenatal vitamins\n• Maintain high hydration\n• Monitor daily kick counts if in the third trimester\n\nPlease share any concerns about your baby's growth with your provider.`, type: "text" };

  return { 
    content: `Thank you for sharing. I'm here to provide supportive prototype guidance.\n\nImportant:\n• I am a prototype, not a medical professional.\n• For any concerns or urgent symptoms, contact your provider immediately.\n• This guidance is for educational purposes only.\n\nHow else can I support you today?`, 
    type: "text" 
  };
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{ 
    id: "welcome", 
    role: "assistant", 
    content: "I’m here to provide supportive pregnancy guidance. I can help you understand warning signs, organize symptoms, and prepare questions for your healthcare provider.", 
    type: "text" 
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleProviderSummary = (isSilent = false) => {
    const onboarding = safeStorage.get<UserProfile | null>(STORAGE_KEYS.ONBOARDING, null);
    const checkins = safeStorage.get<any[]>(STORAGE_KEYS.CHECKINS, []);
    const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;
    const week = onboarding?.dueDate ? getGestationalWeek(onboarding.dueDate) : 0;
    const trimester = week > 0 ? getTrimester(week) : "N/A";
    
    const summary = `
MAMA GUARD PROVIDER SUMMARY
Generated: ${new Date().toLocaleString()}
----------------------------------

USER INFORMATION
Name: ${onboarding?.name || "User"}
Status: ${onboarding?.status === "pregnant" ? "Pregnant" : onboarding?.status === "postpartum" ? "Postpartum" : "Not set"}
Stage: ${week > 0 ? `Week ${week} (${trimester})` : "N/A"}
${onboarding?.dueDate ? "Estimated Due Date: " + new Date(onboarding.dueDate).toLocaleDateString() : ""}

CURRENT CONCERN
"${messages[messages.length - 1]?.role === "user" ? messages[messages.length - 1].content : "Care tracking and summary preparation."}"

LATEST CHECK-IN DATA
Date: ${latestCheckin ? new Date(latestCheckin.date).toLocaleDateString() : "No recent check-ins"}
Risk Level: ${latestCheckin ? latestCheckin.risk.toUpperCase() : "N/A"}
Symptoms: ${latestCheckin ? latestCheckin.symptoms.join(", ") : "None reported"}
${latestCheckin?.followUpAnswers ? "Details:\n" + Object.entries(latestCheckin.followUpAnswers).map(([k, v]) => `• ${k}: ${v}`).join("\n") : ""}

CARE TEAM & FACILITY
Provider Phone: ${onboarding?.providerPhone || "Not provided"}
Nearest Hospital: ${onboarding?.nearestHospital || "Not provided"}

SAFETY NOTE
This summary was prepared by Mama Guard to help organize information. It is supportive guidance only and not a medical diagnosis. Mama Guard does not replace medical care.
----------------------------------
    `.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          if (!isSilent) alert("Provider summary copied to clipboard! You can paste it into a message or show it to your healthcare provider.");
        })
        .catch(() => {
          if (!isSilent) alert("Clipboard access denied. You can see the summary below.");
        });
    }

    return summary;
  };

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    if (content.toLowerCase().includes("summary") || content.toLowerCase().includes("report")) {
      const userMsg: Message = { id: Date.now().toString(), role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setTimeout(() => {
        const summary = handleProviderSummary(true);
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: "I've prepared a professional summary of your current symptoms and care details. I've attempted to copy it to your clipboard for you.", 
          type: "summary",
          summaryData: summary,
          actions: [
            { label: "Copy Summary", icon: FileText, action: "summary" },
            { label: "Call Provider", icon: Phone, action: "call" }
          ]
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 800);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setTimeout(() => {
      const response = generateResponse(content);
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: response.content, 
        type: response.type, 
        actions: response.actions,
        structuredWarning: response.structuredWarning
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-cream)] flex flex-col">
      <header className="shrink-0 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--warm-200)]/50 px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[var(--warm-100)] flex items-center justify-center active:scale-95"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center"><Sparkles size={18} className="text-white" /></div>
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-sm leading-tight">Supportive pregnancy guidance</div>
              <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-500)] inline-block" />Supportive guidance only · Not a diagnosis</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 hide-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white rounded-2xl rounded-tr-sm px-4 py-3" : msg.type === "warning" ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3" : "bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"}`}>
                {msg.role === "assistant" && <div className="flex items-center gap-1.5 mb-2"><Sparkles size={12} className={msg.type === "warning" ? "text-amber-500" : "text-[var(--rose-500)]"} /><span className={`text-[10px] font-semibold uppercase tracking-wider ${msg.type === "warning" ? "text-amber-600" : "text-[var(--rose-600)]"}`}>{msg.type === "warning" ? "Urgent Information" : "Assistant Guidance"}</span></div>}
                
                {msg.type === "summary" && msg.summaryData ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {msg.content}
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 border border-[var(--warm-200)] shadow-inner">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--warm-100)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Summary Preview</span>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      </div>
                      <pre className="text-[10px] text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-tight max-h-40 overflow-y-auto">
                        {msg.summaryData}
                      </pre>
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] italic">
                      Tip: You can show this screen directly to your provider or paste the copied text into a message.
                    </p>
                  </div>
                ) : msg.type === "safety" && msg.safetyCard ? (
                  <div className="space-y-4">
                    <div className="bg-white/50 rounded-2xl p-4 border border-[var(--rose-100)] space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={16} className="text-[var(--rose-500)]" />
                        <span className="text-xs font-bold text-[var(--rose-700)] uppercase tracking-wider">Your Safety Plan</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <Phone size={14} className="text-[var(--text-tertiary)] mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Care Team / Provider</p>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{msg.safetyCard.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Activity size={14} className="text-[var(--text-tertiary)] mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Nearest Hospital</p>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{msg.safetyCard.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Heart size={14} className="text-[var(--text-tertiary)] mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Emergency Contact</p>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{msg.safetyCard.contact}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--rose-100)]">
                        <p className="text-[10px] font-bold text-[var(--rose-800)] mb-1">Warning signs to act on:</p>
                        <p className="text-[10px] text-[var(--rose-700)] leading-tight">Severe headache, vision changes, bleeding, fluid leaking, or decreased movement.</p>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-[var(--text-primary)] mb-1">What to say to provider:</p>
                        <p className="text-[10px] text-[var(--text-secondary)] italic leading-tight">"I am calling from Mama Guard with a potential warning sign. I am experiencing [symptom] and need evaluation."</p>
                      </div>

                      <div className="pt-2 bg-rose-50/50 rounded-lg p-2 border border-rose-100/50">
                        <p className="text-[9px] text-rose-800 leading-tight font-medium">
                          <strong>Safety Note:</strong> Mama Guard does not contact emergency services. If you feel unsafe or symptoms are severe, contact your healthcare provider or local emergency care immediately. Emergency numbers vary by location.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : msg.type === "warning" && msg.structuredWarning ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-amber-900 leading-tight mb-1">{msg.structuredWarning.title}</div>
                      <p className="text-xs text-amber-800/80 font-medium">{msg.structuredWarning.subtitle}</p>
                    </div>
                    <div className="space-y-3">
                      {msg.structuredWarning.sections.map((section, idx) => (
                        <div key={idx} className="bg-white/40 rounded-xl p-3 border border-amber-200/50">
                          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">{section.label}</div>
                          <p className="text-sm text-amber-900 leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : "text-[var(--text-secondary)]"}`}>
                    {msg.content}
                  </div>
                )}

                {msg.role === "assistant" && msg.id === "welcome" && <MedicalDisclaimer className="mt-4 mb-0" />}
                {msg.actions && (
                  <div className="mt-4 pt-4 border-t border-[var(--warm-200)]">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {msg.actions.map((action) => { 
                        const ActionIcon = action.icon; 
                        return (
                          <button 
                            key={action.action} 
                            onClick={() => { 
                              if (action.action === "checkin") router.push("/checkin?from=assistant"); 
                              if (action.action === "learn") router.push("/learn"); 
                              if (action.action === "summary") handleProviderSummary();
                              if (action.action === "safety") router.push("/safety");
                              if (action.action === "profile") router.push("/profile");
                              if (action.action === "er") alert("Emergency Notice: Please contact your local emergency services or go to the nearest emergency care center immediately. Mama Guard does not dispatch emergency services.");
                              if (action.action === "call") { 
                                const onboarding = safeStorage.get(STORAGE_KEYS.ONBOARDING, { providerPhone: "" }); 
                                if (onboarding.providerPhone) { window.location.href = `tel:${onboarding.providerPhone}`; } 
                                else { alert("Please add your provider's phone number in your profile first."); } 
                              } 
                            }} 
                            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
                              action.action === "er" || action.action === "checkin" && msg.type === "warning"
                                ? "bg-rose-600 text-white border-rose-700 shadow-sm" 
                                : action.action === "checkin" || action.action === "safety"
                                  ? "bg-[var(--rose-50)] text-[var(--rose-700)] border-[var(--rose-200)]"
                                  : "bg-white border-[var(--warm-200)] text-[var(--text-primary)] hover:bg-[var(--warm-50)]"
                            }`}
                          >
                            <ActionIcon size={14} className={action.action === "er" || action.action === "checkin" && msg.type === "warning" ? "text-white" : "text-[var(--rose-500)]"} />
                            {action.label}
                          </button>
                        ); 
                      })}
                    </div>
                    {msg.actions.some(a => a.action === "checkin" || a.action === "safety") && (
                      <p className="text-[10px] text-[var(--text-tertiary)] italic leading-tight">
                        {msg.type === "safety" 
                          ? "This plan helps you stay prepared, but does not replace medical professional advice."
                          : "Check-in helps organize your symptoms, but it does not diagnose or replace medical care."
                        }
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"><div className="flex items-center gap-2"><Loader2 size={16} className="text-[var(--rose-500)] animate-spin" /><span className="text-sm text-[var(--text-tertiary)]">Thinking...</span></div></div></motion.div>}
        <div ref={scrollRef} />
        {messages.length <= 1 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2 space-y-5">
            {quickPromptGroups.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">{group.category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.prompts.map((prompt) => {
                    const Icon = prompt.icon;
                    const isUrgent = group.category === "Urgent symptoms";
                    return (
                      <button 
                        key={prompt.label} 
                        onClick={() => handleSend(prompt.prompt)} 
                        className={`flex items-center gap-2 p-3 rounded-2xl border shadow-sm text-left active:scale-[0.98] transition-all ${
                          isUrgent 
                            ? "bg-rose-50/50 border-rose-100 hover:bg-rose-50" 
                            : "bg-[var(--surface-primary)] border-[var(--warm-200)] hover:bg-[var(--warm-50)]"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? "bg-rose-100" : "bg-[var(--warm-100)]"}`}>
                          <Icon size={14} className={isUrgent ? "text-rose-600" : "text-[var(--rose-500)]"} />
                        </div>
                        <span className={`text-[11px] font-semibold ${isUrgent ? "text-rose-900" : "text-[var(--text-secondary)]"} leading-tight`}>{prompt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="shrink-0 bg-[var(--surface-glass)] backdrop-blur-xl border-t border-[var(--warm-200)]/50 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <div className="flex-1 bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl px-4 py-3 shadow-sm">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask about symptoms, nutrition, baby development..." rows={1} className="w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-none outline-none" style={{ minHeight: "20px" }} />
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? "bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-md" : "bg-[var(--warm-200)] text-[var(--text-muted)]"}`}><Send size={18} /></button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 font-medium">Supportive guidance only · Not a diagnosis</p>
      </div>
    </div>
  );
}
