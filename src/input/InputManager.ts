import type { IApplication } from "../application/IApplication";
import { Vector2 } from "../maths/Vector2";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";

import { useEditorStore } from "../store/editorStore";
import { InteractionMode } from "./InteractionMode";

type Action = (modifiers: KeyModifiers) => void;

enum KeyModifiers {
  None = 0,
  Control = 1 << 0,
  Meta = 1 << 1,
  Shift = 1 << 2,
  Alt = 1 << 3,
}

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private readonly keyActions = new Map<string, Action[]>();
  private activePointerMode?: InteractionMode;
  private lastPointerPosition?: Vector2;
  private readonly handleKeyDown = (e: KeyboardEvent) => {
    this.keyDown(e);
  };

  private readonly handleKeyUp = (e: KeyboardEvent) => {
    this.keyUp(e);
  };

  public constructor(private readonly app: IApplication) {}

  public init(): void {
    this.registerEventListeners();
    this.registerKeyActions();
  }

  public destroy() {
    this.unregisterEventListeners();

    this.pressedKeys.clear();
    this.keyActions.clear();
    useEditorStore.getState().setHoveredObject(undefined);
    this.setActivePointerMode(undefined);
  }

  private registerKeyActions(): void {
    this.registerAction(["1"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Selection);
    });
    this.registerAction(["2"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Camera);
    });
    this.registerAction(["3"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Play);
    });
    this.registerAction(["delete", "backspace"], () => {
      this.app.commands.execute("deleteObject", {
        ids: Array.from(useEditorStore.getState().selectedIds),
      });
    });
    this.registerAction(["z"], (mods) => {
      if (this.hasPrimaryModifier(mods)) {
        if (mods & KeyModifiers.Shift) {
          this.app.commands.redo();
        } else {
          this.app.commands.undo();
        }
      }
    });
  }

  private registerAction(keys: string[], action: Action): void {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase();

      const actions = this.keyActions.get(normalizedKey);

      if (actions) {
        actions.push(action);
      } else {
        this.keyActions.set(normalizedKey, [action]);
      }
    }
  }

  private registerEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private unregisterEventListeners() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  public keyDown(e: KeyboardEvent): void {
    if (this.isTypingTarget(e.target)) {
      return;
    }

    const normalizedKey = e.key.toLowerCase();
    this.pressedKeys.add(normalizedKey);
    const actions = this.keyActions.get(normalizedKey);

    if (!actions) {
      return;
    }

    actions.forEach((action) => {
      let modifier = KeyModifiers.None;

      if (e.shiftKey) modifier |= KeyModifiers.Shift;
      if (e.ctrlKey) modifier |= KeyModifiers.Control;
      if (e.metaKey) modifier |= KeyModifiers.Meta;
      if (e.altKey) modifier |= KeyModifiers.Alt;

      action(modifier);
    });
  }

  public keyUp(e: KeyboardEvent): void {
    this.pressedKeys.delete(e.key.toLowerCase());
  }

  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  public pointerDown(pos: Vector2, button: number): void {
    this.lastPointerPosition = pos.clone();

    if (
      button === 1 ||
      (button === 0 && this.getInteractionMode() === InteractionMode.Camera)
    ) {
      this.setActivePointerMode(InteractionMode.Camera);
      return;
    }

    if (button !== 0) {
      return;
    }

    const worldPos = this.screenToWorld(pos);
    const sandboxObject = this.app.engine.getObjectFromPosition(worldPos);
    this.updateHoveredObject(worldPos);

    if (!sandboxObject || sandboxObject.flags & SandboxObjectFlags.Locked) {
      if (!this.isMultiSelectHeld()) {
        this.clearSelection();
      }

      return;
    }

    const id = sandboxObject.id;
    const mode = this.getInteractionMode();

    if (this.isMultiSelectHeld()) {
      if (this.isSelected(id)) {
        this.deselect(id);
      } else {
        this.select(id);
      }
    } else {
      this.clearSelection();

      this.select(id);
    }

    if (mode === InteractionMode.Play) {
      const draggedIds = this.isSelected(id)
        ? Array.from(this.getSelection())
        : [id];

      this.setActivePointerMode(InteractionMode.Play);
      this.app.engine.startDrag(draggedIds, worldPos);
    }
  }

  public pointerMove(pos: Vector2): void {
    if (this.activePointerMode === InteractionMode.Camera) {
      if (this.lastPointerPosition) {
        useEditorStore.getState().panCamera({
          x: pos.x - this.lastPointerPosition.x,
          y: pos.y - this.lastPointerPosition.y,
        });
      }

      this.lastPointerPosition = pos.clone();
      return;
    }

    if (this.activePointerMode === InteractionMode.Play) {
      this.app.engine.updateDrag(this.screenToWorld(pos));
      return;
    }

    this.updateHoveredObject(this.screenToWorld(pos));
  }

  public pointerUp(): void {
    this.app.engine.endDrag();
    this.setActivePointerMode(undefined);
    this.lastPointerPosition = undefined;
  }

  public pointerLeave(): void {
    if (!this.activePointerMode) {
      useEditorStore.getState().setHoveredObject(undefined);
    }
  }

  private isMultiSelectHeld(): boolean {
    return this.isKeyPressed("control") || this.isKeyPressed("shift");
  }

  public select(id: string): void {
    useEditorStore.getState().select(id);
  }

  public deselect(id: string): void {
    useEditorStore.getState().deselect(id);
  }

  public clearSelection(): void {
    useEditorStore.getState().clearSelection();
  }

  public isSelected(id: string): boolean {
    return useEditorStore.getState().selectedIds.has(id);
  }

  public getSelection() {
    return useEditorStore.getState().selectedIds;
  }

  private hasPrimaryModifier(mods: KeyModifiers) {
    return (mods & (KeyModifiers.Control | KeyModifiers.Meta)) !== 0;
  }

  private getInteractionMode(): InteractionMode {
    return useEditorStore.getState().interactionMode;
  }

  private screenToWorld(pos: Vector2): Vector2 {
    const cameraOffset = useEditorStore.getState().cameraOffset;

    return new Vector2(pos.x - cameraOffset.x, pos.y - cameraOffset.y);
  }

  private setActivePointerMode(mode?: InteractionMode): void {
    this.activePointerMode = mode;
    useEditorStore.getState().setActivePointerMode(mode);
  }

  private updateHoveredObject(pos: Vector2): void {
    const object = this.app.engine.getObjectFromPosition(pos);
    const hoveredObjectId =
      object && !(object.flags & SandboxObjectFlags.Locked)
        ? object.id
        : undefined;

    useEditorStore.getState().setHoveredObject(hoveredObjectId);
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    );
  }
}
