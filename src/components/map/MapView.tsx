"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { AppConfig } from "@/types/config";
import { loadAppConfig } from "@/lib/config";

const ArcGISMap = dynamic(() => import("./ArcGISMap"), { ssr: false });

export type MapViewProps = {
  naipVisible: boolean;
  predictionVisible: boolean;
  predictionOpacity: number;
};

export default function MapView(props: MapViewProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await loadAppConfig();
      if (cancelled) return;
      if (!res.ok) {
        setConfigError(res.error);
        setConfig(null);
        return;
      }
      setConfig(res.value);
      setConfigError(null);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (configError) {
    return (
      <div style={{ padding: 16, fontSize: 13 }}>Config load failed: {configError}</div>
    );
  }

  if (!config) {
    return <div style={{ padding: 16, fontSize: 13 }}>Loading config…</div>;
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ArcGISMap
        config={config}
        naipVisible={props.naipVisible}
        predictionVisible={props.predictionVisible}
        predictionOpacity={props.predictionOpacity}
      />
    </div>
  );
}

