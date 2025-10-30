"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeToggleProps {
  dict: any;
  showTitle?: boolean;
}

export function ThemeToggle({ dict, showTitle = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      value: "light" as const, 
      label: dict.theme?.light || "Light", 
      icon: Sun 
    },
    { 
      value: "dark" as const, 
      label: dict.theme?.dark || "Dark", 
      icon: Moon 
    },
    { 
      value: "system" as const, 
      label: dict.theme?.system || "System", 
      icon: Monitor 
    },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {showTitle && (
        <div className="text-sm font-medium text-text-secondary mb-2">
          {dict.theme?.title || "Theme"}
        </div>
      )}
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition ${
            theme === value
              ? "mobile-menu-item-active"
              : "text-text-primary hover:bg-surface-secondary"
          }`}
          style={theme === value ? {} : { color: 'var(--text-primary)' }}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}