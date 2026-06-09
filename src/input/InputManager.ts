import type { IApplication } from "../application/IApplication";
import type Matter from "matter-js";
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

const KEY_ROTATION_STEP = Math.PI / 18;
const WHEEL_ROTATION_STEP = Math.PI / 36;
const SELECTION_DRAG_THRESHOLD_SQUARED = 16;

interface SelectionGesture {
  currentScreen: Vector2;
  hitObjectId?: string;
  initialSelection: Set<string>;
  isAdditive: boolean;
  isBoxActive: boolean;
  startScreen: Vector2;
  startWorld: Vector2;
}

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private readonly keyActions = new Map<string, Action[]>();
  private activePointerMode?: InteractionMode;
  private lastPointerPosition?: Vector2;
  private selectionGesture?: SelectionGesture;
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
    useEditorStore.getState().setSelectionBox(undefined);
    this.setActivePointerMode(undefined);
  }

  private registerKeyActions(): void {
    this.registerAction(["1"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Play);
    });
    this.registerAction(["2"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Selection);
    });
    this.registerAction(["3"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Camera);
    });
    this.registerAction(["space", " "], () => {
      const state = useEditorStore.getState();
      state.setSimulationRunning(!state.isSimulationRunning);
    });
    this.registerAction(["q"], () => {
      this.rotateHeldObjects(-KEY_ROTATION_STEP);
    });
    this.registerAction(["e"], () => {
      this.rotateHeldObjects(KEY_ROTATION_STEP);
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
    const mode = this.getInteractionMode();
    this.updateHoveredObject(worldPos);

    if (mode === InteractionMode.Selection) {
      this.startSelectionGesture(pos, worldPos, sandboxObject?.id);
      return;
    }

    if (!sandboxObject) {
      if (!this.isMultiSelectHeld()) {
        this.clearSelection();
      }

      return;
    }

    const id = sandboxObject.id;

    if (mode === InteractionMode.Play) {
      let draggedIds: string[];

      if (this.isSelected(id)) {
        draggedIds = Array.from(this.getSelection());
      } else if (this.isMultiSelectHeld()) {
        this.select(id);
        draggedIds = Array.from(this.getSelection());
      } else {
        useEditorStore.getState().setSelection([id]);
        draggedIds = [id];
      }

      this.setActivePointerMode(InteractionMode.Play);
      this.app.engine.startDrag(draggedIds, worldPos);
      return;
    }

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
  }

  public pointerMove(pos: Vector2): void {
    if (this.activePointerMode === InteractionMode.Camera) {
      if (this.lastPointerPosition) {
        this.app.camera.pan({
          x: pos.x - this.lastPointerPosition.x,
          y: pos.y - this.lastPointerPosition.y,
        });
      }

      this.lastPointerPosition = pos.clone();
      return;
    }

    if (this.selectionGesture) {
      this.updateSelectionGesture(pos);
      return;
    }

    if (this.activePointerMode === InteractionMode.Play) {
      this.app.engine.updateDrag(this.screenToWorld(pos));
      return;
    }

    this.updateHoveredObject(this.screenToWorld(pos));
  }

  public pointerWheel(deltaY: number, pos: Vector2): void {
    if (deltaY === 0) {
      return;
    }

    if (this.activePointerMode !== InteractionMode.Play) {
      this.app.camera.zoomAt(pos, deltaY > 0 ? 0.9 : 1.1);
      return;
    }

    this.rotateHeldObjects(Math.sign(deltaY) * WHEEL_ROTATION_STEP);
  }

  public pointerUp(): void {
    if (this.selectionGesture) {
      this.endSelectionGesture();
      return;
    }

    this.app.engine.endDrag();
    this.setActivePointerMode(undefined);
    this.lastPointerPosition = undefined;
  }

  public pointerLeave(): void {
    if (!this.activePointerMode && !this.selectionGesture) {
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

  private rotateHeldObjects(angle: number): void {
    if (this.activePointerMode !== InteractionMode.Play) {
      return;
    }

    this.app.engine.rotateDrag(angle);
  }

  private getInteractionMode(): InteractionMode {
    return useEditorStore.getState().interactionMode;
  }

  private screenToWorld(pos: Vector2): Vector2 {
    return this.app.camera.screenToWorld(pos);
  }

  private setActivePointerMode(mode?: InteractionMode): void {
    this.activePointerMode = mode;
    useEditorStore.getState().setActivePointerMode(mode);
  }

  private updateHoveredObject(pos: Vector2): void {
    const object = this.app.engine.getObjectFromPosition(pos);
    const hoveredObjectId = object ? object.id : undefined;

    useEditorStore.getState().setHoveredObject(hoveredObjectId);
  }

  private startSelectionGesture(
    screenPosition: Vector2,
    worldPosition: Vector2,
    hitObjectId?: string,
  ): void {
    this.selectionGesture = {
      currentScreen: screenPosition.clone(),
      hitObjectId,
      initialSelection: new Set(this.getSelection()),
      isAdditive: this.isMultiSelectHeld(),
      isBoxActive: false,
      startScreen: screenPosition.clone(),
      startWorld: worldPosition.clone(),
    };
  }

  private updateSelectionGesture(screenPosition: Vector2): void {
    const gesture = this.selectionGesture;

    if (!gesture) {
      return;
    }

    gesture.currentScreen = screenPosition.clone();

    if (
      !gesture.isBoxActive &&
      gesture.startScreen.distanceSquaredTo(screenPosition) >=
        SELECTION_DRAG_THRESHOLD_SQUARED
    ) {
      gesture.isBoxActive = true;
      this.setActivePointerMode(InteractionMode.Selection);
    }

    if (!gesture.isBoxActive) {
      this.updateHoveredObject(this.screenToWorld(screenPosition));
      return;
    }

    useEditorStore.getState().setSelectionBox({
      start: gesture.startScreen.toObject(),
      current: gesture.currentScreen.toObject(),
    });

    this.applySelectionBox();
  }

  private endSelectionGesture(): void {
    const gesture = this.selectionGesture;

    if (!gesture) {
      return;
    }

    if (!gesture.isBoxActive) {
      this.applyClickSelection(gesture.hitObjectId);
    }

    this.selectionGesture = undefined;
    useEditorStore.getState().setSelectionBox(undefined);
    this.setActivePointerMode(undefined);
    this.lastPointerPosition = undefined;
  }

  private applyClickSelection(objectId?: string): void {
    if (!objectId) {
      if (!this.isMultiSelectHeld()) {
        this.clearSelection();
      }

      return;
    }

    if (this.isMultiSelectHeld()) {
      if (this.isSelected(objectId)) {
        this.deselect(objectId);
      } else {
        this.select(objectId);
      }

      return;
    }

    this.clearSelection();
    this.select(objectId);
  }

  private applySelectionBox(): void {
    const gesture = this.selectionGesture;

    if (!gesture) {
      return;
    }

    const currentWorld = this.screenToWorld(gesture.currentScreen);
    const bounds = {
      minX: Math.min(gesture.startWorld.x, currentWorld.x),
      maxX: Math.max(gesture.startWorld.x, currentWorld.x),
      minY: Math.min(gesture.startWorld.y, currentWorld.y),
      maxY: Math.max(gesture.startWorld.y, currentWorld.y),
    };
    const selectedIds = new Set(
      gesture.isAdditive ? gesture.initialSelection : [],
    );

    for (const object of this.app.engine.getAllObjects()) {
      if (object.flags & SandboxObjectFlags.Hidden) {
        continue;
      }

      if (doesBodyIntersectBounds(object.body.bounds, bounds)) {
        selectedIds.add(object.id);
      } else if (
        gesture.isAdditive &&
        !gesture.initialSelection.has(object.id)
      ) {
        selectedIds.delete(object.id);
      }
    }

    useEditorStore.getState().setSelection(selectedIds);
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

function doesBodyIntersectBounds(
  bodyBounds: Matter.Bounds,
  selectionBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  },
): boolean {
  return (
    bodyBounds.max.x >= selectionBounds.minX &&
    bodyBounds.min.x <= selectionBounds.maxX &&
    bodyBounds.max.y >= selectionBounds.minY &&
    bodyBounds.min.y <= selectionBounds.maxY
  );
}
