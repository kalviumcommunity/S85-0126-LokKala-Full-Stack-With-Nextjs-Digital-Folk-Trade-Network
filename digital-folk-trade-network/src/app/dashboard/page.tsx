"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./Dashboard.module.css";
import { DashboardCard } from "@/components";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const [usersCount, setUsersCount] = useState<string>("--");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        // Simulate network delay to visualize loading state
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Uncomment the line below to test error handling
        // throw new Error("Simulated error: Unable to connect to the server");

        toast.loading("Loading users...");


        const response = await fetch("/api/users", {
          method: "GET",
          credentials: "include", // ✅ IMPORTANT for cookies
          headers: {
            Accept: "application/json",
          },
        });


        // 🔴 NOT LOGGED IN → redirect
        if (response.status === 401) {
          toast.dismiss();

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
          toast.dismiss();
          toast.success("Users loaded successfully");
        } else {
          setUsersCount("--");
          toast.dismiss();
          toast.error("Unexpected data format");
        }
      } catch (error) {
        if (!cancelled) {
          setUsersError("Unable to load users right now.");
          setUsersCount("--");
          toast.dismiss();
          toast.error("Failed to load users");
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

  const handleResetDemo = async () => {
    setActionLoading(true);
    setOpenModal(false);

    toast.loading("Performing action...");

    await new Promise((res) => setTimeout(res, 1500));

    toast.dismiss();
    toast.success("Action completed successfully");

    setActionLoading(false);
  };

  const usersDescription =
    usersError ??
    "Registered participants across the folk trade network.";

  const profileName = useMemo(() => {
    if (isAuthLoading) return "Loading…";
    return user?.name ?? "Profile";
  }, [isAuthLoading, user?.name]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Digital Folk Trade Dashboard</h1>
          <Link href="/profile" className={styles.profileLink}>
            <span className={styles.profileLabel}>Welcome,</span>
            <span className={styles.profileName}>{profileName}</span>
          </Link>
        </div>
        <p className={styles.subtitle}>

          A calm overview of the cultural marketplace—artists, artworks, and
          trade activity in one place.

          A calm overview of the cultural marketplace—artists, artworks, and trade
          activity in one place.

        </p>
      </header>

      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          Statistics
        </h2>

        {loadingUsers && (
          <p role="status" aria-live="polite" className={styles.loadingText}>
            Loading statistics…
          </p>
        )}

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

      <section className={styles.actionsSection}>
        <button
          onClick={() => setOpenModal(true)}
          className={styles.dangerButton}
        >
          Reset Demo Data
        </button>

        <ConfirmModal
          isOpen={openModal}
          onConfirm={handleResetDemo}
          onClose={() => setOpenModal(false)}
        />

        {actionLoading && (
          <p role="status" aria-live="polite" className={styles.loadingText}>
            Processing action…
          </p>
        )}
      </section>
    </main>
  );
}
