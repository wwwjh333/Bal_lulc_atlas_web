## Baltimore Web Map Demo

A minimal research-demo map viewer for Baltimore built with **Next.js (App Router) + TypeScript + ArcGIS Maps SDK for JavaScript**.

It loads **NAIP** and **Prediction** rasters from **ArcGIS imagery service URLs** (no local TIFF parsing in the browser).

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Configure imagery service URLs

Edit `public/config/app-config.json`:

- `layers.naipUrl`: NAIP imagery service URL
- `layers.predictionUrl`: prediction imagery service URL

Example:

```json
{
  "map": { "center": [-76.6122, 39.2904], "zoom": 11 },
  "layers": {
    "naipUrl": "https://.../ImageServer",
    "predictionUrl": "https://.../ImageServer"
  },
  "prediction": { "opacity": 0.55 },
  "ui": { "swipeEnabled": true }
}
```

## Legend classes

Edit `public/config/classes.json` to control the legend labels and colors.

## Notes

- The app will show a map even if URLs are empty, but layers will not load.
- If an imagery service does not support tiled access, the app will automatically fall back from `ImageryTileLayer` to `ImageryLayer`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Troubleshooting (quick)

- **Blank/failed layer**: verify the URL is reachable from the browser and points to an imagery service (commonly ends with `/ImageServer`).
- **Auth required**: if the service needs login/token, you must handle authentication (not included in this demo).
- **CORS**: the imagery service must allow requests from your origin, or be proxied.
