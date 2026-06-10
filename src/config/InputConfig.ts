import { CameraConfig } from "../config/CameraConfig";

export enum MouseButton {
  Primary,
  Middle,
  Secondary,
}

export const InputConfig = {
  keyboard: {
    rotationStep: Math.PI / 18,
    zoomStep: CameraConfig.zoom.buttonStep,
  },
  pointer: {
    wheelRotationStep: Math.PI / 36,
    wheelZoomInFactor: CameraConfig.zoom.wheelInFactor,
    wheelZoomOutFactor: CameraConfig.zoom.wheelOutFactor,
  },
  selection: {
    dragThresholdSquared: 16,
  },
} as const;
