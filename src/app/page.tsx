"use client";

import styles from "./page.module.css";
import MapView from "@/components/map/MapView";
import LayerPanel from "@/components/panels/LayerPanel";
import LegendPanel from "@/components/panels/LegendPanel";
import { useEffect, useState } from "react";
import { loadAppConfig } from "@/lib/config";

export default function Home() {
  const [naipVisible, setNaipVisible] = useState(true);
  const [predictionVisible, setPredictionVisible] = useState(true);
  const [predictionOpacity, setPredictionOpacity] = useState(0.55);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await loadAppConfig();
      if (cancelled) return;
      if (res.ok) {
        setPredictionOpacity(res.value.prediction.opacity);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.title}>Baltimore Web Map Demo</div>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Layers</div>
            <LayerPanel
              naipVisible={naipVisible}
              predictionVisible={predictionVisible}
              predictionOpacity={predictionOpacity}
              onNaipVisibleChange={setNaipVisible}
              onPredictionVisibleChange={setPredictionVisible}
              onPredictionOpacityChange={setPredictionOpacity}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Legend</div>
            <LegendPanel />
          </div>
        </div>
      </aside>

      <main className={styles.mapArea}>
        <MapView
          naipVisible={naipVisible}
          predictionVisible={predictionVisible}
          predictionOpacity={predictionOpacity}
        />
      </main>
    </div>
  );
}
