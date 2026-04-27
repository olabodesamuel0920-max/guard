"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, AlertTriangle, Clock, Phone, MessageSquare, Calendar, CheckCircle2, ChevronRight, Search, Filter, ShieldAlert, Stethoscope, MapPin, FileText } from "lucide-react";

interface Patient {
  id: string; name: string; week: number; risk: "low" | "medium" | "high";
  lastCheckIn: string; symptoms: string[]; phone: string; location: string;
  dueDate: string; age: number; gravida: number; parity: number; notes: string; status: "active" | "follow-up" | "resolved";
}

const mockPatients: Patient[] = [
  { id: "1", name: "Maria Garcia", week: 32, risk: "high", lastCheckIn: "2026-04-25T08:30:00Z", symptoms: ["Decreased fetal movement", "Severe headache"], phone: "+1 (555) 123-4567", location: "District 3", dueDate: "2026-06-15", age: 28, gravida: 2, parity: 1, notes: "Previous c-section. BP elevated at last visit.", status: "follow-up" },
  { id: "2", name: "Amina Johnson", week: 24, risk: "medium", lastCheckIn: "2026-04-24T14:20:00Z", symptoms: ["Swelling", "Mild cramps"], phone: "+1 (555) 234-5678", location: "District 1", dueDate: "2026-08-10", age: 22, gravida: 1, parity: 0, notes: "First pregnancy. Needs nutrition counseling.", status: "active" },
  { id: "3", name: "Chen Wei", week: 18, risk: "low", lastCheckIn: "2026-04-25T06:15:00Z", symptoms: [], phone: "+1 (555) 345-6789", location: "District 2", dueDate: "2026-09-22", age: 34, gravida: 2, parity: 1, notes: "Doing well. Regular check-ups.", status: "active" },
  { id: "4", name: "Fatima Al-Rashid", week: 36, risk: "high", lastCheckIn: "2026-04-25T09:45:00Z", symptoms: ["Vaginal bleeding", "Abdominal cramps", "Fever"], phone: "+1 (555) 456-7890", location: "District 3", dueDate: "2026-05-20", age: 31, gravida: 3, parity: 2, notes: "URGENT: Multiple high-risk symptoms. En route to hospital.", status: "follow-up" },
];

