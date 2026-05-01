"use client";

import { AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

interface MedicalDisclaimerProps {
  variant?: "normal" | "emergency";
  className?: string;
}

export function MedicalDisclaimer({ variant = "normal", className = "" }: MedicalDisclaimerProps) {
  if (variant === "emergency") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6 ${className}`}
      >
        <div className="flex items-start gap-3 text-red-800">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div className="font-bold text-sm">Emergency Notice</div>
            <p className="text-sm leading-relaxed">
              This may need urgent medical attention. Contact your healthcare provider now or go to the nearest emergency center if symptoms are severe.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`bg-[var(--warm-50)] border border-[var(--warm-200)] rounded-xl p-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3 text-[var(--text-secondary)]">
        <Info size={18} className="mt-0.5 flex-shrink-0 text-[var(--rose-400)]" />
        <div className="space-y-1">
          <div className="font-semibold text-xs text-[var(--text-primary)]">Medical Disclaimer</div>
          <p className="text-xs leading-relaxed">
            Mama Guard is a support tool and does not provide a medical diagnosis. If symptoms are severe, worsening, or you feel unsafe, contact your healthcare provider or visit the nearest emergency center.
          </p>
        </div>
      </div>
    </div>
  );
}
