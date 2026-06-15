export const AppConfig = {
  logging: {
    enabled: false,
  },
  objects: {
    maxCount: 500,
  },
  fps: {
    sampleIntervalMs: 500,
    millisecondsPerSecond: 1000,
  },
} as const;
