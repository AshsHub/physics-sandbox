import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { Vector2 } from "./maths/Vector2";
import { SandboxObjectFlags } from "./sandbox/SandboxObjectType";
import { useEditorStore } from "./store/editorStore";
import { ObjectContextMenu } from "./ui/context/ObjectContextMenu";
import { Sidebar } from "./ui/sidebar/Sidebar";
import { StatusBar } from "./ui/StatusBar";
import { Toolbar } from "./ui/Toolbar";

export default function App() {
  const [app] = useState(() => new Application());
  const [contextMenu, setContextMenu] = useState<{
    objectId: string;
    position: Vector2;
    targetIds: string[];
  }>();

  useEffect(() => {
    app.init();

    return () => {
      app.destroy();
    };
  }, [app]);

  const staticObjectCount = useEditorStore((s) => s.staticObjectCount);
  const dynamicObjectCount = useEditorStore((s) => s.dynamicObjectCount);
  const selectedCount = useEditorStore((s) => s.selectedIds.size);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const setCameraView = useEditorStore((s) => s.setCameraView);

  const openObjectContextMenu = useCallback(
    (objectId: string, position: { x: number; y: number }) => {
      setContextMenu({
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

  const fitView = useCallback(() => {
    const viewport = document.querySelector(".viewport");

    if (!(viewport instanceof HTMLElement)) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const objects = app.engine
      .getAllObjects()
      .filter((object) => (object.flags & SandboxObjectFlags.Hidden) === 0);

    if (objects.length === 0 || rect.width <= 0 || rect.height <= 0) {
      setCameraView({ x: 0, y: 0 }, 1);
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

    const padding = 64;
    const sceneWidth = Math.max(1, sceneBounds.maxX - sceneBounds.minX);
    const sceneHeight = Math.max(1, sceneBounds.maxY - sceneBounds.minY);
    const zoom = Math.min(
      (rect.width - padding * 2) / sceneWidth,
      (rect.height - padding * 2) / sceneHeight,
    );
    const sceneCenter = {
      x: sceneBounds.minX + sceneWidth / 2,
      y: sceneBounds.minY + sceneHeight / 2,
    };
    const nextZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;

    setCameraView(
      {
        x: rect.width / 2 - sceneCenter.x * nextZoom,
        y: rect.height / 2 - sceneCenter.y * nextZoom,
      },
      nextZoom,
    );
  }, [app, setCameraView]);

  return (
    <div className="app">
      <header className="headerbar">
        <h1 className="headerbar-title">Physics Sandbox</h1>

        <StatusBar
          staticObjectCount={staticObjectCount}
          dynamicObjectCount={dynamicObjectCount}
          selectedCount={selectedCount}
        />
      </header>

      <div className="workspace">
        <Sidebar app={app} onObjectContextMenu={openObjectContextMenu} />

        <main className="viewport">
          <Toolbar onFitView={fitView} />
          <CanvasView
            app={app}
            onObjectContextMenu={openObjectContextMenu}
          />
        </main>
      </div>

      {contextMenu && (
        <ObjectContextMenu
          app={app}
          key={`${contextMenu.objectId}:${contextMenu.position.x}:${contextMenu.position.y}`}
          objectId={contextMenu.objectId}
          position={contextMenu.position}
          targetIds={contextMenu.targetIds}
          onClose={() => setContextMenu(undefined)}
        />
      )}
    </div>
  );
}
