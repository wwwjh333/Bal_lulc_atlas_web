export type ArcGisModules = {
  EsriConfig: typeof import("@arcgis/core/config").default;
  Map: typeof import("@arcgis/core/Map").default;
  MapView: typeof import("@arcgis/core/views/MapView").default;
  ImageryLayer: typeof import("@arcgis/core/layers/ImageryLayer").default;
  ImageryTileLayer: typeof import("@arcgis/core/layers/ImageryTileLayer").default;
  TileLayer: typeof import("@arcgis/core/layers/TileLayer").default;
};

let cached: Promise<ArcGisModules> | null = null;

export function loadArcGisModules(): Promise<ArcGisModules> {
  if (!cached) {
    cached = Promise.all([
      import("@arcgis/core/config"),
      import("@arcgis/core/Map"),
      import("@arcgis/core/views/MapView"),
      import("@arcgis/core/layers/ImageryLayer"),
      import("@arcgis/core/layers/ImageryTileLayer"),
      import("@arcgis/core/layers/TileLayer"),
    ]).then(([EsriConfig, Map, MapView, ImageryLayer, ImageryTileLayer, TileLayer]) => ({
      EsriConfig: EsriConfig.default,
      Map: Map.default,
      MapView: MapView.default,
      ImageryLayer: ImageryLayer.default,
      ImageryTileLayer: ImageryTileLayer.default,
      TileLayer: TileLayer.default,
    }));
  }
  return cached;
}

export type ImageryLayerKind = "tile" | "dynamic";

export function buildImageryLayerOptions(opts: {
  url: string;
  title: string;
  opacity?: number;
  visible?: boolean;
}) {
  return {
    url: opts.url,
    title: opts.title,
    opacity: opts.opacity,
    visible: opts.visible ?? true,
  };
}

export function isMapServerUrl(url: string): boolean {
  return /\/MapServer\/?$/i.test(url.trim());
}

