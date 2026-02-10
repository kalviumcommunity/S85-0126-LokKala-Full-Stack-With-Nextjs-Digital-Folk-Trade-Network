"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      console.log("Theme toggled to", next);
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ui-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    window.localStorage.setItem("ui-theme", theme);
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      console.log(next ? "Sidebar opened" : "Sidebar closed");
      return next;
    });
  };

  return (
    <UIContext.Provider value={{ theme, toggleTheme, sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIContext must be used within a UIProvider");
  return context;
}