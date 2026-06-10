import { MAX_CAMERA_ZOOM, MIN_CAMERA_ZOOM } from "../camera/Camera";
import type { IApplication } from "../application/IApplication";
import { useEditorStore } from "../store/editorStore";

export interface ZoomControlProps {
  app: IApplication;
}

const ZOOM_STEP = 0.1;

export function ZoomControl({ app }: ZoomControlProps) {
  const cameraZoom = useEditorStore((s) => s.cameraZoom);
  const setZoom = (nextZoom: number) => {
    app.camera.setZoomAtViewportCenter(nextZoom);
  };

  return (
    <div className="zoom-control" aria-label="Zoom controls">
      <button
        className="zoom-fit-button"
        data-tooltip="Fit objects to view (F)"
        data-tooltip-position="top"
        onClick={() => app.fitView()}
        type="button"
      >
        Fit View
      </button>
      <span className="zoom-control-label">
        {Math.round(cameraZoom * 100)}%
      </span>
      <button
        aria-label="Zoom out"
        className="zoom-step-button"
        data-tooltip="Zoom out (-)"
        data-tooltip-position="top"
        onClick={() => setZoom(cameraZoom - ZOOM_STEP)}
        type="button"
      >
        -
      </button>
      <input
        aria-label="Zoom"
        className="zoom-control-slider"
        max={MAX_CAMERA_ZOOM}
        min={MIN_CAMERA_ZOOM}
        onChange={(event) => setZoom(Number(event.currentTarget.value))}
        step={0.01}
        type="range"
        value={cameraZoom}
      />
      <button
        aria-label="Zoom in"
        className="zoom-step-button"
        data-tooltip="Zoom in (+)"
        data-tooltip-position="top"
        onClick={() => setZoom(cameraZoom + ZOOM_STEP)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
