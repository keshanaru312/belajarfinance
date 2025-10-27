"use client";
import { useEffect, useState } from "react";

export function usePersistentValue<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return stored as T;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    // ✅ Also store in cookie for SSR / cross-session persistence
    document.cookie = `${key}=${encodeURIComponent(
      JSON.stringify(value)
    )}; path=/; max-age=31536000`; // 1 year
  }, [key, value]);

  return [value, setValue] as const;
}