export default function WorkerPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterRisk, setFilterRisk] = useState<"all" | "low" | "medium" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = {
    total: mockPatients.length,
    highRisk: mockPatients.filter((p) => p.risk === "high").length,
    mediumRisk: mockPatients.filter((p) => p.risk === "medium").length,
    followUp: mockPatients.filter((p) => p.status === "follow-up").length,
    todayCheckins: mockPatients.filter((p) => new Date(p.lastCheckIn).toDateString() === new Date().toDateString()).length,
  };

  const filteredPatients = mockPatients.filter((p) => {
    const matchesRisk = filterRisk === "all" || p.risk === filterRisk;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const getRelativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <header className="sticky top-0 z-40 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--warm-200)]/50 px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[var(--warm-100)] flex items-center justify-center active:scale-95"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
          <div className="flex-1">
            <h1 className="font-bold text-[var(--text-primary)] text-base">Demo Worker Portal</h1>
            <p className="text-[11px] text-[var(--text-tertiary)]">Mock patient data for prototype preview only</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--sage-100)] flex items-center justify-center"><Stethoscope size={18} className="text-[var(--sage-600)]" /></div>
        </div>
      </header>

      <main className="px-5 py-4 pb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-center gap-3">
          <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Security Notice:</strong> In a production environment, this portal would require professional authentication and role-based access control. All data shown here is for demonstration only.
          </p>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl bg-[var(--surface-primary)] p-4 shadow-sm border border-[var(--warm-200)]/60">
            <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-[var(--text-tertiary)]" /><span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Caseload</span></div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{stats.todayCheckins} checked in today</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 p-4 shadow-sm border border-rose-200/60">
            <div className="flex items-center gap-2 mb-2"><ShieldAlert size={16} className="text-rose-500" /><span className="text-[11px] font-semibold text-rose-600 uppercase">High Risk</span></div>
            <div className="text-2xl font-bold text-rose-700">{stats.highRisk}</div>
            <div className="text-[11px] text-rose-500">{stats.followUp} need follow-up</div>
          </div>
        </motion.div>

        {stats.highRisk > 0 && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 p-4 mb-5 shadow-lg shadow-rose-500/20 text-white"><div className="flex items-center gap-3"><AlertTriangle size={22} className="flex-shrink-0" /><div><div className="font-semibold text-sm">{stats.highRisk} urgent patient{stats.highRisk > 1 ? "s" : ""} need{stats.highRisk === 1 ? "s" : ""} attention</div><div className="text-white/80 text-xs">Review high-risk cases immediately</div></div></div></motion.div>}

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search patients..." className="w-full bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[var(--rose-400)] focus:outline-none shadow-sm" /></div>
          <button className="w-10 h-10 rounded-xl bg-[var(--surface-primary)] border border-[var(--warm-200)] flex items-center justify-center shadow-sm"><Filter size={16} className="text-[var(--text-tertiary)]" /></button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 -mx-1 px-1">
          {(["all", "high", "medium", "low"] as const).map((risk) => (
            <button key={risk} onClick={() => setFilterRisk(risk)} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterRisk === risk ? risk === "high" ? "bg-rose-500 text-white" : risk === "medium" ? "bg-amber-500 text-white" : risk === "low" ? "bg-emerald-500 text-white" : "bg-[var(--text-primary)] text-white" : "bg-[var(--surface-primary)] text-[var(--text-secondary)] border border-[var(--warm-200)]"}`}>
              {risk === "all" ? "All" : `${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk`}
              {risk !== "all" && <span className="ml-1 opacity-70">({mockPatients.filter((p) => p.risk === risk).length})</span>}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredPatients.map((patient, index) => (
            <motion.div key={patient.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedPatient(patient)} className="bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border border-[var(--warm-200)]/60 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${patient.risk === "high" ? "bg-gradient-to-br from-rose-400 to-rose-600" : patient.risk === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>{patient.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] text-[15px]">{patient.name} (Demo)</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">Age {patient.age} · G{patient.gravida}P{patient.parity} · Mock Record</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${patient.risk === "high" ? "bg-rose-100 text-rose-700" : patient.risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{patient.risk}</span>
                  {patient.status === "follow-up" && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)] mb-3">
                <span className="flex items-center gap-1"><Calendar size={11} />Week {patient.week}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{getRelativeTime(patient.lastCheckIn)}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{patient.location}</span>
              </div>
              {patient.symptoms.length > 0 && <div className="flex flex-wrap gap-1.5">{patient.symptoms.map((symptom) => <span key={symptom} className="px-2 py-0.5 rounded-full bg-[var(--warm-100)] text-[11px] text-[var(--text-secondary)] border border-[var(--warm-200)]">{symptom}</span>)}</div>}
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--warm-100)]">
                <button onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${patient.phone}`; }} className="flex-1 py-2 rounded-lg bg-[var(--sage-100)] text-[var(--sage-700)] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98]"><Phone size={13} />Call</button>
                <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 rounded-lg bg-[var(--rose-100)] text-[var(--rose-700)] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98]"><MessageSquare size={13} />Message</button>
                <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 rounded-lg bg-[var(--warm-100)] text-[var(--text-secondary)] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98]"><FileText size={13} />Notes</button>
              </div>
            </motion.div>
          ))}
        </div>
        {filteredPatients.length === 0 && <div className="text-center py-16"><Search size={48} className="text-[var(--warm-300)] mx-auto mb-4" /><p className="text-[var(--text-tertiary)] font-medium">No patients match your criteria</p></div>}
      </main>

      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-[var(--bg-primary)] rounded-t-3xl border-b border-[var(--warm-200)] px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${selectedPatient.risk === "high" ? "bg-gradient-to-br from-rose-400 to-rose-600" : selectedPatient.risk === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>{selectedPatient.name.charAt(0)}</div>
                  <div>
                    <h2 className="font-bold text-[var(--text-primary)] text-lg">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedPatient.risk === "high" ? "bg-rose-100 text-rose-700" : selectedPatient.risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{selectedPatient.risk} risk</span>
                      <span className="text-xs text-[var(--text-tertiary)]">Week {selectedPatient.week}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="w-8 h-8 rounded-full bg-[var(--warm-100)] flex items-center justify-center"><XIcon size={16} className="text-[var(--text-secondary)]" /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => window.location.href = `tel:${selectedPatient.phone}`} className="rounded-xl bg-[var(--sage-100)] p-3 text-left active:scale-[0.98]"><Phone size={16} className="text-[var(--sage-600)] mb-1.5" /><div className="text-xs font-semibold text-[var(--sage-800)]">Call Patient</div><div className="text-[10px] text-[var(--sage-600)]">{selectedPatient.phone}</div></button>
                  <div className="rounded-xl bg-[var(--warm-100)] p-3"><MapPin size={16} className="text-[var(--warm-600)] mb-1.5" /><div className="text-xs font-semibold text-[var(--warm-800)]">Location</div><div className="text-[10px] text-[var(--warm-600)]">{selectedPatient.location}</div></div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Pregnancy Details</h3>
                  <div className="bg-[var(--surface-primary)] rounded-2xl p-4 border border-[var(--warm-200)]/60 space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-[var(--text-tertiary)]">Gestational Age</span><span className="text-sm font-semibold text-[var(--text-primary)]">Week {selectedPatient.week}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[var(--text-tertiary)]">Due Date</span><span className="text-sm font-semibold text-[var(--text-primary)]">{new Date(selectedPatient.dueDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[var(--text-tertiary)]">Gravida / Para</span><span className="text-sm font-semibold text-[var(--text-primary)]">G{selectedPatient.gravida}P{selectedPatient.parity}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[var(--text-tertiary)]">Last Check-in</span><span className="text-sm font-semibold text-[var(--text-primary)]">{getRelativeTime(selectedPatient.lastCheckIn)}</span></div>
                  </div>
                </div>
                {selectedPatient.symptoms.length > 0 && <div><h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Reported Symptoms</h3><div className="flex flex-wrap gap-2">{selectedPatient.symptoms.map((symptom) => <span key={symptom} className="px-3 py-1.5 rounded-full bg-[var(--rose-100)] text-xs font-medium text-[var(--rose-700)] border border-[var(--rose-200)]">{symptom}</span>)}</div></div>}
                <div><h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Worker Notes</h3><div className="bg-[var(--surface-primary)] rounded-2xl p-4 border border-[var(--warm-200)]/60"><p className="text-sm text-[var(--text-secondary)]">{selectedPatient.notes}</p></div></div>
                <div className="space-y-2.5 pt-2">
                  <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--sage-500)] to-[var(--sage-600)] text-white font-semibold shadow-lg shadow-sage-500/20 active:scale-[0.98] flex items-center justify-center gap-2"><CheckCircle2 size={18} />Mark as Resolved</button>
                  <button className="w-full py-3.5 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-semibold active:scale-[0.98] flex items-center justify-center gap-2"><Calendar size={18} />Schedule Follow-up</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon({ size, className }: { size?: number; className?: string }) {
  return <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
