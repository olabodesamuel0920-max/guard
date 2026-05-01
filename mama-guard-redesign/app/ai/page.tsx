"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Loader2, Heart, Baby, Activity, Shield, AlertTriangle, CheckCircle2, Stethoscope, BookOpen, Phone, X, FileText } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface Message { id: string; role: "user" | "assistant"; content: string; type?: "text" | "action" | "warning"; actions?: { label: string; icon: React.ElementType; action: string }[]; }

interface UserProfile {
  name: string;
  status: "pregnant" | "postpartum";
  dueDate: string;
  providerPhone?: string;
  nearestHospital?: string;
}

const quickPrompts = [
  { label: "Severe headache", icon: AlertTriangle, prompt: "I have a severe headache" },
  { label: "Baby moving less", icon: Baby, prompt: "My baby is moving less" },
  { label: "Feeling dizzy", icon: Activity, prompt: "I feel dizzy" },
  { label: "Provider summary", icon: FileText, prompt: "Help me prepare a provider summary" },
  { label: "Warning signs", icon: Shield, prompt: "What warning signs should I watch for?" },
];

const suggestedActions = [
  { label: "Call Provider", icon: Phone, action: "call" },
  { label: "Find ER", icon: AlertTriangle, action: "er" },
  { label: "Provider Summary", icon: FileText, action: "summary" },
  { label: "Read Article", icon: BookOpen, action: "learn" },
];

