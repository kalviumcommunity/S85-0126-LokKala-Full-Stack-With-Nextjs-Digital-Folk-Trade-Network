"use client";
import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        background: "#111",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 6,
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}
