import type { IApplication } from "../application/IApplication";
import type { Vector2 } from "../maths/Vector2";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";

import { useEditorStore } from "../store/editorStore";

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
  }

  private registerKeyActions(): void {
    this.registerAction(["delete", "backspace"], () => {
      this.app.engine.destroySelectedObjects();
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

  public pointerDown(pos: Vector2): void {
    const sandboxObject = this.app.engine.getObjectFromPosition(pos);

    if (!sandboxObject || sandboxObject.flags & SandboxObjectFlags.Locked) {
      if (!this.isMultiSelectHeld()) {
        this.clearSelection();
      }

      return;
    }

    const id = sandboxObject.id;

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

  private hasPrimaryModifier(mods: KeyModifiers) {
    return (mods & (KeyModifiers.Control | KeyModifiers.Meta)) !== 0;
  }
}
