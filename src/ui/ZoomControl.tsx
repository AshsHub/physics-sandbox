import type { IApplication } from "../application/IApplication";
import { CameraConfig } from "../config/CameraConfig";
import { useEditorStore } from "../store/editorStore";
import { AppButton } from "./common/AppButton";
import { AppIcon } from "./icons/AppIcon";

export interface ZoomControlProps {
  app: IApplication;
}

export function ZoomControl({ app }: ZoomControlProps) {
  const cameraZoom = useEditorStore((s) => s.cameraZoom);
  const canZoomOut = cameraZoom > CameraConfig.zoom.min;
  const canZoomIn = cameraZoom < CameraConfig.zoom.max;
  const setZoom = (nextZoom: number) => {
    app.camera.setZoomAtViewportCenter(nextZoom);
  };

  return (
    <div className="zoom-control" aria-label="Zoom controls" role="group">
      <AppButton
        className="zoom-fit-button"
        data-tooltip="Fit objects to view (F)"
        data-tooltip-position="top"
        onClick={() => app.fitView()}
        type="button"
        variant="subtle"
      >
        <AppIcon name="fit-view" />
        <span>Fit View</span>
      </AppButton>
      <span className="zoom-control-label">
        <span className="zoom-control-label-text">Zoom</span>
        <span className="zoom-control-label-value">
          {Math.round(cameraZoom * CameraConfig.zoom.displayPercentScale)}%
        </span>
      </span>
      <AppButton
        aria-label="Zoom out"
        className="zoom-step-button"
        data-tooltip="Zoom out (-)"
        data-tooltip-position="top"
        disabled={!canZoomOut}
        onClick={() => setZoom(cameraZoom - CameraConfig.zoom.buttonStep)}
        type="button"
        variant="icon"
      >
        <AppIcon name="minus" />
      </AppButton>
      <input
        aria-label="Zoom"
        className="app-range zoom-control-slider"
        max={CameraConfig.zoom.max}
        min={CameraConfig.zoom.min}
        onChange={(event) => setZoom(Number(event.currentTarget.value))}
        step={CameraConfig.zoom.sliderStep}
        type="range"
        value={cameraZoom}
      />
      <AppButton
        aria-label="Zoom in"
        className="zoom-step-button"
        data-tooltip="Zoom in (+)"
        data-tooltip-position="top"
        disabled={!canZoomIn}
        onClick={() => setZoom(cameraZoom + CameraConfig.zoom.buttonStep)}
        type="button"
        variant="icon"
      >
        <AppIcon name="plus" />
      </AppButton>
    </div>
  );
}
