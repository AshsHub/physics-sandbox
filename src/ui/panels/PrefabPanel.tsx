import { useState } from "react";
import type { IApplication } from "../../application/IApplication";
import { Rect } from "../../maths/Rect";
import type { Vector2 } from "../../maths/Vector2";
import { createPrefabSource } from "../../prefabs/PrefabExporter";
import {
  sandboxPrefabs,
  type SandboxPrefab,
} from "../../prefabs/SandboxPrefabs";
import { appStorage } from "../../storage/AppStorage";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { InfoStack } from "../common/InfoStack";
import { Panel } from "./Panel";

export interface PrefabPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function PrefabPanel({ app, onClose }: PrefabPanelProps) {
  const [exportMessage, setExportMessage] = useState("");
  const [shouldClearSceneOnSpawn, setShouldClearSceneOnSpawn] = useState(
    () => appStorage.readSettings().clearSceneBeforePrefabSpawn === true,
  );
  const selectedIds = useEditorStore((s) => s.selectedIds);
  useEditorStore((s) => s.objectRevision);
  const canExport = selectedIds.size > 0;

  const updateClearSceneOnSpawn = (isEnabled: boolean) => {
    setShouldClearSceneOnSpawn(isEnabled);
    appStorage.updateSettings({
      clearSceneBeforePrefabSpawn: isEnabled,
    });
  };

  const spawnPrefab = (prefab: SandboxPrefab) => {
    const position = app.camera.getViewportCenterPosition();

    if (shouldClearSceneOnSpawn) {
      app.engine.destroyAllObjects();
    }

    const result = app.commands.execute("spawnPrefab", {
      prefab,
      position,
    });

    if (result.success) {
      app.fitView({
        bounds: getPrefabFitBounds(prefab, position),
        maxZoom: app.camera.getZoom(),
        onlyIfLargerThanViewport: true,
      });
    }
  };

  const exportSelectedPrefab = async () => {
    const snapshots = Array.from(selectedIds)
      .map((id) => app.engine.generateSnapshot(id))
      .filter((snapshot) => snapshot !== undefined);

    if (snapshots.length === 0) {
      setExportMessage("Select objects to export.");
      return;
    }

    const source = createPrefabSource(snapshots);

    try {
      await navigator.clipboard.writeText(source);
      setExportMessage(`Copied ${snapshots.length} object prefab.`);
    } catch {
      setExportMessage("Clipboard export failed.");
    }
  };

  return (
    <Panel title="Prefabs" onClose={onClose}>
      <section className="prefab-group">
        <h3 className="prefab-group-title">Built-in</h3>
        <label
          className={
            shouldClearSceneOnSpawn ? "prefab-toggle selected" : "prefab-toggle"
          }
        >
          <input
            checked={shouldClearSceneOnSpawn}
            onChange={(event) => updateClearSceneOnSpawn(event.target.checked)}
            type="checkbox"
          />
          <InfoStack
            className="prefab-toggle-copy"
            description="Remove existing objects before spawning a prefab."
            title="Clear scene"
          />
        </label>

        <div className="prefab-list">
          {sandboxPrefabs.map((prefab) => (
            <AppButton
              className="prefab-button"
              data-tooltip={prefab.description}
              data-tooltip-position="right"
              key={prefab.id}
              onClick={() => spawnPrefab(prefab)}
              type="button"
              variant="ghost"
            >
              <InfoStack
                className="prefab-button-copy"
                description={prefab.description}
                title={prefab.name}
              />
              <span className="prefab-button-count">
                {prefab.objects.length}
              </span>
            </AppButton>
          ))}
        </div>
      </section>

      {import.meta.env.DEV && (
        <section className="prefab-group">
          <h3 className="prefab-group-title">Developer</h3>
          <div className="prefab-export-card">
            <InfoStack
              className="prefab-export-copy"
              description="Copy selected objects as serialized prefab data."
              title="Export selection"
            />
            <AppButton
              className="prefab-export-button"
              data-tooltip="Copy selected objects as serialized prefab data"
              data-tooltip-position="right"
              disabled={!canExport}
              onClick={() => void exportSelectedPrefab()}
              type="button"
              variant="subtle"
            >
              Export
            </AppButton>
          </div>
          {exportMessage && (
            <div className="prefab-export-message">{exportMessage}</div>
          )}
        </section>
      )}
    </Panel>
  );
}

function getPrefabFitBounds(prefab: SandboxPrefab, position: Vector2): Rect[] {
  return prefab.objects.map((object) => {
    const objectPosition = position.clone().add(object.offset);
    const width = object.metadata.width;
    const height = object.metadata.height;

    return new Rect(
      objectPosition.x - width / 2,
      objectPosition.x + width / 2,
      objectPosition.y - height / 2,
      objectPosition.y + height / 2,
    );
  });
}
