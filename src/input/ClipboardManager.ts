import type { IApplication } from "../application/IApplication";
import { ClipboardConfig } from "../config/ClipboardConfig";
import { Vector2 } from "../maths/Vector2";
import type { ISandboxObjectSnapshot } from "../sandbox/SandboxObject";
import { useEditorStore } from "../store/editorStore";
import {
  ClipboardAction,
  type ClipboardSelectionAction,
} from "./ClipboardAction";
import { isTypingTarget } from "./InputTarget";

export class ClipboardManager {
  private _pasteCount = 0;
  private _snapshots: ISandboxObjectSnapshot[] = [];

  private readonly _handleCopy = (event: ClipboardEvent) => {
    this._copy(undefined, event);
  };

  private readonly _handleCut = (event: ClipboardEvent) => {
    this._cut(undefined, event);
  };

  private readonly _handlePaste = (event: ClipboardEvent) => {
    this._paste(event);
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
    this._setClipboardObjectCount();
  }

  public execute(action: ClipboardAction.Paste): boolean;
  public execute(action: ClipboardSelectionAction, ids?: string[]): boolean;
  public execute(action: ClipboardAction, ids?: string[]): boolean {
    switch (action) {
      case ClipboardAction.Copy:
        return this._copy(ids);
      case ClipboardAction.Cut:
        return this._cut(ids);
      case ClipboardAction.Paste:
        return this._paste();
      case ClipboardAction.Duplicate:
        return this._duplicate(ids);
    }
  }

  private _copy(ids?: string[], event?: ClipboardEvent): boolean {
    if (isTypingTarget(event?.target ?? null)) {
      return false;
    }

    const snapshots = this._getSnapshots(this._resolveTargetIds(ids));

    if (snapshots.length === 0) {
      return false;
    }

    event?.preventDefault();
    const objectCount = snapshots.length;
    event?.clipboardData?.setData(
      "text/plain",
      `${objectCount} sandbox object${objectCount === 1 ? "" : "s"}`,
    );

    this._setSnapshots(snapshots);

    return true;
  }

  private _cut(ids?: string[], event?: ClipboardEvent): boolean {
    const targetIds = this._resolveTargetIds(ids);

    if (!this._copy(targetIds, event)) {
      return false;
    }

    this._app.commands.execute("deleteObject", {
      ids: targetIds,
    });

    return true;
  }

  private _paste(event?: ClipboardEvent): boolean {
    if (isTypingTarget(event?.target ?? null)) {
      return false;
    }

    if (this._snapshots.length === 0) {
      return false;
    }

    event?.preventDefault();
    this._pasteCount++;

    return this._pasteSnapshots(this._snapshots, this._pasteCount);
  }

  private _duplicate(ids?: string[]): boolean {
    return this._pasteSnapshots(
      this._getSnapshots(this._resolveTargetIds(ids)),
    );
  }

  private _cloneSnapshot(
    snapshot: ISandboxObjectSnapshot,
  ): ISandboxObjectSnapshot {
    return {
      id: snapshot.id,
      name: snapshot.name,
      type: snapshot.type,
      position: snapshot.position.clone(),
      angle: snapshot.angle,
      flags: snapshot.flags,
      metadata: {
        ...snapshot.metadata,
      },
    };
  }

  private _cloneSnapshots(
    snapshots: ISandboxObjectSnapshot[],
  ): ISandboxObjectSnapshot[] {
    return snapshots.map((snapshot) => this._cloneSnapshot(snapshot));
  }

  private _getSnapshots(ids: string[]): ISandboxObjectSnapshot[] {
    return ids
      .map((id) => this._app.engine.createSnapshot(id))
      .filter(
        (snapshot): snapshot is ISandboxObjectSnapshot =>
          snapshot !== undefined,
      )
      .map((snapshot) => this._cloneSnapshot(snapshot));
  }

  private _resolveTargetIds(ids?: string[]): string[] {
    return ids ?? Array.from(useEditorStore.getState().selectedIds);
  }

  private _pasteSnapshots(
    snapshots: ISandboxObjectSnapshot[],
    offsetMultiplier: number = ClipboardConfig.pasteOffset.multiplier,
  ): boolean {
    if (snapshots.length === 0) {
      return false;
    }

    this._app.commands.execute("pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset).multiply(
        offsetMultiplier,
      ),
      snapshots: this._cloneSnapshots(snapshots),
    });

    return true;
  }

  private _setSnapshots(snapshots: ISandboxObjectSnapshot[]): boolean {
    if (snapshots.length === 0) {
      return false;
    }

    this._snapshots = snapshots;
    this._pasteCount = 0;
    this._setClipboardObjectCount();

    return true;
  }

  private _setClipboardObjectCount(): void {
    useEditorStore.getState().setClipboardObjectCount(this._snapshots.length);
  }
}
