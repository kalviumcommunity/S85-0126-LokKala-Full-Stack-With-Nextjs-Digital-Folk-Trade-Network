"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh session using refresh token stored in HTTP-only cookie
   * Automatically called on mount and when access token expires
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          setUser(data.data.user);
          console.log(`[AUTH] Session refreshed. Token rotated from v${data.data.rotatedFromVersion} to v${data.data.newRefreshTokenVersion}`);
          return true;
        }
      }
      
      setUser(null);
      return false;
    } catch (error) {
      console.error("[AUTH] Failed to refresh session:", error);
      setUser(null);
      return false;
    }
  }, []);

  /**
   * Login with email and password
   * Tokens are stored in HTTP-only cookies by the server
   */
  const login = async (email: string, password?: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success && data.data.user) {
        setUser(data.data.user);
        console.log(`[AUTH] Login successful. User: ${data.data.user.email}, Token version: ${data.data.refreshTokenVersion}`);
      }
    } catch (error) {
      console.error("[AUTH] Login failed:", error);
      throw error;
    }
  };

  /**
   * Logout and clear all tokens
   * Invalidates refresh token on server
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      setUser(null);
      console.log("[AUTH] Logged out successfully");
    } catch (error) {
      console.error("[AUTH] Logout failed:", error);
      setUser(null);
    }
  };

  /**
   * On mount, try to refresh session from refresh token
   * This restores authentication state on page reload
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshSession();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshSession]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}