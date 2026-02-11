"use client";
import { Button, Card, ThemeToggle } from "@/components";
import ResponsiveShowcase from "@/components/layout/ResponsiveShowcase";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { sanitizeInput } from "@/lib/sanitize";

const stats = [
  { label: "Artisans", value: "2.4k" },
  { label: "Marketplaces", value: "12" },
  { label: "Avg. Rating", value: "4.8" },
];

const maliciousSamples = [
  "<script>alert('Hacked!')</script>",
  "Hello <b>world</b>",
  "' OR 1=1 --",
];

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleSidebar, sidebarOpen } = useUI();

  return (
    <main className="space-y-8 p-6 text-text-base transition-colors dark:text-text-onDark">
      <section className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <Card
          title="Responsive, themed shell"
          subtitle="Try resizing the viewport and toggling themes"
          tone="highlight"
        >
          <p className="mb-4 text-sm text-text-muted dark:text-text-onDark/70">
            The layout inherits Tailwind breakpoints (xs → 2xl) and switches light/dark via the html class. Components use design tokens for contrast.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Button label={sidebarOpen ? "Close sidebar" : "Open sidebar"} onClick={toggleSidebar} variant="secondary" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 xs:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm dark:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-brand dark:text-brand-light">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Auth & state" subtitle="Context-driven demo" tone="muted">
          <div className="space-y-3 text-sm">
            <p>Current theme: <span className="font-semibold">{theme}</span></p>
            {isAuthenticated ? (
              <div className="space-y-2">
                <p>Logged in as: {user?.name ?? user?.email}</p>
                <Button label="Logout" onClick={logout} variant="secondary" fullWidth />
              </div>
            ) : (
              <Button label="Login as demo user" onClick={() => login("KalviumUser")} fullWidth />
            )}
          </div>
        </Card>
      </section>

      <ResponsiveShowcase />

      <Card title="Sanitization demo" subtitle="Before vs after" tone="default">
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Raw input</p>
            <ul className="list-disc space-y-1 pl-4">
              {maliciousSamples.map((item) => (
                <li key={item} className="break-words text-text-muted dark:text-text-onDark/70">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">After sanitizeInput</p>
            <ul className="list-disc space-y-1 pl-4">
              {maliciousSamples.map((item) => (
                <li key={item} className="break-words text-green-200">
                  {sanitizeInput(item) || "(removed)"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </main>
  );
}