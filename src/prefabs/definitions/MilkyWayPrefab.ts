import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const milkyWayPrefab: SerializedSandboxPrefab = {
  "id": "milky-way",
  "name": "Milky Way",
  "description": "A solar-system layout with the Sun at the center, eight major planets, and selected moons. [Best used with gravity reduced or disabled in the simulation panel.]",
  "objects": [
    {
      "name": "Sun",
      "type": "Circle",
      "offset": {
        "x": -342.375,
        "y": -8.25
      },
      "flags": 4,
      "metadata": {
        "mass": 30,
        "radialForceMode": "Pull",
        "radialForceRadius": 351,
        "radialForceStrength": 0.00945,
        "width": 172.8,
        "height": 172.8,
        "color": "#f6c453",
        "borderColor": "#fff0a8",
        "label": "Sun",
        "description": "Sun gravity source",
        "collisionRole": 2
      }
    },
    {
      "name": "Mercury",
      "type": "Circle",
      "offset": {
        "x": 169.125,
        "y": -140.25
      },
      "flags": 4,
      "metadata": {
        "mass": 3,
        "radialForceMode": "Pull",
        "radialForceRadius": 128.25,
        "radialForceStrength": 0.001238,
        "width": 54,
        "height": 54,
        "color": "#8a8178",
        "borderColor": "#c6beb4",
        "label": "Mercury",
        "description": "Mercury gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Venus",
      "type": "Circle",
      "offset": {
        "x": 400.125,
        "y": 255.75
      },
      "flags": 4,
      "metadata": {
        "mass": 6,
        "radialForceMode": "Pull",
        "radialForceRadius": 162,
        "radialForceStrength": 0.001912,
        "width": 79.2,
        "height": 79.2,
        "color": "#c9974d",
        "borderColor": "#f0d29b",
        "label": "Venus",
        "description": "Venus gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Earth",
      "type": "Circle",
      "offset": {
        "x": 622.875,
        "y": -354.75
      },
      "flags": 4,
      "metadata": {
        "mass": 6,
        "radialForceMode": "Pull",
        "radialForceRadius": 175.5,
        "radialForceStrength": 0.002138,
        "width": 82.8,
        "height": 82.8,
        "color": "#2f74c0",
        "borderColor": "#7ac88f",
        "label": "Earth",
        "description": "Earth gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Moon",
      "type": "Circle",
      "offset": {
        "x": 746.625,
        "y": -445.5
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 81,
        "radialForceStrength": 0.000405,
        "width": 28.8,
        "height": 28.8,
        "color": "#b8b6ad",
        "borderColor": "#e2dfd5",
        "label": "Moon",
        "description": "Moon moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Mars",
      "type": "Circle",
      "offset": {
        "x": 845.625,
        "y": 396
      },
      "flags": 4,
      "metadata": {
        "mass": 4,
        "radialForceMode": "Pull",
        "radialForceRadius": 148.5,
        "radialForceStrength": 0.001575,
        "width": 68.4,
        "height": 68.4,
        "color": "#b65336",
        "borderColor": "#f0a07c",
        "label": "Mars",
        "description": "Mars gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Phobos",
      "type": "Circle",
      "offset": {
        "x": 928.125,
        "y": 338.25
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 60.75,
        "radialForceStrength": 0.000225,
        "width": 19.2,
        "height": 19.2,
        "color": "#8b7666",
        "borderColor": "#c4aa94",
        "label": "Phobos",
        "description": "Phobos moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Deimos",
      "type": "Circle",
      "offset": {
        "x": 771.375,
        "y": 478.5
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 54,
        "radialForceStrength": 0.00018,
        "width": 16,
        "height": 16,
        "color": "#9a8472",
        "borderColor": "#c9b09a",
        "label": "Deimos",
        "description": "Deimos moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Jupiter",
      "type": "Circle",
      "offset": {
        "x": -1744.875,
        "y": -396
      },
      "flags": 4,
      "metadata": {
        "mass": 18,
        "radialForceMode": "Pull",
        "radialForceRadius": 283.5,
        "radialForceStrength": 0.00585,
        "width": 187.2,
        "height": 187.2,
        "color": "#c89b6f",
        "borderColor": "#f2d0ad",
        "label": "Jupiter",
        "description": "Jupiter gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Io",
      "type": "Circle",
      "offset": {
        "x": -1563.375,
        "y": -503.25
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 87.75,
        "radialForceStrength": 0.00045,
        "width": 28.8,
        "height": 28.8,
        "color": "#d9bd57",
        "borderColor": "#ffe78c",
        "label": "Io",
        "description": "Io moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Europa",
      "type": "Circle",
      "offset": {
        "x": -1546.875,
        "y": -297
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 87.75,
        "radialForceStrength": 0.00045,
        "width": 27.2,
        "height": 27.2,
        "color": "#c9c1a8",
        "borderColor": "#f1ead4",
        "label": "Europa",
        "description": "Europa moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Ganymede",
      "type": "Circle",
      "offset": {
        "x": -1942.875,
        "y": -511.5
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 101.25,
        "radialForceStrength": 0.00054,
        "width": 35.2,
        "height": 35.2,
        "color": "#9c8d7a",
        "borderColor": "#d6c9b7",
        "label": "Ganymede",
        "description": "Ganymede moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Callisto",
      "type": "Circle",
      "offset": {
        "x": -1975.875,
        "y": -272.25
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 101.25,
        "radialForceStrength": 0.000495,
        "width": 33.6,
        "height": 33.6,
        "color": "#796f66",
        "borderColor": "#b8aca0",
        "label": "Callisto",
        "description": "Callisto moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Saturn",
      "type": "Circle",
      "offset": {
        "x": -2107.875,
        "y": 412.5
      },
      "flags": 4,
      "metadata": {
        "mass": 15,
        "radialForceMode": "Pull",
        "radialForceRadius": 263.25,
        "radialForceStrength": 0.00495,
        "width": 165.6,
        "height": 165.6,
        "color": "#d8c27a",
        "borderColor": "#f4e5ad",
        "label": "Saturn",
        "description": "Saturn gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Titan",
      "type": "Circle",
      "offset": {
        "x": -1893.375,
        "y": 511.5
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 108,
        "radialForceStrength": 0.000563,
        "width": 38.4,
        "height": 38.4,
        "color": "#c28f45",
        "borderColor": "#f0c57e",
        "label": "Titan",
        "description": "Titan moon gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Uranus",
      "type": "Circle",
      "offset": {
        "x": 1571.625,
        "y": -74.25
      },
      "flags": 4,
      "metadata": {
        "mass": 10,
        "radialForceMode": "Pull",
        "radialForceRadius": 202.5,
        "radialForceStrength": 0.003262,
        "width": 111.6,
        "height": 111.6,
        "color": "#7fd1d8",
        "borderColor": "#c9f8fb",
        "label": "Uranus",
        "description": "Uranus gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Neptune",
      "type": "Circle",
      "offset": {
        "x": 1951.125,
        "y": 371.25
      },
      "flags": 4,
      "metadata": {
        "mass": 10,
        "radialForceMode": "Pull",
        "radialForceRadius": 202.5,
        "radialForceStrength": 0.003375,
        "width": 108,
        "height": 108,
        "color": "#365dc7",
        "borderColor": "#9db5ff",
        "label": "Neptune",
        "description": "Neptune gravity source",
        "collisionRole": 0
      }
    },
    {
      "name": "Triton",
      "type": "Circle",
      "offset": {
        "x": 2107.875,
        "y": 280.5
      },
      "flags": 4,
      "metadata": {
        "mass": 1,
        "radialForceMode": "Pull",
        "radialForceRadius": 87.75,
        "radialForceStrength": 0.00045,
        "width": 28.8,
        "height": 28.8,
        "color": "#b9c8d8",
        "borderColor": "#e3edf7",
        "label": "Triton",
        "description": "Triton moon gravity source",
        "collisionRole": 0
      }
    }
  ]
};
