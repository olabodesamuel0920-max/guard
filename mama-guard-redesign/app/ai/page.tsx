"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Loader2, Heart, Baby, Activity, Shield, AlertTriangle, CheckCircle2, Stethoscope, BookOpen, Phone } from "lucide-react";

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
  if (lower.includes("cramp") || lower.includes("pain")) return { content: `Mild cramping can be normal as your uterus stretches, especially in the second trimester. However, severe or persistent cramping, especially with bleeding, requires immediate medical attention.\n\n**Watch for these warning signs:**\n• Severe pain that doesn't subside\n• Pain with bleeding or fluid loss\n• Regular, rhythmic contractions before 37 weeks\n• Pain with fever or chills`, type: "warning", actions: suggestedActions };
  if (lower.includes("normal")) return { content: `It's completely natural to wonder what's normal during pregnancy. Many symptoms that feel concerning are actually typical as your body changes.\n\n**Common normal symptoms include:**\n• Mild cramping and stretching sensations\n• Increased fatigue\n• Breast tenderness and changes\n• Mild nausea (especially in first trimester)\n• Increased vaginal discharge\n\n**However, always contact your provider if:**\n• Symptoms are severe or worsening\n• You have bleeding or fluid leakage\n• You experience severe headache or vision changes\n• You have concerns about fetal movement`, type: "text" };
  if (lower.includes("bleed")) return { content: `**Any vaginal bleeding during pregnancy should be reported to your healthcare provider.**\n\nWhile light spotting can sometimes occur (especially after intercourse or a cervical exam), it's important to get evaluated to rule out any complications.\n\n**Seek immediate care if:**\n• Bleeding is heavy (soaking a pad in an hour)\n• Bleeding is accompanied by pain or cramping\n• You pass tissue or clots\n• You feel dizzy or faint`, type: "warning", actions: suggestedActions };
  if (lower.includes("baby") && lower.includes("week")) return { content: `At this stage of your pregnancy, your baby is growing rapidly! Here's what's typically happening:\n\n**Development highlights:**\n• Major organs are fully formed and continuing to mature\n• Your baby can hear sounds from outside the womb\n• Movements become more coordinated and frequent\n• Fat deposits are developing under the skin\n\n**For your health:**\n• Continue taking prenatal vitamins\n• Stay hydrated with at least 8 glasses of water\n• Aim for 30 minutes of light exercise daily\n• Monitor fetal movements daily after 28 weeks`, type: "text" };
  if (lower.includes("headache")) return { content: `Headaches are common during pregnancy, especially in the first and third trimesters due to hormonal changes.\n\n**Safe relief methods:**\n• Rest in a dark, quiet room\n• Apply a cold or warm compress\n• Stay hydrated\n• Practice relaxation techniques\n• Use acetaminophen if needed (consult your provider first)\n\n**⚠️ Seek immediate care if your headache is:**\n• Severe or "worst ever"\n• Accompanied by vision changes, swelling, or upper abdominal pain\n• These could be signs of preeclampsia`, type: "warning", actions: suggestedActions };
  return { content: `Thank you for sharing that with me. I'm here to support you throughout your pregnancy journey.\n\n**A few important reminders:**\n• I'm an AI assistant, not a replacement for your healthcare provider\n• For any urgent or emergency symptoms, please contact your provider or call emergency services\n• Regular prenatal visits are essential for monitoring your and your baby's health\n\nWould you like me to help you with symptom checking, finding educational resources, or connecting you with your care team?`, type: "text" };
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", content: "Hello! I'm your MamaGuard AI assistant. I'm here to provide supportive guidance during your pregnancy journey. How can I help you today?", type: "text" }]);
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
              <div className="font-semibold text-[var(--text-primary)] text-sm leading-tight">MamaGuard AI</div>
              <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-500)] inline-block" />Supportive guidance</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 hide-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] text-white rounded-2xl rounded-tr-sm px-4 py-3" : msg.type === "warning" ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3" : "bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"}`}>
                {msg.role === "assistant" && <div className="flex items-center gap-1.5 mb-2"><Sparkles size={12} className={msg.type === "warning" ? "text-amber-500" : "text-[var(--rose-500)]"} /><span className={`text-[10px] font-semibold uppercase tracking-wider ${msg.type === "warning" ? "text-amber-600" : "text-[var(--rose-600)]"}`}>{msg.type === "warning" ? "Important" : "AI Assistant"}</span></div>}
                <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : msg.type === "warning" ? "text-amber-900" : "text-[var(--text-secondary)]"}`}>{msg.content}</div>
                {msg.actions && <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--warm-200)]">{msg.actions.map((action) => { const ActionIcon = action.icon; return <button key={action.action} onClick={() => { if (action.action === "checkin") router.push("/checkin"); if (action.action === "learn") router.push("/learn"); if (action.action === "call") window.location.href = "tel:+1"; }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[var(--warm-200)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--warm-50)] transition-colors"><ActionIcon size={14} className="text-[var(--rose-500)]" />{action.label}</button>; })}</div>}
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
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">AI guidance is not a substitute for professional medical advice</p>
      </div>
    </div>
  );
}
