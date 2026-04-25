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
    if (week >= 37) return "You're full-term. Any concerning symptoms should be evaluated immediately.";
    if (week >= 28) return "In the third trimester, these symptoms need prompt medical attention.";
    if (week >= 14) return "Please contact your healthcare provider today for guidance.";
    return "Early pregnancy symptoms like these should be discussed with your provider promptly.";
  }
  if (level === "medium") return "It's a good idea to discuss these with your healthcare provider at your next visit or call their advice line.";
  return "These are common symptoms. Rest, stay hydrated, and continue monitoring. Check in again if anything changes.";
}
