"use client";

import { useUI } from "@/hooks/useUI";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUI();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-gradient-to-r from-brand/80 via-orange-500 to-purple-500 px-3 py-2 text-sm font-semibold text-surface-dark shadow-glow transition hover:translate-y-[-1px] hover:shadow-lg dark:text-surface-light"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-xs font-bold text-white">
        {isDark ? "☾" : "☀"}
      </span>
      <span>{isDark ? "Dark" : "Light"} mode</span>
    </button>
  );
}
