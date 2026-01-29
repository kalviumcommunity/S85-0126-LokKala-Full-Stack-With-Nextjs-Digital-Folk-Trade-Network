"use client";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>MyApp</h1>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </header>
  );
}
