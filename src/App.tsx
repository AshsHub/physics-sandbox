import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { Vector2 } from "./maths/Vector2";
import { useEditorStore } from "./store/editorStore";
import { CanvasContextMenu } from "./ui/context/CanvasContextMenu";
import { ObjectContextMenu } from "./ui/context/ObjectContextMenu";
import { Sidebar } from "./ui/sidebar/Sidebar";
import { StatusBar } from "./ui/StatusBar";
import { TooltipLayer } from "./ui/TooltipLayer";
import { Toolbar } from "./ui/Toolbar";
import { ZoomControl } from "./ui/ZoomControl";

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
  const staticObjectCount = useEditorStore((s) => s.staticObjectCount);
  const dynamicObjectCount = useEditorStore((s) => s.dynamicObjectCount);

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
    app.fitView();
  }, [app]);

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
          staticObjectCount={staticObjectCount}
          dynamicObjectCount={dynamicObjectCount}
          selectedCount={selectedCount}
        />
      </header>

      <div className="workspace">
        <Sidebar app={app} onObjectContextMenu={openObjectContextMenu} />

        <main className="viewport">
          <Toolbar />
          <ZoomControl app={app} />
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
