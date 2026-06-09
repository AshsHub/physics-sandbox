import { useCallback, useEffect, useRef, useState } from "react";
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
  const hasCenteredInitialScene = useRef(false);

  useEffect(() => {
    app.init();

    return () => {
      app.destroy();
    };
  }, [app]);

  const selectedCount = useEditorStore((s) => s.selectedIds.size);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objectRevision = useEditorStore((s) => s.objectRevision);
  const viewportSize = useEditorStore((s) => s.viewportSize);
  const objects = app.engine.getAllObjects();
  const staticObjectCount = objects.filter(
    (object) => object.flags & SandboxObjectFlags.Locked,
  ).length;
  const dynamicObjectCount = objects.length - staticObjectCount;

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
