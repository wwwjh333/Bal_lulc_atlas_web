"use client";

import { useEffect, useRef, useState } from "react";

import type { AppConfig } from "@/types/config";
import { hasUsableLayerUrl } from "@/lib/config";
import {
  buildImageryLayerOptions,
  isMapServerUrl,
  loadArcGisModules,
} from "@/lib/arcgis";

export type ArcGISMapProps = {
  config: AppConfig;
  naipVisible: boolean;
  predictionVisible: boolean;
  predictionOpacity: number;
};

export default function ArcGISMap(props: ArcGISMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const viewRef = useRef<import("@arcgis/core/views/MapView").default | null>(null);
  const naipLayerRef = useRef<import("@arcgis/core/layers/Layer").default | null>(null);
  const predLayerRef = useRef<import("@arcgis/core/layers/Layer").default | null>(null);

  const centerLng = props.config.map.center[0];
  const centerLat = props.config.map.center[1];
  const zoom = props.config.map.zoom;
  const naipUrl = props.config.layers.naipUrl;
  const predictionUrl = props.config.layers.predictionUrl;

  useEffect(() => {
    let disposed = false;

    async function start() {
      try {
        const m = await loadArcGisModules();
        if (disposed) return;

        const { setLocale } = await import("@arcgis/core/intl");
        // 覆盖 <html lang="zh-CN">：否则 MapView 默认 UI（Zoom 等）会按中文拉取 t9n，易报 widget-intl:locale-error。
        setLocale("en");

        // Use ArcGIS CDN assets to keep deployment artifact small and reduce build memory.
        // Must match the major/minor version your app targets.
        // 注意：必须是 @arcgis/core 对应版本的 assets 路径，否则会导致 widget t9n/worker 等资源 404。
        m.EsriConfig.assetsPath = "https://js.arcgis.com/5.0.16/@arcgis/core/assets";

        // `topo-vector` 走 basemap styles 服务，在部分环境可能需要 API key/配额，改用 OSM 更稳。
        const map = new m.Map({ basemap: "osm" });

        async function addLayer(opts: {
          url: string;
          title: string;
          visible: boolean;
          opacity: number;
        }) {
          if (isMapServerUrl(opts.url)) {
            const layer = new m.TileLayer({
              url: opts.url,
              title: opts.title,
              visible: opts.visible,
              opacity: opts.opacity,
            });
            map.add(layer);
            await layer.load();
            return layer;
          }

          const tile = new m.ImageryTileLayer(
            buildImageryLayerOptions(opts),
          );
          map.add(tile);
          try {
            await tile.load();
            return tile;
          } catch {
            map.remove(tile);
            tile.destroy();
            const dyn = new m.ImageryLayer(
              buildImageryLayerOptions(opts),
            );
            map.add(dyn);
            await dyn.load();
            return dyn;
          }
        }

        if (hasUsableLayerUrl(naipUrl)) {
          naipLayerRef.current = await addLayer({
            url: naipUrl,
            title: "NAIP",
            visible: props.naipVisible,
            opacity: 1,
          });
        } else {
          naipLayerRef.current = null;
        }

        if (hasUsableLayerUrl(predictionUrl)) {
          predLayerRef.current = await addLayer({
            url: predictionUrl,
            title: "Prediction",
            visible: props.predictionVisible,
            opacity: props.predictionOpacity,
          });
        } else {
          predLayerRef.current = null;
        }

        if (!containerRef.current) {
          throw new Error("Map container is not ready");
        }

        const view = new m.MapView({
          map,
          container: containerRef.current,
          center: [centerLng, centerLat],
          zoom,
          constraints: { rotationEnabled: false },
        });

        await view.when();
        if (disposed) return;

        // Keep default Esri UI (including attribution). Avoid setting ui.components
        // because some Next/Turbopack HMR cycles can yield non-Node UI handles.

        setError(undefined);
        viewRef.current = view;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!disposed) {
          setError(msg);
        }
      }
    }

    start();

    return () => {
      disposed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
      naipLayerRef.current?.destroy();
      naipLayerRef.current = null;
      predLayerRef.current?.destroy();
      predLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLng, centerLat, zoom, naipUrl, predictionUrl]);

  useEffect(() => {
    if (naipLayerRef.current) {
      naipLayerRef.current.visible = props.naipVisible;
    }
    if (predLayerRef.current) {
      predLayerRef.current.visible = props.predictionVisible;
      (predLayerRef.current as { opacity?: number }).opacity = props.predictionOpacity;
    }
  }, [props.naipVisible, props.predictionVisible, props.predictionOpacity]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      {error ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            right: 12,
            padding: 10,
            borderRadius: 10,
            background: "rgba(180, 0, 0, 0.85)",
            color: "white",
            fontSize: 12,
          }}
        >
          Map load failed: {error}
        </div>
      ) : null}
    </div>
  );
}