function generateResponse(input: string): { content: string; type: "text" | "action" | "warning"; actions?: typeof suggestedActions } {
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
    let nextStep = "Contact your healthcare provider immediately or go to the nearest emergency center.";
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
      nextStep = "Contact a crisis line, your provider, or go to the ER immediately.";
      whatToTell = "Tell them honestly how you are feeling so they can support you.";
    } else if (lower.includes("fever")) {
      whyItMatters = "A high fever can indicate an infection that may affect you or the baby.";
    }

    return { 
      content: `### Urgent Notice: ${matchedCritical.label}
This may need urgent medical attention. Mama Guard cannot diagnose this.

**What you shared:**
You mentioned concerns related to ${matchedCritical.label.toLowerCase()}.

**Why it matters:**
${whyItMatters}

**Suggested next step:**
${nextStep}

**What to tell your provider:**
${whatToTell}

**Safety note:**
Always trust your maternal intuition. If something feels wrong, seek care regardless of symptoms.`, 
      type: "warning", 
      actions: suggestedActions 
    };
  }

  if (lower.includes("normal")) return { content: `It's natural to wonder what's normal. Many changes are typical, but some require professional review.\n\n**Common normal symptoms:**\n• Mild stretching sensations\n• Increased fatigue\n• Breast tenderness\n• Mild morning sickness\n\n**However, contact your provider if:**\n• Symptoms are severe or worsening\n• You have bleeding or fluid leakage\n• You have concerns about baby's movement\n• You experience severe headache or vision changes\n\nAlways consult your healthcare provider for medical advice.`, type: "text" };
  
  if (lower.includes("baby") && lower.includes("week")) return { content: `At this stage, your baby is reaching many milestones! \n\n**Highlights:**\n• Major organs are maturing\n• Hearing development is progressing\n• Movement is becoming more rhythmic\n\n**Health Reminders:**\n• Continue prenatal vitamins\n• Maintain high hydration\n• Monitor daily kick counts if in the third trimester\n\nPlease share any concerns about your baby's growth with your provider.`, type: "text" };

  return { 
    content: `Thank you for sharing. I'm here to provide supportive prototype guidance.\n\n**Important:**\n• I am a prototype, not a medical professional.\n• For any concerns or urgent symptoms, contact your provider immediately.\n• This guidance is for educational purposes only.\n\nHow else can I support you today?`, 
    type: "text" 
  };
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", content: "Hello! I'm your Mama Guard Assistant. I'm a prototype here to provide supportive guidance during your pregnancy journey. How can I help you today?", type: "text" }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleProviderSummary = () => {
    const onboarding = safeStorage.get<UserProfile | null>(STORAGE_KEYS.ONBOARDING, null);
    const checkins = safeStorage.get<any[]>(STORAGE_KEYS.CHECKINS, []);
    const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;
    
    const summary = `
Mama Guard - Provider Care Summary
----------------------------------
Generated: ${new Date().toLocaleString()}

Patient: ${onboarding?.name || "User"}
Status: ${onboarding?.status === "pregnant" ? "Pregnant" : onboarding?.status === "postpartum" ? "Postpartum" : "Not set"}
Details: ${onboarding?.dueDate ? "Due: " + onboarding.dueDate : "N/A"}

Latest Check-in:
- Date: ${latestCheckin ? new Date(latestCheckin.date).toLocaleDateString() : "None"}
- Risk: ${latestCheckin ? latestCheckin.risk.toUpperCase() : "N/A"}
- Symptoms: ${latestCheckin ? latestCheckin.symptoms.join(", ") : "None"}

Current Concerns logged in Assistant:
"${input || messages[messages.length-1]?.content || "Current session query"}"

Disclaimer:
This is supportive guidance from Mama Guard, not a medical diagnosis.
----------------------------------
    `.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary)
        .then(() => alert("Provider summary copied to clipboard! You can now paste it into a message or email to your provider."))
        .catch(() => alert("Could not copy automatically. You can find your history in the Profile page to share."));
    } else {
      alert("Summary prepared (Clipboard not available):\n\n" + summary);
    }
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
        handleProviderSummary();
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: "I've prepared a care summary based on your profile and latest check-ins. It has been copied to your clipboard. You can share this with your healthcare provider.", 
          type: "text",
          actions: [
            { label: "Copy Again", icon: FileText, action: "summary" },
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
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response.content, type: response.type, actions: response.actions };
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
              <div className="font-semibold text-[var(--text-primary)] text-sm leading-tight">Mama Guard Assistant</div>
              <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-500)] inline-block" />Supportive guidance · Not a diagnosis</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 hide-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white rounded-2xl rounded-tr-sm px-4 py-3" : msg.type === "warning" ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3" : "bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"}`}>
                {msg.role === "assistant" && <div className="flex items-center gap-1.5 mb-2"><Sparkles size={12} className={msg.type === "warning" ? "text-amber-500" : "text-[var(--rose-500)]"} /><span className={`text-[10px] font-semibold uppercase tracking-wider ${msg.type === "warning" ? "text-amber-600" : "text-[var(--rose-600)]"}`}>{msg.type === "warning" ? "Important" : "Assistant"}</span></div>}
                <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : msg.type === "warning" ? "text-amber-900" : "text-[var(--text-secondary)]"}`}>{msg.content}</div>
                {msg.role === "assistant" && msg.id === "welcome" && <MedicalDisclaimer className="mt-4 mb-0" />}
                {msg.actions && <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[var(--warm-200)]">{msg.actions.map((action) => { const ActionIcon = action.icon; return <button key={action.action} onClick={() => { 
                  if (action.action === "checkin") router.push("/checkin"); 
                  if (action.action === "learn") router.push("/learn"); 
                  if (action.action === "summary") handleProviderSummary();
                  if (action.action === "er") alert("Emergency Notice: Please contact your local emergency services (e.g. 911) or go to the nearest hospital immediately. Mama Guard does not dispatch emergency services.");
                  if (action.action === "call") { const onboarding = safeStorage.get(STORAGE_KEYS.ONBOARDING, { providerPhone: "" }); if (onboarding.providerPhone) { window.location.href = `tel:${onboarding.providerPhone}`; } else { alert("Please add your provider's phone number in your profile first."); } } 
                }} className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${action.action === "er" ? "bg-rose-600 text-white border-rose-700" : "bg-white border-[var(--warm-200)] text-[var(--text-primary)] hover:bg-[var(--warm-50)]"}`}><ActionIcon size={14} className={action.action === "er" ? "text-white" : "text-[var(--rose-500)]"} />{action.label}</button>; })}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"><div className="flex items-center gap-2"><Loader2 size={16} className="text-[var(--rose-500)] animate-spin" /><span className="text-sm text-[var(--text-tertiary)]">Thinking...</span></div></div></motion.div>}
        <div ref={scrollRef} />
        {messages.length <= 1 && !isLoading && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2"><p className="text-xs text-[var(--text-muted)] mb-2 px-1">Quick questions</p><div className="grid grid-cols-2 gap-2">{quickPrompts.map((prompt) => { const Icon = prompt.icon; return <button key={prompt.label} onClick={() => handleSend(prompt.prompt)} className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--warm-200)] shadow-sm text-left hover:bg-[var(--warm-50)] active:scale-[0.98] transition-all"><Icon size={16} className="text-[var(--rose-500)] flex-shrink-0" /><span className="text-xs font-medium text-[var(--text-secondary)]">{prompt.label}</span></button>; })}</div></motion.div>}
      </div>

      <div className="shrink-0 bg-[var(--surface-glass)] backdrop-blur-xl border-t border-[var(--warm-200)]/50 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <div className="flex-1 bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl px-4 py-3 shadow-sm">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask about symptoms, nutrition, baby development..." rows={1} className="w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent resize-none outline-none" style={{ minHeight: "20px" }} />
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? "bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white shadow-md" : "bg-[var(--warm-200)] text-[var(--text-muted)]"}`}><Send size={18} /></button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 font-medium">Mama Guard Assistant — Prototype Guidance Only</p>
      </div>
    </div>
  );
}
