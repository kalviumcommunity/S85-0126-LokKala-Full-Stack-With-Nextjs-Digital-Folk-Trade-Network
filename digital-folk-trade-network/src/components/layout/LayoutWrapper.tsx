import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./LayoutWrapper.module.css";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
