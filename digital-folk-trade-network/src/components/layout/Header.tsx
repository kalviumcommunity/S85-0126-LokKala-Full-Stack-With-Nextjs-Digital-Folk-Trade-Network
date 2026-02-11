"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ui/ThemeToggle";
import styles from "./Header.module.css";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/about", label: "About" },
];

export default function Header({ title }: { title?: string }) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Digital Folk Trade Network home">
          <span className={styles.logoMark}>DF</span>
          <span className={styles.logoText}>Digital Folk Trade Network</span>
          <span className={styles.badge}>v1.0</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${
                  isActive ? styles.navLinkActive : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {title ? <div className="ml-4 text-lg font-semibold">{title}</div> : null}

        <div className={styles.actions}>
          <Link className={styles.actionLink} href="/dashboard">
            Sell your craft
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
