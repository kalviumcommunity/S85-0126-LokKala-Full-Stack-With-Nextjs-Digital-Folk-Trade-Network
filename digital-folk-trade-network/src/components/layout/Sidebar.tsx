"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/about", label: "About" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Navigation</h2>
      <ul className={styles.sidebarList}>
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href} className={styles.sidebarItem}>
              <Link
                href={link.href}
                className={`${styles.sidebarLink} ${
                  isActive ? styles.activeLink : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
