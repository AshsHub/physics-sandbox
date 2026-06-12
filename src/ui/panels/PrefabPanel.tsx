import { useState } from "react";
import type { IApplication } from "../../application/IApplication";
import { createPrefabSource } from "../../prefabs/PrefabExporter";
import {
  sandboxPrefabs,
  type SandboxPrefab,
} from "../../prefabs/SandboxPrefabs";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { Panel } from "./Panel";

export interface PrefabPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function PrefabPanel({ app, onClose }: PrefabPanelProps) {
  const [exportMessage, setExportMessage] = useState("");
  const selectedIds = useEditorStore((s) => s.selectedIds);
  useEditorStore((s) => s.objectRevision);
  const canExport = selectedIds.size > 0;

  const spawnPrefab = (prefab: SandboxPrefab) => {
    const result = app.commands.execute("spawnPrefab", {
      prefab,
      position: app.camera.getViewportCenterPosition(),
    });

    if (result.success) {
      app.fitView();
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

        <div className="prefab-list">
          {sandboxPrefabs.map((prefab) => (
            <AppButton
              className="prefab-button"
              data-tooltip={prefab.description}
              data-tooltip-position="right"
              key={prefab.id}
              onClick={() => spawnPrefab(prefab)}
              type="button"
            >
              <span className="prefab-button-name">{prefab.name}</span>
              <span className="prefab-button-meta">
                {prefab.objects.length} objects
              </span>
            </AppButton>
          ))}
        </div>
      </section>

      {import.meta.env.DEV && (
        <section className="prefab-group">
          <h3 className="prefab-group-title">Developer</h3>
          <AppButton
            className="prefab-export-button"
            data-tooltip="Copy selected objects as serialized prefab data"
            data-tooltip-position="right"
            disabled={!canExport}
            onClick={() => void exportSelectedPrefab()}
            type="button"
          >
            Export Selected Prefab
          </AppButton>
          {exportMessage && (
            <div className="prefab-export-message">{exportMessage}</div>
          )}
        </section>
      )}
    </Panel>
  );
}
