import { useEffect, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { useEditorStore } from "./store/editorStore";
import { Sidebar } from "./ui/sidebar/Sidebar";
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
      <header className="headerbar">
        <h1 className="headerbar-title">Physics Sandbox</h1>

        <StatusBar
          staticObjectCount={staticObjectCount}
          dynamicObjectCount={dynamicObjectCount}
          selectedCount={selectedCount}
        />
      </header>

      <div className="workspace">
        <Sidebar app={app} />

        <main className="viewport">
          <Toolbar />
          <CanvasView app={app} />
        </main>
      </div>
    </div>
  );
}
