import Header from "./Header";
import styles from "./LayoutWrapper.module.css";
import Sidebar from "./Sidebar";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main id="main-content" className={styles.content} role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
