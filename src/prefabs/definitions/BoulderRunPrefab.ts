import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const boulderRunPrefab: SerializedSandboxPrefab = {
  "id": "custom-prefab",
  "name": "Boulder Run",
  "description": "A low-friction boulder course with ramps, barriers, and a small breakable structure.",
  "objects": [
    {
      "name": "Floor",
      "type": "Platform",
      "offset": {
        "x": 519.1122,
        "y": 273.6025
      },
      "metadata": {
        "width": 500
      }
    },
    {
      "name": "Ramp",
      "type": "Platform",
      "offset": {
        "x": -154.8879,
        "y": 25.6025
      },
      "angle": 0.5236,
      "metadata": {
        "width": 1000
      }
    },
    {
      "name": "Boulder",
      "type": "Circle",
      "offset": {
        "x": -529.4301,
        "y": -273.6025
      },
      "angle": 25.9402,
      "metadata": {
        "mass": 15,
        "friction": 0.003,
        "width": 100,
        "height": 100,
        "color": "#702d00",
        "borderColor": "#000000",
        "collisionRole": 2
      }
    },
    {
      "name": "Mr. Jones",
      "type": "Circle",
      "offset": {
        "x": -143.5461,
        "y": -19.5337
      },
      "angle": 56.9792,
      "metadata": {
        "mass": 20,
        "friction": 0
      }
    },
    {
      "name": "Wall Left",
      "type": "Wall",
      "offset": {
        "x": 373.8354,
        "y": 2.2073
      },
      "metadata": {
        "friction": 1,
        "width": 10,
        "height": 250
      }
    },
    {
      "name": "Wall Right",
      "type": "Wall",
      "offset": {
        "x": 529.4301,
        "y": 23.705
      },
      "metadata": {
        "width": 10,
        "height": 200
      }
    },
    {
      "name": "Door",
      "type": "Box",
      "offset": {
        "x": 386.79,
        "y": 26.333
      },
      "angle": -3.1008,
      "metadata": {
        "width": 7,
        "height": 200,
        "collisionRole": 0
      }
    },
    {
      "name": "Lip",
      "type": "Platform",
      "offset": {
        "x": 377.6549,
        "y": 128.0862
      },
      "metadata": {
        "width": 5,
        "height": 4
      }
    },
    {
      "name": "Roof",
      "type": "Platform",
      "offset": {
        "x": 451.5059,
        "y": -55.639
      },
      "metadata": {
        "width": 100
      }
    },
    {
      "name": "Stick Hor",
      "type": "Box",
      "offset": {
        "x": 457.1727,
        "y": -72.1885
      },
      "angle": -6.2808,
      "metadata": {
        "mass": 1,
        "bounce": 0.1,
        "width": 120,
        "height": 5,
        "collisionRole": 0
      }
    },
    {
      "name": "Wall Stick",
      "type": "Wall",
      "offset": {
        "x": 398.2294,
        "y": 53.9886
      },
      "metadata": {
        "friction": 1,
        "width": 10,
        "height": 200
      }
    },
    {
      "name": "Stick Ver",
      "type": "Box",
      "offset": {
        "x": 520.8666,
        "y": 59.6671
      },
      "angle": -0.0018,
      "metadata": {
        "mass": 1,
        "bounce": 0.1,
        "width": 7,
        "height": 400,
        "collisionRole": 0
      }
    }
  ]
};
