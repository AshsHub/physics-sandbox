import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { Vector2 } from "./maths/Vector2";
import { SandboxObjectFlags } from "./sandbox/SandboxObjectType";
import { useEditorStore } from "./store/editorStore";
import { CanvasContextMenu } from "./ui/context/CanvasContextMenu";
import { ObjectContextMenu } from "./ui/context/ObjectContextMenu";
import { Sidebar } from "./ui/sidebar/Sidebar";
import { StatusBar } from "./ui/StatusBar";
import { TooltipLayer } from "./ui/TooltipLayer";
import { Toolbar } from "./ui/Toolbar";

export default function App() {
  const [app] = useState(() => new Application());
  const [fps, setFps] = useState(0);
  const [contextMenu, setContextMenu] = useState<
    | {
        type: "object";
        objectId: string;
        position: Vector2;
        targetIds: string[];
      }
    | {
        type: "canvas";
        position: Vector2;
        worldPosition: Vector2;
      }
  >();
  const hasCenteredInitialScene = useRef(false);

  useEffect(() => {
    app.init();

    return () => {
      app.destroy();
    };
  }, [app]);

  useEffect(() => {
    let frameId = 0;
    let frameCount = 0;
    let lastSampleTime = performance.now();

    const updateFps = (time: number) => {
      frameCount++;

      const elapsed = time - lastSampleTime;

      if (elapsed >= 500) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastSampleTime = time;
      }

      frameId = requestAnimationFrame(updateFps);
    };

    frameId = requestAnimationFrame(updateFps);

    return () => cancelAnimationFrame(frameId);
  }, []);

  const selectedCount = useEditorStore((s) => s.selectedIds.size);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objectRevision = useEditorStore((s) => s.objectRevision);
  const viewportSize = useEditorStore((s) => s.viewportSize);
  const state = useEditorStore.getState();

  const openObjectContextMenu = useCallback(
    (objectId: string, position: { x: number; y: number }) => {
      setContextMenu({
        type: "object",
        objectId,
        position: new Vector2(position),
        targetIds:
          selectedIds.has(objectId) && selectedIds.size > 1
            ? Array.from(selectedIds)
            : [objectId],
      });
    },
    [selectedIds],
  );

  const openCanvasContextMenu = useCallback(
    (position: { x: number; y: number }, worldPosition: Vector2) => {
      setContextMenu({
        type: "canvas",
        position: new Vector2(position),
        worldPosition: worldPosition.clone(),
      });
    },
    [],
  );

  const fitView = useCallback(() => {
    const objects = app.engine
      .getAllObjects()
      .filter((object) => (object.flags & SandboxObjectFlags.Hidden) === 0);

    if (
      objects.length === 0 ||
      viewportSize.width <= 0 ||
      viewportSize.height <= 0
    ) {
      app.camera.setView({ x: 0, y: 0 }, 1);
      return;
    }

    const sceneBounds = objects.reduce(
      (bounds, object) => ({
        minX: Math.min(bounds.minX, object.body.bounds.min.x),
        maxX: Math.max(bounds.maxX, object.body.bounds.max.x),
        minY: Math.min(bounds.minY, object.body.bounds.min.y),
        maxY: Math.max(bounds.maxY, object.body.bounds.max.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    app.camera.fitBounds(sceneBounds, 64, 1);
  }, [app, viewportSize]);

  useEffect(() => {
    if (
      hasCenteredInitialScene.current ||
      viewportSize.width <= 0 ||
      viewportSize.height <= 0 ||
      app.engine.getAllObjects().length === 0
    ) {
      return;
    }

    fitView();
    hasCenteredInitialScene.current = true;
  }, [app, fitView, objectRevision, viewportSize.height, viewportSize.width]);

  return (
    <div className="app">
      <header className="headerbar">
        <h1 className="headerbar-title">Physics Sandbox</h1>

        <StatusBar
          fps={fps}
          staticObjectCount={state.dynamicObjectCount}
          dynamicObjectCount={state.staticObjectCount}
          selectedCount={selectedCount}
        />
      </header>

      <div className="workspace">
        <Sidebar app={app} onObjectContextMenu={openObjectContextMenu} />

        <main className="viewport">
          <Toolbar onFitView={fitView} />
          <CanvasView
            app={app}
            onCanvasContextMenu={openCanvasContextMenu}
            onObjectContextMenu={openObjectContextMenu}
          />
        </main>
      </div>

      {contextMenu?.type === "object" && (
        <ObjectContextMenu
          app={app}
          key={`${contextMenu.objectId}:${contextMenu.position.x}:${contextMenu.position.y}`}
          objectId={contextMenu.objectId}
          position={contextMenu.position}
          targetIds={contextMenu.targetIds}
          onClose={() => setContextMenu(undefined)}
        />
      )}

      {contextMenu?.type === "canvas" && (
        <CanvasContextMenu
          app={app}
          key={`canvas:${contextMenu.position.x}:${contextMenu.position.y}`}
          position={contextMenu.position}
          worldPosition={contextMenu.worldPosition}
          onClose={() => setContextMenu(undefined)}
        />
      )}

      <TooltipLayer />
    </div>
  );
}
