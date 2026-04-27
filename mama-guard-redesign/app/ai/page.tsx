"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Loader2, Heart, Baby, Activity, Shield, AlertTriangle, CheckCircle2, Stethoscope, BookOpen, Phone, X } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface Message { id: string; role: "user" | "assistant"; content: string; type?: "text" | "action" | "warning"; actions?: { label: string; icon: React.ElementType; action: string }[]; }

const quickPrompts = [
  { label: "Is this normal?", icon: Heart, prompt: "I have mild cramping at 20 weeks. Is this normal?" },
  { label: "Check symptoms", icon: Activity, prompt: "Help me check my symptoms" },
  { label: "Baby development", icon: Baby, prompt: "What's happening with my baby this week?" },
  { label: "Safety advice", icon: Shield, prompt: "What should I watch out for in my third trimester?" },
];

const suggestedActions = [
  { label: "Call Provider", icon: Phone, action: "call" },
  { label: "Find ER", icon: AlertTriangle, action: "er" },
  { label: "Read Article", icon: BookOpen, action: "learn" },
  { label: "Log Symptom", icon: Stethoscope, action: "checkin" },
];

function generateResponse(input: string): { content: string; type: "text" | "action" | "warning"; actions?: typeof suggestedActions } {
  const lower = input.toLowerCase();

  // Escalation for critical symptoms
  const criticalSymptoms = [
    { keywords: ["bleed", "hemorrhage"], label: "Vaginal Bleeding" },
    { keywords: ["headache", "migraine"], label: "Severe Headache" },
    { keywords: ["vision", "blur", "spots", "flashes"], label: "Vision Changes" },
    { keywords: ["movement", "kick", "baby not moving"], label: "Decreased Movement" },
    { keywords: ["breath", "shortness of breath", "chest pain"], label: "Breathing Difficulty" },
    { keywords: ["fever", "temperature", "chills"], label: "Fever" },
    { keywords: ["abdominal pain", "stomach pain", "cramp"], label: "Severe Pain" },
  ];

  const matchedCritical = criticalSymptoms.find(s => s.keywords.some(k => lower.includes(k)));

  if (matchedCritical) {
    let specificAdvice = "";
    if (lower.includes("bleed")) {
      specificAdvice = "Seek immediate care if bleeding is heavy (soaking a pad in an hour), accompanied by pain, or if you feel faint.";
    } else if (lower.includes("headache") || lower.includes("vision")) {
      specificAdvice = "Severe headaches and vision changes can be signs of preeclampsia. Please contact your provider or seek urgent care immediately.";
    } else if (lower.includes("movement")) {
      specificAdvice = "If you notice a significant decrease in your baby's normal movement patterns, contact your healthcare provider right away for evaluation.";
    } else if (lower.includes("breath")) {
      specificAdvice = "Shortness of breath at rest or chest pain requires immediate medical evaluation.";
    }

    return { 
      content: `**Urgent Warning:** You mentioned symptoms related to ${matchedCritical.label}. 

${specificAdvice || "Symptoms like this during pregnancy require prompt medical evaluation to ensure the safety of you and your baby."}

**Please contact your healthcare provider immediately or go to the nearest emergency center.**`, 
      type: "warning", 
      actions: suggestedActions 
    };
  }

  if (lower.includes("normal")) return { content: `It's natural to wonder what's normal during pregnancy. Many changes are typical as your body adjusts.\n\n**Common normal symptoms:**\n• Mild stretching sensations\n• Increased fatigue\n• Breast tenderness\n• Mild morning sickness\n\n**However, always contact your provider if:**\n• Symptoms are severe or worsening\n• You have bleeding or fluid leakage\n• You experience severe headache or vision changes\n• You have concerns about fetal movement`, type: "text" };
  
  if (lower.includes("baby") && lower.includes("week")) return { content: `At this stage, your baby is reaching many exciting milestones! \n\n**Highlights:**\n• Major organs are maturing\n• Hearing development is progressing\n• Movement is becoming more rhythmic\n\n**For your health:**\n• Continue your prenatal vitamin routine\n• Maintain high hydration levels\n• Practice gentle movement like walking\n• Start tracking daily kick counts if you're in the third trimester`, type: "text" };

  return { 
    content: `Thank you for sharing. I'm here to provide prototype guidance and support.\n\n**Important Reminders:**\n• I am a prototype assistant, not a medical professional.\n• For any urgent symptoms, contact your doctor or local emergency services immediately.\n• This guidance is for educational/prototype purposes only.\n\nHow else can I support your journey today?`, 
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

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;
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
              <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-500)] inline-block" />Smart guidance assistant</div>
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
                {msg.actions && <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--warm-200)]">{msg.actions.map((action) => { const ActionIcon = action.icon; return <button key={action.action} onClick={() => { 
                  if (action.action === "checkin") router.push("/checkin"); 
                  if (action.action === "learn") router.push("/learn"); 
                  if (action.action === "er") alert("Prototype Notice: In a real version, this would show nearby emergency centers. For now, please contact your local emergency service or nearest hospital.");
                  if (action.action === "call") { const onboarding = safeStorage.get(STORAGE_KEYS.ONBOARDING, { providerPhone: "" }); if (onboarding.providerPhone) { window.location.href = `tel:${onboarding.providerPhone}`; } else { alert("Please add your provider's phone number in your profile first."); } } 
                }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[var(--warm-200)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--warm-50)] transition-colors"><ActionIcon size={14} className="text-[var(--rose-500)]" />{action.label}</button>; })}</div>}
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
