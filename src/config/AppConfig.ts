export const AppConfig = {
  logging: {
    enabled: false,
  },
  objects: {
    maxCount: 500,
  },
  portfolio: {
    copyrightOwner: "Ashley Cook",
    copyrightYear: 2026,
  },
  fps: {
    sampleIntervalMs: 500,
    millisecondsPerSecond: 1000,
  },
} as const;
