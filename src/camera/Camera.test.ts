import { describe, expect, it, jest } from "@jest/globals";
import { CameraConfig } from "../config/CameraConfig";
import { SandboxWorldConfig } from "../config/SandboxWorldConfig";
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
        min: { x: 0, y: 0 },
        max: { x: 100, y: 100 },
      },
      {
        maxZoom: 10,
        padding: 100,
      },
    );

    expect(camera.getZoom()).toBe(CameraConfig.zoom.max);
    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("fits a bounds collection and resets empty collections", () => {
    const camera = new Camera({
      viewportSize: { width: 400, height: 400 },
      zoom: 2,
    });

    camera.fitBounds(
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
      {
        maxZoom: 5,
        padding: 0,
      },
    );

    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: 0,
      y: 0,
    });

    camera.fitBounds([]);

    expect(camera.getOffset().toObject()).toEqual({ x: 0, y: 0 });
    expect(camera.getZoom()).toBe(CameraConfig.zoom.initial);
  });

  it("does not fit bounds when they are already visible at the current zoom", () => {
    const camera = new Camera({
      viewportSize: { width: 1000, height: 800 },
      zoom: 2,
    });

    camera.fitBounds(
      {
        min: { x: -100, y: -100 },
        max: { x: 100, y: 100 },
      },
      {
        maxZoom: 2,
        onlyIfLargerThanViewport: true,
        padding: 100,
      },
    );

    expect(camera.getZoom()).toBe(2);
    expect(camera.getOffset().toObject()).toEqual({ x: 0, y: 0 });
  });

  it("zooms out to fit bounds when they exceed the viewport", () => {
    const camera = new Camera({
      viewportSize: { width: 1000, height: 800 },
      zoom: 2,
    });

    camera.fitBounds(
      {
        min: { x: -1000, y: -100 },
        max: { x: 1000, y: 100 },
      },
      {
        maxZoom: 2,
        onlyIfLargerThanViewport: true,
        padding: 100,
      },
    );

    expect(camera.getZoom()).toBeLessThan(2);
    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("can zoom out far enough to fit very large scenes", () => {
    const camera = new Camera({
      viewportSize: { width: 1000, height: 800 },
      zoom: 1,
    });

    camera.fitBounds(
      {
        min: { x: -5000, y: -3500 },
        max: { x: 5000, y: 3500 },
      },
      {
        padding: 120,
      },
    );

    const viewportBounds = camera.getViewportBounds();

    expect(viewportBounds.left).toBeLessThanOrEqual(-5000);
    expect(viewportBounds.right).toBeGreaterThanOrEqual(5000);
    expect(viewportBounds.top).toBeLessThanOrEqual(-3500);
    expect(viewportBounds.bottom).toBeGreaterThanOrEqual(3500);
  });

  it("keeps fit defaults when optional values are explicitly undefined", () => {
    const camera = new Camera({
      viewportSize: { width: 1000, height: 800 },
      zoom: 1.5,
    });

    camera.fitBounds(
      {
        min: { x: -2500, y: -500 },
        max: { x: 2500, y: 500 },
      },
      {
        maxZoom: 1.5,
        onlyIfLargerThanViewport: true,
        padding: undefined,
      },
    );

    expect(camera.getZoom()).toBeLessThan(1.5);
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

  it("constrains the viewport center to the configured world bounds", () => {
    const camera = new Camera({
      viewportSize: { width: 800, height: 600 },
    });

    camera.pan({ x: -100000, y: -100000 });

    expect(camera.getViewportCenterPosition().toObject()).toEqual({
      x: SandboxWorldConfig.bounds.max.x,
      y: SandboxWorldConfig.bounds.max.y,
    });
  });
});
