"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { DashboardCard } from "@/components";

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState<string>("--");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        const response = await fetch("/api/users", {
          method: "GET",
          credentials: "include", // ✅ IMPORTANT for cookies
          headers: {
            Accept: "application/json",
          },
        });

        // 🔴 NOT LOGGED IN → redirect
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        // 🟡 LOGGED IN BUT NOT ALLOWED → stay on dashboard
        if (response.status === 403) {
          setUsersError(
            "You do not have permission to view user statistics."
          );
          setUsersCount("--");
          return;
        }

        if (!response.ok) {
          setUsersError("Unable to load users right now.");
          setUsersCount("--");
          return;
        }

        const data = await response.json();

        if (cancelled) return;

        const list =
          Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.users)
            ? data.users
            : null;

        if (Array.isArray(list)) {
          setUsersCount(String(list.length));
        } else {
          setUsersCount("--");
        }
      } catch (error) {
        if (!cancelled) {
          setUsersError("Unable to load users right now.");
          setUsersCount("--");
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const usersDescription =
    usersError ??
    "Registered participants across the folk trade network.";

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Digital Folk Trade Dashboard</h1>
        <p className={styles.subtitle}>
          A calm overview of the cultural marketplace—artists, artworks, and
          trade activity in one place.
        </p>
      </header>

      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          Statistics
        </h2>

        <div className={styles.statsGrid}>
          <DashboardCard
            title="Total Users"
            value={loadingUsers ? "--" : usersCount}
            description={usersDescription}
          />
          <DashboardCard
            title="Artifacts Listed"
            value="--"
            description="Cultural artifacts currently available in the marketplace."
          />
          <DashboardCard
            title="Files Uploaded"
            value="--"
            description="Supporting documents and media shared by the community."
          />
        </div>
      </section>
    </main>
  );
}
