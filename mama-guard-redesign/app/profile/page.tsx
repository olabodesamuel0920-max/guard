"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek, getTrimester } from "@/lib/utils";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import {
  User,
  ChevronRight,
  Heart,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  Baby,
  Calendar,
  Edit3,
  Trash2,
  Download,
  Info,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface UserProfile {
  name: string;
  status: "pregnant" | "postpartum";
  dueDate: string;
  providerPhone?: string;
  nearestHospital?: string;
  emergencyContact?: string;
}

type ActionMenuItem = {
  icon: LucideIcon;
  label: string;
  desc: string;
  action: () => void;
  toggle?: false;
  value?: never;
  onToggle?: never;
};

type ToggleMenuItem = {
  icon: LucideIcon;
  label: string;
  desc: string;
  toggle: true;
  value: boolean;
  onToggle: () => void;
  action?: never;
};

type MenuItem = ActionMenuItem | ToggleMenuItem;

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [stats, setStats] = useState({ checkins: 0, articles: 0, streak: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  useEffect(() => {
    const stored = safeStorage.get<UserProfile | null>(STORAGE_KEYS.ONBOARDING, null);
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setUser(stored);

    const savedNotifications = safeStorage.get(STORAGE_KEYS.NOTIFICATIONS, true);
    setNotifications(savedNotifications);

    const savedDataSharing = safeStorage.get(STORAGE_KEYS.DATA_SHARING, false);
    setDataSharing(savedDataSharing);

    // Calculate stats
    const checkins = safeStorage.get<any[]>(STORAGE_KEYS.CHECKINS, []) || [];
    if (Array.isArray(checkins)) {
      setHistory([...checkins].reverse()); // Latest first
      
      // Simple streak calculation (consecutive days)
      let streak = 0;
      if (checkins.length > 0) {
        const dates = checkins
          .filter(c => c && c.date)
          .map(c => new Date(c.date).toDateString());
        const uniqueDates = Array.from(new Set(dates)).sort((a, b) => {
          const timeA = new Date(a).getTime() || 0;
          const timeB = new Date(b).getTime() || 0;
          return timeB - timeA;
        });
        
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = new Date(uniqueDates[i]);
            const next = new Date(uniqueDates[i + 1]);
            const diff = (current.getTime() - next.getTime()) / 86400000;
            if (diff <= 1.1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      const articlesRead = safeStorage.get<string[]>(STORAGE_KEYS.ARTICLES_READ, []) || [];
      
      setStats({
        checkins: checkins.length,
        articles: Array.isArray(articlesRead) ? articlesRead.length : 0,
        streak
      });
    }
  }, [router]);

  const handleEditProfile = () => {
    setEditData(user);
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    if (editData) {
      setUser(editData);
      safeStorage.set(STORAGE_KEYS.ONBOARDING, editData);
      setShowEditProfile(false);
    }
  };

  const handleToggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    safeStorage.set(STORAGE_KEYS.NOTIFICATIONS, newVal);
  };

  const handleToggleDataSharing = () => {
    const newVal = !dataSharing;
    setDataSharing(newVal);
    safeStorage.set(STORAGE_KEYS.DATA_SHARING, newVal);
  };

  const week = user?.dueDate ? getGestationalWeek(user.dueDate) : 0;
  const trimester = getTrimester(week);

  const menuSections: MenuSection[] = [
    {
      title: "Health & Activity",
      items: [
        {
          icon: Heart,
          label: "Health History",
          desc: stats.checkins > 0 ? `${stats.checkins} check-ins recorded` : "No history yet · Start a check-in",
          action: () => setShowHistory(true),
        },
        {
          icon: Shield,
          label: "Safety Plan",
          desc: "Emergency contacts & hospital info",
          action: () => router.push("/safety"),
        },
      ],
    },
    {
      title: "Care Team",
      items: [
        {
          icon: Edit3,
          label: "Healthcare Provider",
          desc: user?.providerPhone || "Add provider phone number",
          action: handleEditProfile,
        },
        {
          icon: FileText,
          label: "Nearest Hospital",
          desc: user?.nearestHospital || "Add nearest emergency care center",
          action: handleEditProfile,
        },
        {
          icon: Heart,
          label: "Emergency Contact",
          desc: user?.emergencyContact || "Add a trusted contact person",
          action: handleEditProfile,
        },
        {
          icon: Shield,
          label: "View Safety Plan",
          desc: "Full protocol & warning signs",
          action: () => router.push("/safety"),
        },
      ],
    },
    {
      title: "Settings & Privacy",
      items: [
        {
          icon: User,
          label: "Personal Information",
          desc: user?.name || "Update your profile",
          action: handleEditProfile,
        },
        {
          icon: Lock,
          label: "Data & Privacy Info",
          desc: "Local storage · Privacy overview",
          action: () => setShowPrivacyInfo(true),
        },
        {
          icon: Download,
          label: "Export My Data",
          desc: "Download records to your device",
          action: () => handleExportData(),
        },
        {
          icon: Bell,
          label: "Notifications",
          desc: notifications ? "Enabled" : "Disabled",
          toggle: true,
          value: notifications,
          onToggle: handleToggleNotifications,
        },
      ],
    },
    {
      title: "About Mama Guard",
      items: [
        {
          icon: Info,
          label: "Product Mission",
          desc: "Learn about Mama Guard early access",
          action: () => router.push("/about"),
        },
        {
          icon: HelpCircle,
          label: "Help Center & FAQs",
          desc: "Get support and guidance",
          action: () => setShowHelp(true),
        },
      ],
    },
  ];

  const handleReset = () => {
    safeStorage.clearAll();
    router.push("/onboarding");
  };

  const handleCopyHistoryItem = (entry: any) => {
    const summary = `Mama Guard Check-in Summary:\nDate: ${new Date(entry.date).toLocaleDateString()}\nRisk: ${entry.risk.toUpperCase()}\nSymptoms: ${entry.symptoms.join(", ")}\nSuggested Next Step: ${entry.risk === "high" ? "Contact healthcare provider immediately" : entry.risk === "medium" ? "Monitor and consult provider" : "Continue routine care"}\n\nThis is prototype guidance and not a medical diagnosis.`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => alert("Summary copied to clipboard!")).catch(() => alert("Failed to copy."));
    } else {
      alert("Clipboard not available.");
    }
  };

  const handleExportData = () => {
    try {
      const data = safeStorage.getAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mama-guard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center mb-6 animate-pulse">
          <User size={32} className="text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Loading Profile...</h2>
        <p className="text-sm text-[var(--text-tertiary)] max-w-xs">Please wait while we fetch your local records.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header showAssistantButton={false} />

      <main className="pt-20 pb-28 px-5 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-[var(--rose-50)] via-[var(--bg-secondary)] to-[var(--bg-cream)] p-6 mb-6 shadow-lg border border-[var(--rose-200)]/40 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--rose-200)]/20 blur-2xl" />

          <div className="relative flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-rose-200">
                {user.name?.charAt(0) || "M"}
              </div>

              <button
                type="button"
                onClick={handleEditProfile}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-rose-100 flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >
                <Edit3 size={14} className="text-rose-600" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-0.5 truncate">
                {user.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  {user.status === "pregnant" ? "Pregnant" : "Postpartum"}
                </span>
                {week > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--warm-200)]">
                    Week {week} · {trimester}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">
                Early Access · Records stored on this device only
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[var(--warm-200)]/60">
            <div className="text-center group">
              <div className="text-2xl font-extrabold text-[var(--text-primary)] group-active:scale-110 transition-transform">
                {stats.checkins}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Check-ins
              </div>
            </div>

            <div className="text-center group">
              <div className="text-2xl font-extrabold text-[var(--text-primary)] group-active:scale-110 transition-transform">
                {stats.articles}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Read
              </div>
            </div>

            <div className="text-center group">
              <div className="text-2xl font-extrabold text-[var(--text-primary)] group-active:scale-110 transition-transform flex items-center justify-center gap-1">
                {stats.streak} <span className="text-sm">🔥</span>
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Streak
              </div>
            </div>
          </div>
        </motion.div>

        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.05 }}
            className="mb-6"
          >
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>

            <div className="bg-[var(--surface-primary)] rounded-2xl shadow-sm border border-[var(--warm-200)]/60 overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;

                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      if ("action" in item && item.action) {
                        item.action();
                      }
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--warm-50)] ${
                      !isLast ? "border-b border-[var(--warm-100)]" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--warm-100)] flex items-center justify-center flex-shrink-0">
                      <Icon
                        size={17}
                        className="text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--text-primary)] text-sm">
                        {item.label}
                      </div>

                      <div className="text-xs text-[var(--text-tertiary)] truncate pr-4">
                        {item.desc}
                      </div>
                    </div>

                    {item.toggle ? (
                      <div
                        role="switch"
                        aria-checked={item.value}
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          item.onToggle();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            item.onToggle();
                          }
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
                          item.value
                            ? "bg-[var(--rose-500)]"
                            : "bg-[var(--warm-300)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                            item.value ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-[var(--warm-300)] flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => router.push("/worker")}
            className="w-full rounded-2xl bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-50)] border border-[var(--sage-200)] p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--sage-200)] flex items-center justify-center">
                <Shield size={20} className="text-[var(--sage-700)]" />
              </div>

              <div className="flex-1">
                <div className="font-semibold text-[var(--sage-800)] text-sm">
                  Stakeholder Preview: Worker Portal
                </div>
                <div className="text-xs text-[var(--sage-600)]">
                  Demo-only preview for future care team workflows
                </div>
              </div>

              <ChevronRight size={16} className="text-[var(--sage-500)]" />
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-rose-100 active:scale-[0.98] transition-all"
          >
            <LogOut size={16} /> Reset Account Data
          </button>
        </motion.div>

        <div className="text-center pb-4">
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Mama Guard Prototype v3.0
          </p>
        </div>
      </main>

      <BottomNav />

      {showResetConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-rose-600" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
              Reset All Data?
            </h3>

            <p className="text-sm text-[var(--text-secondary)] text-center mb-6 leading-relaxed">
              This will erase your profile, check-in history, and all saved
              prototype data. This action cannot be undone.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl bg-rose-600 text-white font-bold active:scale-[0.98] transition-all shadow-lg shadow-rose-600/20"
              >
                Yes, Reset Everything
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-3.5 rounded-2xl bg-[var(--warm-100)] text-[var(--text-secondary)] font-bold active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end justify-center">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-[var(--bg-primary)] rounded-t-[32px] w-full max-w-lg h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-[var(--warm-200)] flex items-center justify-between bg-[var(--surface-primary)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Health History</h3>
                <p className="text-xs text-[var(--text-tertiary)] font-medium">Recorded on this device</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-[var(--warm-100)] flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {history.length > 0 ? (
                history.map((entry, i) => (
                  <div key={i} className="bg-white rounded-[24px] p-6 border border-[var(--warm-200)] shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} · {new Date(entry.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          Check-in at Week {entry.week || 'Unknown'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border-2 ${
                        entry.risk === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        entry.risk === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {entry.risk} Risk Guidance
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {entry.symptoms && Array.isArray(entry.symptoms) && entry.symptoms.length > 0 ? (
                        entry.symptoms.map((s: string) => (
                          <span key={s} className="px-2.5 py-1 bg-[var(--bg-secondary)] rounded-lg text-[10px] font-bold text-[var(--text-secondary)] border border-[var(--warm-200)]">{s}</span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)] italic font-medium">No concerning symptoms reported</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleCopyHistoryItem(entry)}
                      className="w-full py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-[var(--warm-200)]"
                    >
                      <FileText size={16} className="text-rose-500" /> Copy Provider Summary
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 px-10">
                  <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Heart size={32} className="text-[var(--warm-300)]" />
                  </div>
                  <p className="text-[var(--text-primary)] font-bold mb-2">No health history yet</p>
                  <p className="text-[var(--text-tertiary)] text-xs leading-relaxed mb-8">Your recorded check-ins will appear here to help you track trends over time.</p>
                  <button 
                    onClick={() => { setShowHistory(false); router.push('/checkin'); }}
                    className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200 active:scale-[0.95] transition-all"
                  >
                    Start First Check-in
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showEditProfile && editData && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-5">Edit Profile</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1 tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--warm-200)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--rose-400)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1 tracking-widest">Provider Phone</label>
                <input 
                  type="tel" 
                  value={editData.providerPhone || ""} 
                  onChange={e => setEditData({...editData, providerPhone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--warm-200)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--rose-400)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1 tracking-widest">Nearest Hospital</label>
                <input 
                  type="text" 
                  value={editData.nearestHospital || ""} 
                  onChange={e => setEditData({...editData, nearestHospital: e.target.value})}
                  placeholder="e.g. City General"
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--warm-200)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--rose-400)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1 tracking-widest">Emergency Contact</label>
                <input 
                  type="text" 
                  value={editData.emergencyContact || ""} 
                  onChange={e => setEditData({...editData, emergencyContact: e.target.value})}
                  placeholder="e.g. Partner, Parent, or Friend"
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--warm-200)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--rose-400)]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-3.5 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20">Save</button>
            </div>
          </motion.div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Help Center</h3>
            <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-1">What is Mama Guard?</p>
                <p>A supportive prototype designed to help track maternal health symptoms and provide educational guidance.</p>
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-1">Is this a medical app?</p>
                <p>No. This is a technology prototype. It does not provide medical diagnoses, clinical review, or emergency dispatch.</p>
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] mb-1">How do I share my data?</p>
                <p>Use the "Copy Summary" feature in your health history to copy a text summary that you can share with your doctor.</p>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-6 py-3.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest">Close</button>
          </motion.div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Terms & Privacy</h3>
            <div className="space-y-4 text-[11px] text-[var(--text-tertiary)] leading-relaxed uppercase tracking-tight font-bold">
              <p>1. PROTOTYPE ONLY: This application is for demonstration purposes. Do not rely on it for medical decisions.</p>
              <p>2. LOCAL STORAGE: Your data is stored only on this browser/device. We do not transmit or backup your data to any server.</p>
              <p>3. NO EMERGENCY SERVICES: Mama Guard does not contact 911 or any emergency responders. Always call emergency services yourself in urgent cases.</p>
              <p>4. NO WARRANTY: This prototype is provided "as is" without any guarantees of accuracy or uptime.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="w-full mt-6 py-3.5 rounded-xl bg-[var(--warm-100)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest">Close</button>
          </motion.div>
        </div>
      )}

      {showPrivacyInfo && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--rose-100)] flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-[var(--rose-600)]" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-4">
              Data & Privacy Details
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--warm-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--rose-400)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Local Storage:</strong> Your information is stored strictly on this device and browser.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--warm-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--rose-400)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>No Cloud Sync:</strong> This version does not sync data to any remote server. Clearing browser data will permanently remove your records.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--warm-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--rose-400)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Future Roadmap:</strong> Secure accounts and cloud backup are planned for a future release.
                </p>
              </div>

              <div className="bg-[var(--warm-50)] p-3 rounded-xl border border-[var(--warm-100)]">
                <div className="flex gap-2 mb-1.5">
                  <Info size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Medical Disclaimer</span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-normal font-medium">
                  Mama Guard is a technology prototype. It does not provide medical diagnoses, clinical review, or contact emergency services.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyInfo(false)}
              className="w-full py-3.5 rounded-2xl bg-[var(--warm-100)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
