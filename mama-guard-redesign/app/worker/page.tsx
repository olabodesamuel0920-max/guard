"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, AlertTriangle, Clock, Phone, MessageSquare, Calendar, CheckCircle2, ChevronRight, Search, Filter, ShieldAlert, Stethoscope, MapPin, FileText, Zap, Sparkles, Activity } from "lucide-react";

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
      <header className="sticky top-0 z-40 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-[var(--warm-200)]/50 px-5 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/50 border border-[var(--warm-200)]/60 flex items-center justify-center active:scale-95 shadow-sm transition-all hover:bg-white"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
          <div className="flex-1">
            <h1 className="font-bold text-[var(--text-primary)] text-base tracking-tight">Stakeholder Preview</h1>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium leading-none mt-0.5">Worker Portal · Analytical Prototype</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--rose-500)] to-[var(--rose-600)] flex items-center justify-center shadow-lg shadow-rose-500/20 text-white"><Users size={20} /></div>
        </div>
      </header>

      <div className="bg-[var(--text-primary)] text-white text-[9px] py-2 px-5 text-center font-bold tracking-[0.2em] uppercase">
        Live Stakeholder Preview Only · Sample Data · Non-Clinical Environment
      </div>

      <main className="px-5 py-6 pb-12 max-w-lg mx-auto">
        {/* Stakeholder Demo Guide */}
        <div className="mb-8 p-6 rounded-[var(--radius-3xl)] bg-gradient-to-br from-white to-[var(--bg-cream)] border border-[var(--warm-200)] shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 scale-150"><Zap size={100} /></div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--rose-500)]" />
            Stakeholder Demo Guide
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-[var(--rose-50)] flex items-center justify-center shrink-0 border border-[var(--rose-100)] text-[var(--rose-600)]"><Activity size={16} /></div>
              <div>
                <p className="text-[11px] font-bold text-[var(--text-primary)] mb-1">Risk-Prioritized Caseload</p>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">Mothers are automatically sorted by risk level based on local device reports, allowing workers to focus on urgent cases first.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-[var(--rose-50)] flex items-center justify-center shrink-0 border border-[var(--rose-100)] text-[var(--rose-600)]"><MapPin size={16} /></div>
              <div>
                <p className="text-[11px] font-bold text-[var(--text-primary)] mb-1">Regional Health Insights</p>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">Aggregated anonymized trends help administrators allocate resources to districts with higher symptom frequency.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[var(--warm-200)]">
            <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-[var(--text-tertiary)]" /><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Active</span></div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{stats.total}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mt-1">{stats.todayCheckins} Today</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-2"><ShieldAlert size={16} className="text-rose-500" /><span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Urgent Alerts</span></div>
            <div className="text-3xl font-extrabold text-rose-700 tracking-tight">{stats.highRisk}</div>
            <div className="text-[10px] text-rose-500 font-bold uppercase mt-1">{stats.followUp} Pending</div>
          </div>
        </motion.div>

        {stats.highRisk > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.1 }} 
            className="rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 p-4 mb-8 shadow-premium text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 scale-150"><ShieldAlert size={60} /></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-wider">System Alert</div>
                <div className="text-white/90 text-xs font-bold leading-tight mt-0.5">{stats.highRisk} critical cases require immediate follow-up.</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search by name or district..." 
              className="w-full bg-white border border-[var(--warm-200)] rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:border-[var(--rose-400)] focus:ring-2 focus:ring-[var(--rose-100)] focus:outline-none shadow-sm transition-all" 
            />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-white border border-[var(--warm-200)] flex items-center justify-center shadow-sm active:scale-95 hover:bg-[var(--bg-secondary)] transition-all">
            <Filter size={18} className="text-[var(--text-tertiary)]" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 -mx-1 px-1">
          {(["all", "high", "medium", "low"] as const).map((risk) => (
            <button key={risk} onClick={() => setFilterRisk(risk)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filterRisk === risk ? risk === "high" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : risk === "medium" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : risk === "low" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-[var(--text-primary)] text-white shadow-md shadow-black/20" : "bg-[var(--surface-primary)] text-[var(--text-secondary)] border border-[var(--warm-200)]"}`}>
              {risk === "all" ? "All Patients" : `${risk} Risk`}
              {risk !== "all" && <span className="ml-1 opacity-70">({mockPatients.filter((p) => p.risk === risk).length})</span>}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredPatients.map((patient, index) => (
            <motion.div key={patient.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setSelectedPatient(patient)} className="bg-[var(--surface-primary)] rounded-2xl p-4 shadow-sm border border-[var(--warm-200)]/60 active:scale-[0.98] transition-transform cursor-pointer hover:border-[var(--rose-200)] group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${patient.risk === "high" ? "bg-gradient-to-br from-rose-400 to-rose-600" : patient.risk === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>{patient.name.charAt(0)}</div>
                  <div>
                    <div className="font-bold text-[var(--text-primary)] text-[15px] group-hover:text-[var(--rose-600)] transition-colors">{patient.name}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] font-medium">Age {patient.age} · G{patient.gravida}P{patient.parity} · District {patient.location.split(' ')[1]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${patient.risk === "high" ? "bg-rose-100 text-rose-700 border border-rose-200" : patient.risk === "medium" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>{patient.risk} Risk</span>
                  {patient.status === "follow-up" && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)] mb-3 font-medium">
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[var(--warm-400)]" />Week {patient.week}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-[var(--warm-400)]" />{getRelativeTime(patient.lastCheckIn)}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[var(--warm-400)]" />{patient.location}</span>
              </div>
              {patient.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {patient.symptoms.map((symptom) => (
                    <span key={symptom} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${patient.risk === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-[var(--warm-100)] text-[var(--text-secondary)] border-[var(--warm-200)]'}`}>
                      {symptom}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--warm-100)]">
                <button onClick={(e) => { e.stopPropagation(); alert("DEMO NOTICE: In a real deployment, this would initiate a VOIP call to the patient via a secure gateway."); }} className="flex-1 py-2 rounded-xl bg-sage-50 text-sage-700 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-transform"><Phone size={13} />Call</button>
                <button onClick={(e) => { e.stopPropagation(); alert("DEMO NOTICE: This would open a professional messaging interface compliant with medical data standards."); }} className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-transform"><MessageSquare size={13} />Message</button>
                <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 rounded-xl bg-[var(--warm-50)] text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-transform"><FileText size={13} />History</button>
              </div>
            </motion.div>
          ))}
        </div>
        {filteredPatients.length === 0 && <div className="text-center py-20"><div className="w-16 h-16 rounded-full bg-[var(--warm-100)] flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-[var(--warm-300)]" /></div><p className="text-[var(--text-tertiary)] font-bold text-sm uppercase tracking-widest">No patients found</p></div>}
      </main>

      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-[32px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-[var(--bg-primary)] rounded-t-[32px] border-b border-[var(--warm-200)] px-6 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm ${selectedPatient.risk === "high" ? "bg-gradient-to-br from-rose-400 to-rose-600" : selectedPatient.risk === "medium" ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>{selectedPatient.name.charAt(0)}</div>
                  <div>
                    <h2 className="font-bold text-[var(--text-primary)] text-xl">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${selectedPatient.risk === "high" ? "bg-rose-100 text-rose-700 border border-rose-200" : selectedPatient.risk === "medium" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>{selectedPatient.risk} Risk</span>
                      <span className="text-xs text-[var(--text-tertiary)] font-medium">Week {selectedPatient.week}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="w-10 h-10 rounded-full bg-[var(--warm-100)] flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform">✕</button>
              </div>
              
              <div className="p-6 space-y-6 pb-12">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => alert("DEMO NOTICE: Calling " + selectedPatient.phone)} className="rounded-2xl bg-sage-50 p-4 text-left border border-sage-100 active:scale-95 transition-transform"><Phone size={20} className="text-sage-600 mb-2" /><div className="text-xs font-bold text-sage-800 uppercase tracking-widest">Call Patient</div><div className="text-[10px] text-sage-600 font-bold mt-1">{selectedPatient.phone}</div></button>
                  <div className="rounded-2xl bg-[var(--warm-50)] p-4 border border-[var(--warm-100)]"><MapPin size={20} className="text-[var(--text-tertiary)] mb-2" /><div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">District</div><div className="text-[10px] text-[var(--text-tertiary)] font-bold mt-1">{selectedPatient.location}</div></div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                  <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed italic">
                    This is a DEMO view. No real actions are taken. Do not use for actual patient triage.
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">Patient Vitals & Info</h3>
                  <div className="bg-[var(--surface-primary)] rounded-2xl p-5 border border-[var(--warm-200)]/60 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center"><span className="text-xs font-medium text-[var(--text-tertiary)]">Gestational Age</span><span className="text-xs font-bold text-[var(--text-primary)] uppercase">Week {selectedPatient.week}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-medium text-[var(--text-tertiary)]">Estimated Due Date</span><span className="text-xs font-bold text-[var(--text-primary)] uppercase">{new Date(selectedPatient.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-medium text-[var(--text-tertiary)]">Gravida / Para Status</span><span className="text-xs font-bold text-[var(--text-primary)] uppercase">G{selectedPatient.gravida} P{selectedPatient.parity}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-medium text-[var(--text-tertiary)]">Last Automated Check-in</span><span className="text-xs font-bold text-[var(--text-primary)] uppercase">{getRelativeTime(selectedPatient.lastCheckIn)}</span></div>
                  </div>
                </div>

                {selectedPatient.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">Critical Symptoms Reported</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.symptoms.map((symptom) => (
                        <span key={symptom} className="px-4 py-2 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 border border-rose-100 shadow-sm uppercase tracking-tight">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">Clinician / Worker Notes</h3>
                  <div className="bg-[var(--surface-primary)] rounded-2xl p-5 border border-[var(--warm-200)]/60 shadow-sm">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{selectedPatient.notes}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button onClick={() => alert("DEMO: Marked as resolved.")} className="w-full py-4 rounded-2xl bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sage-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Resolve Alert</button>
                  <button onClick={() => alert("DEMO: Follow-up scheduled.")} className="w-full py-4 rounded-2xl bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"><Calendar size={18} /> Schedule Follow-up Visit</button>
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
