"use client";

import { useEffect, useMemo, useState } from "react";

import type { ClassesConfig } from "@/types/config";
import { loadClassesConfig } from "@/lib/config";
import styles from "./panel.module.css";

export default function LegendPanel() {
  const [classes, setClasses] = useState<ClassesConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await loadClassesConfig();
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        setClasses(null);
        return;
      }
      setClasses(res.value);
      setError(null);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = useMemo(() => {
    if (!classes) return [];
    return Object.entries(classes).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [classes]);

  if (error) return <div className={styles.muted}>Legend load failed: {error}</div>;
  if (!classes) return <div className={styles.muted}>Loading legend…</div>;

  return (
    <div className={styles.legendList}>
      {entries.map(([id, c]) => (
        <div key={id} className={styles.legendItem}>
          <div
            aria-label={`class-${id}`}
            className={styles.swatch}
            style={{ background: c.color }}
          />
          <div className={styles.legendText}>
            <code className={styles.legendId}>{id}</code>
            <span className={styles.legendName}>{c.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

