export const CameraConfig = {
  zoom: {
    min: 0.2,
    max: 4,
    initial: 1.5,
    sliderStep: 0.01,
    buttonStep: 0.1,
    displayPercentScale: 100,
    wheelInFactor: 1.1,
    wheelOutFactor: 0.9,
  },
  fitView: {
    padding: 120,
    maxZoom: 1,
  },
} as const;
