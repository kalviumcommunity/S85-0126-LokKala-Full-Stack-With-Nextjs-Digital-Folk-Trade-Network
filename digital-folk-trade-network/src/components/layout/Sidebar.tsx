"use client";
import Link from "next/link";
import styles from "./Sidebar.module.css";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/users", label: "Users" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Navigation</h2>
      <ul className={styles.sidebarList}>
        {links.map(link => (
          <li key={link.href} className={styles.sidebarItem}>
            <Link href={link.href} className={styles.sidebarLink}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
