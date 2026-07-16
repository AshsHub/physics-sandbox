export const RendererConfig = {
  culling: {
    screenMargin: 96,
  },
  grid: {
    enabled: true,
    majorGridEnabled: true,
    snapToGrid: false,
    opacity: 1,
    spacing: 40,
    majorLineInterval: 5,
    minScreenSpacing: 18,
    maxScreenSpacing: 84,
  },
  worldBounds: {
    color: "#ff4d4d",
    dash: 28,
    gap: 16,
    lineWidth: 2,
  },
  killerIndicator: {
    alpha: 0.55,
    color: "#ff4d4d",
    stripeAngleRadians: -Math.PI / 4,
    stripeGap: 26,
    stripePadding: 12,
    stripeWidth: 6,
  },
} as const;
