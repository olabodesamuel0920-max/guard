"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek, getTrimester } from "@/lib/utils";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface UserProfile {
  name: string;
  status: "pregnant" | "postpartum";
  dueDate: string;
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mamaguard_onboarding");

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const week = user?.dueDate ? getGestationalWeek(user.dueDate) : 0;
  const trimester = getTrimester(week);

  const menuSections: MenuSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Personal Information",
          desc: user?.name || "Not set",
          action: () => {},
        },
        {
          icon: Baby,
          label: "Pregnancy Details",
          desc: user?.dueDate
            ? `Due ${new Date(user.dueDate).toLocaleDateString()} · ${trimester}`
            : "Not set",
          action: () => {},
        },
        {
          icon: Calendar,
          label: "Appointments",
          desc: "0 upcoming",
          action: () => {},
        },
        {
          icon: Heart,
          label: "Health History",
          desc: "View your check-ins",
          action: () => router.push("/home"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          desc: notifications ? "Enabled" : "Disabled",
          toggle: true,
          value: notifications,
          onToggle: () => setNotifications((prev) => !prev),
        },
        {
          icon: Shield,
          label: "Data Sharing",
          desc: dataSharing ? "Enabled" : "Disabled",
          toggle: true,
          value: dataSharing,
          onToggle: () => setDataSharing((prev) => !prev),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          desc: "FAQs and support",
          action: () => {},
        },
        {
          icon: FileText,
          label: "Terms & Privacy",
          desc: "Legal information",
          action: () => {},
        },
      ],
    },
  ];

  const handleReset = () => {
    localStorage.removeItem("mamaguard_onboarding");
    localStorage.removeItem("mamaguard_checkins");
    router.push("/onboarding");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header showAIButton={false} />

      <main className="pt-20 pb-28 px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-[var(--rose-50)] via-[var(--bg-secondary)] to-[var(--bg-cream)] p-6 mb-6 shadow-lg border border-[var(--rose-200)]/40 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--rose-200)]/20 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--rose-400)] to-[var(--rose-600)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name?.charAt(0) || "M"}
              </div>

              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--surface-primary)] border-2 border-[var(--warm-200)] flex items-center justify-center shadow-sm"
              >
                <Edit3 size={12} className="text-[var(--text-tertiary)]" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-0.5">
                {user.name}
              </h1>

              <p className="text-sm text-[var(--text-secondary)] mb-1">
                {user.status === "pregnant" ? "Pregnant" : "Postpartum"}
              </p>

              {week > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--rose-100)] text-xs font-semibold text-[var(--rose-700)]">
                    Week {week}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {trimester}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--warm-200)]/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                0
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Check-ins
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                0
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Articles Read
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                0
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Day Streak
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

                      <div className="text-xs text-[var(--text-tertiary)]">
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
                  Community Health Worker Portal
                </div>
                <div className="text-xs text-[var(--sage-600)]">
                  View patient caseload and alerts
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
            className="w-full py-3.5 rounded-2xl bg-[var(--warm-100)] text-[var(--warm-600)] font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <LogOut size={16} /> Reset Account Data
          </button>
        </motion.div>

        <div className="text-center pb-4">
          <p className="text-[11px] text-[var(--text-muted)]">
            Mama Guard v2.0
          </p>
        </div>
      </main>

      <BottomNav />

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--surface-primary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--rose-100)] flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-[var(--rose-600)]" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">
              Reset All Data?
            </h3>

            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This will erase your profile, check-in history, and all saved
              data. This action cannot be undone.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl bg-[var(--rose-500)] text-white font-semibold active:scale-[0.98] transition-all"
              >
                Yes, Reset Everything
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-3.5 rounded-2xl bg-[var(--warm-100)] text-[var(--text-secondary)] font-medium active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
