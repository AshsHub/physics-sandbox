import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { Vector2 } from "./maths/Vector2";
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
          <Toolbar />
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
