import type { AppConfig, ClassesConfig } from "@/types/config";

export type ConfigLoadResult<T> =
  | { ok: true; value: T; warnings: string[] }
  | { ok: false; error: string };

const DEFAULT_CONFIG: AppConfig = {
  map: { center: [-76.6122, 39.2904], zoom: 11 },
  layers: { naipUrl: "", predictionUrl: "" },
  prediction: { opacity: 0.55 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function sanitizeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function hasUsableImageryUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u === "YOUR_NAIP_IMAGERY_LAYER_URL") return false;
  if (u === "YOUR_PREDICTION_IMAGERY_LAYER_URL") return false;
  return true;
}

// Backward-compatible alias: these URLs may be MapServer or ImageServer.
export const hasUsableLayerUrl = hasUsableImageryUrl;

export async function loadAppConfig(
  path = "/config/app-config.json",
): Promise<ConfigLoadResult<AppConfig>> {
  try {
    const url =
      process.env.NODE_ENV === "development" ? `${path}?v=${Date.now()}` : path;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        error: `Unable to read config: ${path} (HTTP ${res.status})`,
      };
    }

    const raw: unknown = await res.json();
    const warnings: string[] = [];

    if (!isRecord(raw)) {
      return { ok: false, error: `Invalid config JSON: ${path} is not an object` };
    }

    const mapRaw = isRecord(raw.map) ? raw.map : {};
    const layersRaw = isRecord(raw.layers) ? raw.layers : {};
    const predRaw = isRecord(raw.prediction) ? raw.prediction : {};

    const centerRaw = mapRaw.center;
    let center: [number, number] = DEFAULT_CONFIG.map.center;
    if (Array.isArray(centerRaw) && centerRaw.length === 2) {
      const lng = Number(centerRaw[0]);
      const lat = Number(centerRaw[1]);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        center = [lng, lat];
      } else {
        warnings.push("map.center 不是有效的 [lng, lat]，已回退默认值");
      }
    } else if (centerRaw !== undefined) {
      warnings.push("map.center 格式不正确，已回退默认值");
    }

    const zoomRaw = Number(mapRaw.zoom);
    const zoom = Number.isFinite(zoomRaw) ? zoomRaw : DEFAULT_CONFIG.map.zoom;

    const naipUrl = sanitizeUrl(layersRaw.naipUrl);
    const predictionUrl = sanitizeUrl(layersRaw.predictionUrl);

    const opacityRaw = Number(predRaw.opacity);
    const opacity = clamp01(
      Number.isFinite(opacityRaw) ? opacityRaw : DEFAULT_CONFIG.prediction.opacity,
    );

    return {
      ok: true,
      value: {
        map: { center, zoom },
        layers: { naipUrl, predictionUrl },
        prediction: { opacity },
      },
      warnings,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Config load failed: ${message}` };
  }
}

export async function loadClassesConfig(
  path = "/config/classes.json",
): Promise<ConfigLoadResult<ClassesConfig>> {
  try {
    const url =
      process.env.NODE_ENV === "development" ? `${path}?v=${Date.now()}` : path;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        error: `Unable to read classes: ${path} (HTTP ${res.status})`,
      };
    }
    const raw: unknown = await res.json();
    if (!isRecord(raw)) {
      return { ok: false, error: `Invalid classes JSON: ${path} is not an object` };
    }

    const warnings: string[] = [];
    const value: ClassesConfig = {};

    for (const [k, v] of Object.entries(raw)) {
      if (!isRecord(v)) {
        warnings.push(`classes[${k}] 不是对象，已跳过`);
        continue;
      }
      const name = typeof v.name === "string" ? v.name : "";
      const color = typeof v.color === "string" ? v.color : "";
      if (!name || !color) {
        warnings.push(`classes[${k}] 缺少 name/color，已跳过`);
        continue;
      }
      value[k] = { name, color };
    }

    return { ok: true, value, warnings };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Classes load failed: ${message}` };
  }
}

