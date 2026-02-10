"use client";

import { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import Toast from "@/components/ui/Toast"; // native toast you created

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        if (cancelled) return;

        const list =
          Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.users)
            ? data.users
            : [];

        setUsersCount(list.length);
        setToast("Users loaded successfully");
      } catch {
        if (!cancelled) {
          setUsersCount(null);
          setError("Unable to load users");
          setToast("Failed to load users");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-6">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-500">
          Overview of platform activity
        </p>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="mb-4 text-lg font-medium">
          Statistics
        </h2>

        {loading && (
          <p role="status" aria-live="polite" className="mb-3 text-slate-500">
            Loading statistics…
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Total Users" value={loading ? null : usersCount} />
          <StatCard title="Artifacts Listed" value="—" />
          <StatCard title="Files Uploaded" value="—" />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
