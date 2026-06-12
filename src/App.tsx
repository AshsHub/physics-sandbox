import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Application } from "./application/Application";
import { CanvasView } from "./canvas/CanvasView";
import { AppConfig } from "./config/AppConfig";
import { Vector2, type VectorLike } from "./maths/Vector2";
import { useEditorStore } from "./store/editorStore";
import { resolveThemeMode, writeStoredThemeMode } from "./theme/Theme";
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
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
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

      if (elapsed >= AppConfig.fps.sampleIntervalMs) {
        setFps(
          Math.round(
            (frameCount * AppConfig.fps.millisecondsPerSecond) / elapsed,
          ),
        );
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
  const staticObjectCount = useEditorStore((s) => s.staticObjectCount);
  const dynamicObjectCount = useEditorStore((s) => s.dynamicObjectCount);
  const themeMode = useEditorStore((s) => s.themeMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updatePreference = () => setPrefersDark(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    const resolvedTheme = resolveThemeMode(themeMode, prefersDark);

    document.documentElement.dataset.theme = resolvedTheme.toLowerCase();
    document.documentElement.dataset.themeMode = themeMode.toLowerCase();
    writeStoredThemeMode(themeMode);
  }, [prefersDark, themeMode]);

  const openObjectContextMenu = useCallback(
    (objectId: string, position: VectorLike) => {
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
    (position: VectorLike, worldPosition: Vector2) => {
      setContextMenu({
        type: "canvas",
        position: new Vector2(position),
        worldPosition: worldPosition.clone(),
      });
    },
    [],
  );

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
