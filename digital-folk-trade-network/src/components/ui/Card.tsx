import type { ReactNode } from "react";
import styles from "./Card.module.css";

export type CardTone = "default" | "muted" | "highlight";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  tone?: CardTone;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  actions,
  tone = "default",
  children,
  className,
}: CardProps) {
  const titleId = title ? `${title.replace(/\s+/g, "-").toLowerCase()}-card` : undefined;

  return (
    <article
      className={[styles.card, styles[tone], className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      {(title || subtitle || actions) && (
        <header className={styles.header}>
          <div className={styles.titles}>
            {title && (
              <h3 className={styles.title} id={titleId}>
                {title}
              </h3>
            )}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </article>
  );
}
