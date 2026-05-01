"use client";

export const STORAGE_KEYS = {
  ONBOARDING: "mamaguard_onboarding",
  ONBOARDED_DATE: "mamaguard_onboarded",
  CHECKINS: "mamaguard_checkins",
  ARTICLES_READ: "mamaguard_articles_read",
  NOTIFICATIONS: "mamaguard_notifications",
  DATA_SHARING: "mamaguard_data_sharing",
};

export const safeStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clearAll: (): void => {
    if (typeof window === "undefined") return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  getAllData: (): Record<string, any> => {
    if (typeof window === "undefined") return {};
    const data: Record<string, any> = {};
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          data[key] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    });
    return data;
  },
};
