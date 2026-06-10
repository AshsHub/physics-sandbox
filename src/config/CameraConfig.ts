export const CameraConfig = {
  zoom: {
    min: 0.2,
    max: 4,
    sliderStep: 0.01,
    buttonStep: 0.1,
    wheelInFactor: 1.1,
    wheelOutFactor: 0.9,
  },
  fitView: {
    padding: 64,
    maxZoom: 1,
  },
  culling: {
    viewportMargin: 1200,
  },
} as const;
