export const SimulationConfig = {
  wind: {
    minForce: -0.001,
    maxForce: 0.001,
    step: 0.00001,
    defaultWindForce: 0,
    offStrengthPercent: 0,
    percentScale: 100,
    strengthPercentDecimalPlaces: 1,
    strengthLabels: [
      {
        maxPercent: 20,
        label: "Light Breeze",
      },
      {
        maxPercent: 45,
        label: "Mild Wind",
      },
      {
        maxPercent: 70,
        label: "Gusty Wind",
      },
      {
        maxPercent: 90,
        label: "Strong Wind",
      },
      {
        maxPercent: Number.POSITIVE_INFINITY,
        label: "Storm Force",
      },
    ],
  },
  gravity: {
    sliderStep: 1,
  },
  display: {
    gravityDecimalPlaces: 2,
    windDecimalPlaces: 1,
  },
} as const;
