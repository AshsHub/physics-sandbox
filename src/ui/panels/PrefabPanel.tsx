import { useEffect, useState } from "react";
import type { IApplication } from "../../application/IApplication";
import { Rect } from "../../maths/Rect";
import type { Vector2 } from "../../maths/Vector2";
import {
  createPrefabSource,
  createSerializedPrefab,
} from "../../prefabs/PrefabExporter";
import {
  loadSandboxPrefab,
  sandboxPrefabs,
  type SerializedSandboxPrefab,
  type SandboxPrefab,
} from "../../prefabs/SandboxPrefabs";
import { appStorage } from "../../storage/AppStorage";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { InfoStack } from "../common/InfoStack";
import { AppIcon } from "../icons/AppIcon";
import { Panel } from "./Panel";

export interface PrefabPanelProps {
  app: IApplication;
  onClose?: () => void;
}

export function PrefabPanel({ app, onClose }: PrefabPanelProps) {
  const [exportMessage, setExportMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string>();
  const [openSceneMenuId, setOpenSceneMenuId] = useState<string>();
  const [renameDraft, setRenameDraft] = useState("");
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [savedScenes, setSavedScenes] = useState<SerializedSandboxPrefab[]>(
    () => appStorage.readSettings().savedScenes ?? [],
  );
  const [shouldClearSceneOnSpawn, setShouldClearSceneOnSpawn] = useState(
    () => appStorage.readSettings().clearSceneBeforePrefabSpawn === true,
  );
  const selectedIds = useEditorStore((s) => s.selectedIds);
  useEditorStore((s) => s.objectRevision);
  const objectCount = app.engine.getAllObjects().length;
  const canExport = selectedIds.size > 0;
  const canSaveScene = objectCount > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const updateClearSceneOnSpawn = (isEnabled: boolean) => {
    setShouldClearSceneOnSpawn(isEnabled);
    appStorage.updateSettings({
      clearSceneBeforePrefabSpawn: isEnabled,
    });
  };

  const updateSavedScenes = (scenes: SerializedSandboxPrefab[]) => {
    setSavedScenes(scenes);
    appStorage.updateSettings({
      savedScenes: scenes,
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

  const saveCurrentScene = () => {
    const snapshots = app.engine
      .getAllObjects()
      .map((object) => app.engine.generateSnapshot(object.id))
      .filter((snapshot) => snapshot !== undefined);

    if (snapshots.length === 0) {
      setSaveMessage("Add objects before saving a scene.");
      return;
    }

    const savedAt = new Date();
    const scene = {
      ...createSerializedPrefab(
        snapshots,
        `Saved scene ${savedScenes.length + 1}`,
      ),
      description: `${snapshots.length} objects saved on ${savedAt.toLocaleDateString()}.`,
      id: `saved-scene-${savedAt.getTime()}`,
    };
    const nextScenes = [scene, ...savedScenes];

    updateSavedScenes(nextScenes);
    setSaveMessage("");
  };

  const loadSavedScene = (scene: SerializedSandboxPrefab) => {
    spawnPrefab(loadSandboxPrefab(scene));
  };

  const deleteSavedScene = (sceneId: string) => {
    updateSavedScenes(savedScenes.filter((scene) => scene.id !== sceneId));
    setDeleteTargetId(undefined);
    setOpenSceneMenuId(undefined);
  };

  const openSceneMenu = (scene: SerializedSandboxPrefab) => {
    setDeleteTargetId(undefined);
    setOpenSceneMenuId((currentId) =>
      currentId === scene.id ? undefined : scene.id,
    );
    setRenameDraft(scene.name);
  };

  const renameSavedScene = (sceneId: string) => {
    const nextName = renameDraft.trim();

    if (!nextName) {
      return;
    }

    updateSavedScenes(
      savedScenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              name: nextName,
            }
          : scene,
      ),
    );
    setOpenSceneMenuId(undefined);
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
        <h3 className="prefab-group-title">User scenes</h3>
        <div className="prefab-export-card">
          <InfoStack
            className="prefab-export-copy"
            description="Save the current scene to this browser."
            title="Save scene"
          />
          <AppButton
            className="prefab-export-button"
            data-tooltip="Save the current scene to local storage"
            data-tooltip-position="right"
            disabled={!canSaveScene}
            onClick={saveCurrentScene}
            type="button"
            variant="subtle"
          >
            Save
          </AppButton>
        </div>
        {saveMessage && (
          <div className="prefab-export-message">{saveMessage}</div>
        )}

        {savedScenes.length > 0 && (
          <div className="prefab-list">
            {savedScenes.map((scene) => (
              <div className="saved-scene-card" key={scene.id}>
                <AppButton
                  className="prefab-button saved-scene-button"
                  data-tooltip={scene.description}
                  data-tooltip-position="right"
                  onClick={() => loadSavedScene(scene)}
                  type="button"
                  variant="ghost"
                >
                  <InfoStack
                    className="prefab-button-copy"
                    description={scene.description}
                    title={scene.name}
                  />
                  <span className="prefab-button-count">
                    {scene.objects.length}
                  </span>
                </AppButton>
                <AppButton
                  aria-label={
                    isShiftPressed
                      ? `Delete ${scene.name}`
                      : `Open ${scene.name} actions`
                  }
                  className={
                    isShiftPressed
                      ? "saved-scene-action-button destructive"
                      : "saved-scene-action-button"
                  }
                  data-tooltip={
                    isShiftPressed
                      ? "Delete saved scene"
                      : "Saved scene actions"
                  }
                  data-tooltip-position="left"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (event.shiftKey || isShiftPressed) {
                      deleteSavedScene(scene.id);
                      return;
                    }

                    openSceneMenu(scene);
                  }}
                  type="button"
                  variant="ghost"
                >
                  <AppIcon name={isShiftPressed ? "trash" : "ellipsis"} />
                </AppButton>

                {openSceneMenuId === scene.id && (
                  <div className="saved-scene-menu">
                    <label className="saved-scene-rename-field">
                      <span>Name</span>
                      <input
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                      />
                    </label>
                    <div className="saved-scene-confirmation-actions">
                      <AppButton
                        disabled={renameDraft.trim().length === 0}
                        onClick={() => renameSavedScene(scene.id)}
                        type="button"
                        variant="accent"
                      >
                        Rename
                      </AppButton>
                      <AppButton
                        onClick={() => setDeleteTargetId(scene.id)}
                        type="button"
                        variant="ghost"
                      >
                        Delete
                      </AppButton>
                    </div>
                  </div>
                )}

                {deleteTargetId === scene.id && (
                  <div className="saved-scene-confirmation">
                    <span>Delete this scene?</span>
                    <div className="saved-scene-confirmation-actions">
                      <AppButton
                        onClick={() => deleteSavedScene(scene.id)}
                        type="button"
                        variant="accent"
                      >
                        Confirm
                      </AppButton>
                      <AppButton
                        onClick={() => setDeleteTargetId(undefined)}
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </AppButton>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="prefab-group">
        <h3 className="prefab-group-title">Built-in prefabs</h3>
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
