import { useEffect, useState } from "react";
import "./App.css";
import { Application } from "./app/Application";
import { CanvasView } from "./canvas/CanvasView";
import { useEditorStore } from "./store/editorStore";
import { Sidebar } from "./ui/panels/Sidebar";
import { StatusBar } from "./ui/StatusBar";
import { Toolbar } from "./ui/Toolbar";

export default function App() {
  const [app] = useState(() => new Application());

  useEffect(() => {
    app.init();

    return () => {
      app.destroy();
    };
  }, [app]);

  const staticObjectCount = useEditorStore((s) => s.staticObjectCount);
  const dynamicObjectCount = useEditorStore((s) => s.dynamicObjectCount);
  const selectedCount = useEditorStore((s) => s.selectedIds.size);

  return (
    <div className="app">
      <header className="toolbar">
        <Toolbar />

        <StatusBar
          staticObjectCount={staticObjectCount}
          dynamicObjectCount={dynamicObjectCount}
          selectedCount={selectedCount}
        />
      </header>

      <div className="workspace">
        <Sidebar app={app} />

        <main className="viewport">
          <CanvasView app={app} />
        </main>
      </div>
    </div>
  );
}
