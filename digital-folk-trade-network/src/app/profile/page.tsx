"use client";

import Link from "next/link";
import { Card } from "@/components";
import { useAuthContext } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, isLoading } = useAuthContext();

  return (
    <main className="space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-onDark">Your Profile</h1>
        <p className="text-sm text-text-onDark/70">
          Manage your artisan or buyer identity and keep your craft story updated.
        </p>
      </header>

      {isLoading ? (
        <Card tone="muted">
          <p className="text-sm text-text-onDark/80">Loading profile…</p>
        </Card>
      ) : user ? (
        <Card tone="default">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-xl font-semibold text-brand-light">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <p className="text-lg font-semibold text-text-onDark">{user.name}</p>
                <p className="text-sm text-text-onDark/70">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-text-onDark/80">
                <p className="text-xs uppercase tracking-[0.2em] text-text-onDark/50">Role</p>
                <p className="mt-2 font-semibold text-brand-light">{user.role}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-text-onDark/80">
                <p className="text-xs uppercase tracking-[0.2em] text-text-onDark/50">Profile status</p>
                <p className="mt-2 font-semibold">Verified member</p>
              </div>
            </div>

            <p className="text-sm text-text-onDark/70">
              Keep your profile fresh to help buyers connect with the stories behind your craft.
            </p>
          </div>
        </Card>
      ) : (
        <Card tone="muted">
          <div className="space-y-3">
            <p className="text-sm text-text-onDark/80">You are not signed in.</p>
            <Link
              href="/login"
              className="inline-flex w-fit rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-text-onDark transition hover:border-brand/70 hover:text-brand-light"
            >
              Go to login
            </Link>
          </div>
        </Card>
      )}
    </main>
  );
}
