import type { IApplication } from "../application/IApplication";
import { ClipboardConfig } from "../config/ClipboardConfig";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { useEditorStore } from "../store/editorStore";
import { isTypingTarget } from "./InputTarget";

export class ClipboardManager {
  private _pasteCount = 0;
  private _snapshots: ISandboxObjectSnapshot[] = [];

  private readonly _handleCopy = (event: ClipboardEvent) => {
    this.copy(event);
  };

  private readonly _handleCut = (event: ClipboardEvent) => {
    this.cut(event);
  };

  private readonly _handlePaste = (event: ClipboardEvent) => {
    this.paste(event);
  };

  public constructor(private readonly _app: IApplication) {}

  public init(): void {
    window.addEventListener("copy", this._handleCopy);
    window.addEventListener("cut", this._handleCut);
    window.addEventListener("paste", this._handlePaste);
  }

  public destroy(): void {
    window.removeEventListener("copy", this._handleCopy);
    window.removeEventListener("cut", this._handleCut);
    window.removeEventListener("paste", this._handlePaste);

    this._snapshots = [];
    this._pasteCount = 0;
  }

  public copy(event?: ClipboardEvent): boolean {
    if (isTypingTarget(event?.target ?? null)) {
      return false;
    }

    const snapshots = this._getSelectedSnapshots();

    if (snapshots.length === 0) {
      return false;
    }

    event?.preventDefault();
    event?.clipboardData?.setData(
      "text/plain",
      `${snapshots.length} sandbox object${snapshots.length === 1 ? "" : "s"}`,
    );

    this._snapshots = snapshots;
    this._pasteCount = 0;

    return true;
  }

  public cut(event?: ClipboardEvent): boolean {
    if (!this.copy(event)) {
      return false;
    }

    this._app.commands.execute("deleteObject", {
      ids: Array.from(useEditorStore.getState().selectedIds),
    });

    return true;
  }

  public paste(event?: ClipboardEvent): boolean {
    if (isTypingTarget(event?.target ?? null)) {
      return false;
    }

    if (this._snapshots.length === 0) {
      return false;
    }

    event?.preventDefault();
    this._pasteCount++;

    this._app.commands.execute("pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset).multiply(
        this._pasteCount,
      ),
      snapshots: this._cloneSnapshots(this._snapshots),
    });

    return true;
  }

  private _cloneSnapshots(
    snapshots: ISandboxObjectSnapshot[],
  ): ISandboxObjectSnapshot[] {
    return snapshots.map((snapshot) => ({
      id: snapshot.id,
      name: snapshot.name,
      type: snapshot.type,
      position: snapshot.position.clone(),
      flags: snapshot.flags,
      metadata: {
        ...snapshot.metadata,
      },
    }));
  }

  private _getSelectedSnapshots(): ISandboxObjectSnapshot[] {
    return Array.from(useEditorStore.getState().selectedIds)
      .map((id) => this._app.engine.createSnapshot(id))
      .filter(
        (snapshot): snapshot is ISandboxObjectSnapshot => snapshot !== undefined,
      )
      .map((snapshot) => ({
        ...snapshot,
        position: snapshot.position.clone(),
        metadata: {
          ...snapshot.metadata,
        },
      }));
  }

}
