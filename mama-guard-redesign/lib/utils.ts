import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGestationalWeek(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeksLeft = Math.floor(diffDays / 7);
  const week = 40 - weeksLeft;
  return Math.max(0, Math.min(40, week));
}

export function getTrimester(week: number): string {
  if (week <= 12) return "First Trimester";
  if (week <= 27) return "Second Trimester";
  return "Third Trimester";
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function getBabySize(week: number): { fruit: string; emoji: string } {
  const sizes: Record<number, { fruit: string; emoji: string }> = {
    4: { fruit: "Poppy Seed", emoji: "🌱" }, 8: { fruit: "Raspberry", emoji: "🍇" },
    12: { fruit: "Lime", emoji: "🍈" }, 16: { fruit: "Avocado", emoji: "🥑" },
    20: { fruit: "Banana", emoji: "🍌" }, 24: { fruit: "Corn", emoji: "🌽" },
    28: { fruit: "Eggplant", emoji: "🍆" }, 32: { fruit: "Squash", emoji: "🎃" },
    36: { fruit: "Lettuce", emoji: "🥬" }, 40: { fruit: "Pumpkin", emoji: "🎃" },
  };
  const keys = Object.keys(sizes).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
  );
  return sizes[closest] || { fruit: "Little One", emoji: "👶" };
}

export type RiskLevel = "low" | "medium" | "high";

export function getRiskAdvice(level: RiskLevel, week: number): string {
  if (level === "high") {
    if (week >= 37) return "URGENT ACTION RECOMMENDED: You are at full-term. These symptoms require immediate medical evaluation. Contact your healthcare provider now or go to the nearest emergency care center immediately if symptoms are severe.";
    if (week >= 28) return "URGENT ACTION RECOMMENDED: In the third trimester, these symptoms are serious and require prompt medical evaluation. Please contact your healthcare provider or visit an emergency care center immediately.";
    if (week >= 14) return "IMPORTANT GUIDANCE: These symptoms in the second trimester require prompt medical evaluation. Please contact your healthcare provider or visit an emergency care center today for guidance.";
    return "IMPORTANT GUIDANCE: Early pregnancy symptoms like these require prompt medical evaluation. Please contact your healthcare provider today for guidance.";
  }
  if (level === "medium") return "MONITORING ADVISED: It is recommended to discuss these symptoms with your healthcare provider. Contact them if symptoms continue, worsen, or if you feel concerned.";
  return "ROUTINE MONITORING: These are common symptoms. Continue monitoring, stay hydrated, and refer to your Safety Plan. Check in again if anything changes.";
}
