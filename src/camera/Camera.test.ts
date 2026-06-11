import { describe, expect, it, jest } from "@jest/globals";
import { CameraConfig } from "../config/CameraConfig";
import { Vector2 } from "../maths/Vector2";
import { Camera, type CameraChangeHandler } from "./Camera";

describe("Camera", () => {
  it("clamps initial zoom and returns defensive view copies", () => {
    const camera = new Camera({
      offset: new Vector2(10, 20),
      zoom: CameraConfig.zoom.max * 2,
      viewportSize: { width: 800, height: 600 },
    });

    const offset = camera.getOffset();
    const viewportSize = camera.getViewportSize();

    offset.set(0, 0);
    viewportSize.width = 1;

    expect(camera.getZoom()).toBe(CameraConfig.zoom.max);
    expect(camera.getOffset().toObject()).toEqual({ x: 10, y: 20 });
    expect(camera.getViewportSize()).toEqual({ width: 800, height: 600 });
  });

  it("converts screen positions to world positions using offset and zoom", () => {
    const camera = new Camera({
      offset: new Vector2(100, 50),
      zoom: 2,
    });

    expect(camera.screenToWorld({ x: 300, y: 250 }).toObject()).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("keeps the zoom anchor under the cursor when zooming", () => {
    const camera = new Camera({
      offset: Vector2.zero(),
      zoom: 1,
    });
    const screenPosition = { x: 200, y: 100 };
    const before = camera.screenToWorld(screenPosition);

    camera.zoomAt(screenPosition, 2);

    expect(camera.getZoom()).toBe(2);
    expect(camera.screenToWorld(screenPosition).toObject()).toEqual(
      before.toObject(),
    );
  });

  it("fits world bounds into the viewport with padding and max zoom", () => {
    const camera = new Camera({
      viewportSize: { width: 1000, height: 800 },
    });

    camera.fitBounds(
      {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
      },
      100,
      10,
    );

    expect(camera.getZoom()).toBe(CameraConfig.zoom.max);
    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("fits a collection of bounds and resets empty collections", () => {
    const camera = new Camera({
      viewportSize: { width: 400, height: 400 },
      zoom: 2,
    });

    camera.fitBoundsFromCollection(
      [
        {
          min: { x: 0, y: 0 },
          max: { x: 100, y: 50 },
        },
        {
          min: { x: -100, y: -50 },
          max: { x: 0, y: 0 },
        },
      ],
      0,
      5,
    );

    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: 0,
      y: 0,
    });

    camera.fitBoundsFromCollection([]);

    expect(camera.getOffset().toObject()).toEqual({ x: 0, y: 0 });
    expect(camera.getZoom()).toBe(CameraConfig.zoom.initial);
  });

  it("emits view changes when the camera changes", () => {
    const onChange: CameraChangeHandler = jest.fn();
    const camera = new Camera(undefined, onChange);

    camera.pan({ x: 1, y: 2 });

    expect(onChange).toHaveBeenCalledWith({
      offset: new Vector2(1, 2),
      zoom: CameraConfig.zoom.initial,
      viewportSize: { width: 0, height: 0 },
    });
  });
});
