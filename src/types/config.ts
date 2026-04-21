export type LngLat = [number, number];

export type ClassesConfig = Record<
  string,
  {
    name: string;
    color: string;
  }
>;

export type AppConfig = {
  map: {
    center: LngLat;
    zoom: number;
  };
  layers: {
    naipUrl: string;
    predictionUrl: string;
  };
  prediction: {
    opacity: number;
  };
};

