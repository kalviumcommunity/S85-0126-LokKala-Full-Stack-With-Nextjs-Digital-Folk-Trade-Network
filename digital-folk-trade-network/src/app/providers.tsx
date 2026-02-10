"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>{children}</UIProvider>
    </AuthProvider>
  );
}
