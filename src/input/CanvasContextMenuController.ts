import type { IApplication } from "../application/IApplication";
import { Vector2, type VectorLike } from "../maths/Vector2";
import { useEditorStore } from "../store/editorStore";

export interface CanvasContextMenuCallbacks {
  onCanvasContextMenu(position: VectorLike, worldPosition: Vector2): void;
  onObjectContextMenu(objectId: string, position: VectorLike): void;
}

export class CanvasContextMenuController {
  public constructor(
    private readonly _app: IApplication,
    private readonly _callbacks: CanvasContextMenuCallbacks,
  ) {}

  public open(event: MouseEvent, canvas: HTMLCanvasElement): void {
    event.preventDefault();

    if (useEditorStore.getState().objectPlacement) {
      useEditorStore.getState().clearObjectPlacement();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const canvasPosition = new Vector2(
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    const worldPosition = this._app.camera.screenToWorld(canvasPosition);
    const object = this._app.engine.getObjectFromPosition(worldPosition);
    const menuPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    if (!object) {
      this._callbacks.onCanvasContextMenu(menuPosition, worldPosition);
      return;
    }

    this._callbacks.onObjectContextMenu(object.id, menuPosition);
  }
}
