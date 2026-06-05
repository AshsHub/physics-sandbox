// src/input/InputManager.ts

import type { IApplication } from "../abstractions/IApplication";
import type { Vector2 } from "./Vector2";
import { SandboxObjectFlags } from "../sandbox/SandboxObject";

import { useEditorStore } from "../store/editorStore";

type Action = () => void;

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private readonly keyActions = new Map<string, Action[]>();
  private readonly handleKeyDown = (e: KeyboardEvent) => {
    this.keyDown(e.key);
  };

  private readonly handleKeyUp = (e: KeyboardEvent) => {
    this.keyUp(e.key);
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
  }

  private registerKeyActions(): void {
    this.registerAction(["delete", "backspace"], () => {
      this.app.engine.destroySelectedObjects();
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

  public keyDown(key: string): void {
    const normalizedKey = key.toLowerCase();
    this.pressedKeys.add(normalizedKey);
    const actions = this.keyActions.get(normalizedKey);

    if (!actions) {
      return;
    }

    actions.forEach((action) => action());
  }

  public keyUp(key: string): void {
    this.pressedKeys.delete(key.toLowerCase());
  }

  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  public pointerDown(pos: Vector2): void {
    const sceneObject = this.app.engine.getObjectFromPosition(pos);

    if (!sceneObject || sceneObject.flags & SandboxObjectFlags.Locked) {
      if (!this.isMultiSelectHeld()) {
        this.clearSelection();
      }

      return;
    }

    const id = sceneObject.id;

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

    this.app.engine.startDrag([id], pos);
  }

  public pointerMove(pos: Vector2): void {
    this.app.engine.updateDrag(pos);
  }

  public pointerUp(): void {
    this.app.engine.endDrag();
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
}
