import type { SerializedSandboxPrefab } from "../SandboxPrefabs";

export const dominoLinePrefab: SerializedSandboxPrefab = {
  "id": "domino-line",
  "name": "Domino Line",
  "description": "A starter ball and a line of thin blocks for chain-reaction collision testing. [Try picking up the ball and knocking it gently into the dominoes]",
  "objects": [
    {
      "name": "Domino Floor",
      "type": "Platform",
      "offset": {
        "x": 53,
        "y": 31.5
      },
      "metadata": {
        "friction": 0.2,
        "width": 720
      }
    },
    {
      "name": "Starter Ball",
      "type": "Circle",
      "offset": {
        "x": -257,
        "y": -28.5
      },
      "metadata": {
        "mass": 8,
        "width": 56,
        "height": 56
      }
    },
    {
      "name": "Domino 1",
      "type": "Box",
      "offset": {
        "x": -117,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 2",
      "type": "Box",
      "offset": {
        "x": -83,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 3",
      "type": "Box",
      "offset": {
        "x": -49,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 4",
      "type": "Box",
      "offset": {
        "x": -15,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 5",
      "type": "Box",
      "offset": {
        "x": 19,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 6",
      "type": "Box",
      "offset": {
        "x": 53,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 7",
      "type": "Box",
      "offset": {
        "x": 87,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 8",
      "type": "Box",
      "offset": {
        "x": 121,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 9",
      "type": "Box",
      "offset": {
        "x": 155,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 10",
      "type": "Box",
      "offset": {
        "x": 189,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 11",
      "type": "Box",
      "offset": {
        "x": 223,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    },
    {
      "name": "Domino 12",
      "type": "Box",
      "offset": {
        "x": 257,
        "y": -31.5
      },
      "metadata": {
        "mass": 1.2,
        "bounce": 0.2,
        "width": 10,
        "height": 90,
        "color": "#e2d37a",
        "borderColor": "#fff1a8"
      }
    }
  ]
};
