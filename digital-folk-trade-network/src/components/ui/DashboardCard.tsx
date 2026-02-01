import React from "react";
import styles from "./DashboardCard.module.css";

export type DashboardCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export default function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <article className={styles.card} aria-label={title}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>
        <p className={styles.value}>{value}</p>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
    </article>
  );
}

