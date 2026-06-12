import type { IApplication } from "../application/IApplication";
import type Matter from "matter-js";
import { InputConfig, MouseButton } from "../config/InputConfig";
import { Vector2 } from "../maths/Vector2";
import {
  SandboxObjectFlags,
  type SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";
import { SidebarPanel } from "../ui/sidebar/SidebarPanel";
import {
  ClipboardAction,
  type ClipboardSelectionAction,
} from "./ClipboardAction";
import { ClipboardManager } from "./ClipboardManager";
import { InteractionMode } from "./InteractionMode";
import {
  KeyboardInputController,
  KeyModifiers,
} from "./KeyboardInputController";

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
  private readonly _clipboard: ClipboardManager;
  private readonly _keyboard = new KeyboardInputController();
  private _activePointerMode?: InteractionMode;
  private _lastPointerPosition?: Vector2;
  private _selectionGesture?: SelectionGesture;

  public constructor(private readonly _app: IApplication) {
    this._clipboard = new ClipboardManager(_app);
  }

  public init(): void {
    this._registerKeyActions();
    this._clipboard.init();
    this._keyboard.init();
  }

  public destroy(): void {
    this._clipboard.destroy();
    this._keyboard.destroy();
    useEditorStore.getState().setHoveredObject(undefined);
    useEditorStore.getState().setSelectionBox(undefined);
    this._setActivePointerMode(undefined);
    this._lastPointerPosition = undefined;
    this._selectionGesture = undefined;
  }

  public keyDown(event: KeyboardEvent): void {
    this._keyboard.keyDown(event);
  }

  public keyUp(event: KeyboardEvent): void {
    this._keyboard.keyUp(event);
  }

  public isKeyPressed(key: string): boolean {
    return this._keyboard.isKeyPressed(key);
  }

  public startObjectPlacement(type: SandboxObjectType): void {
    const state = useEditorStore.getState();

    state.setObjectPlacement(type);
    state.clearSelection();
    state.setHoveredObject(undefined);
  }

  public pointerDown(pos: Vector2, button: number): void {
    this._lastPointerPosition = pos.clone();

    const placement = this._getObjectPlacement();

    if (placement) {
      if (button === MouseButton.Middle) {
        useEditorStore.getState().setObjectPlacementPosition(undefined);
        this._setActivePointerMode(InteractionMode.Camera);
        return;
      }

      if (button === MouseButton.Primary) {
        this._stampObject(pos);
      } else if (button === MouseButton.Secondary) {
        useEditorStore.getState().clearObjectPlacement();
      }

      return;
    }

    if (
      button === MouseButton.Middle ||
      (button === MouseButton.Primary &&
        this._getInteractionMode() === InteractionMode.Camera)
    ) {
      this._setActivePointerMode(InteractionMode.Camera);
      return;
    }

    if (button !== MouseButton.Primary) {
      return;
    }

    const worldPos = this._screenToWorld(pos);
    const sandboxObject = this._app.engine.getObjectFromPosition(worldPos);
    const mode = this._getInteractionMode();
    this._updateHoveredObject(worldPos);

    if (mode === InteractionMode.Selection) {
      this._startSelectionGesture(pos, worldPos, sandboxObject?.id);
      return;
    }

    if (!sandboxObject) {
      if (!this._isMultiSelectHeld()) {
        this._clearSelection();
      }

      return;
    }

    const id = sandboxObject.id;

    if (mode === InteractionMode.Play) {
      let draggedIds: string[];

      if (this._isSelected(id)) {
        draggedIds = Array.from(this._getSelection());
      } else if (this._isMultiSelectHeld()) {
        this._select(id);
        draggedIds = Array.from(this._getSelection());
      } else {
        useEditorStore.getState().setSelection([id]);
        draggedIds = [id];
      }

      this._setActivePointerMode(InteractionMode.Play);
      this._app.engine.startDrag(draggedIds, worldPos);
      return;
    }

    if (this._isMultiSelectHeld()) {
      if (this._isSelected(id)) {
        this._deselect(id);
      } else {
        this._select(id);
      }
    } else {
      this._clearSelection();
      this._select(id);
    }
  }

  public pointerMove(pos: Vector2): void {
    if (
      this._getObjectPlacement() &&
      this._activePointerMode !== InteractionMode.Camera
    ) {
      useEditorStore.getState().setObjectPlacementPosition(pos.toObject());
      return;
    }

    if (this._activePointerMode === InteractionMode.Camera) {
      if (this._lastPointerPosition) {
        this._app.camera.pan({
          x: pos.x - this._lastPointerPosition.x,
          y: pos.y - this._lastPointerPosition.y,
        });
      }

      this._lastPointerPosition = pos.clone();
      return;
    }

    if (this._selectionGesture) {
      this._updateSelectionGesture(pos);
      return;
    }

    if (this._activePointerMode === InteractionMode.Play) {
      this._app.engine.updateDrag(this._screenToWorld(pos));
      return;
    }

    this._updateHoveredObject(this._screenToWorld(pos));
  }

  public pointerWheel(deltaY: number, pos: Vector2): void {
    if (deltaY === 0) {
      return;
    }

    if (this._activePointerMode !== InteractionMode.Play) {
      this._app.camera.zoomAt(
        pos,
        deltaY > 0
          ? InputConfig.pointer.wheelZoomOutFactor
          : InputConfig.pointer.wheelZoomInFactor,
      );
      return;
    }

    this._rotateHeldObjects(
      Math.sign(deltaY) * InputConfig.pointer.wheelRotationStep,
    );
  }

  public pointerUp(): void {
    if (this._selectionGesture) {
      this._endSelectionGesture();
      return;
    }

    this._app.engine.endDrag();
    this._setActivePointerMode(undefined);
    this._lastPointerPosition = undefined;
  }

  public pointerLeave(): void {
    if (this._getObjectPlacement()) {
      useEditorStore.getState().setObjectPlacementPosition(undefined);
      return;
    }

    if (!this._activePointerMode && !this._selectionGesture) {
      useEditorStore.getState().setHoveredObject(undefined);
    }
  }

  public executeClipboardAction(action: ClipboardAction.Paste): boolean;
  public executeClipboardAction(
    action: ClipboardSelectionAction,
    ids?: string[],
  ): boolean;
  public executeClipboardAction(
    action: ClipboardAction,
    ids?: string[],
  ): boolean {
    if (action === ClipboardAction.Paste) {
      return this._clipboard.execute(action);
    }

    return this._clipboard.execute(action, ids);
  }

  private _registerKeyActions(): void {
    this._keyboard.registerAction(["1"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Play);
    });
    this._keyboard.registerAction(["2"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Selection);
    });
    this._keyboard.registerAction(["3"], () => {
      useEditorStore.getState().setInteractionMode(InteractionMode.Camera);
    });
    this._keyboard.registerAction(
      ["a"],
      (mods) => {
        if (this._hasPrimaryModifier(mods)) {
          const allIds = this._app.engine.getAllObjects().map((o) => o.id);
          useEditorStore.getState().setSelection(allIds);
        }
      },
      { preventDefault: true },
    );
    this._keyboard.registerAction(["space", " "], () => {
      const state = useEditorStore.getState();
      state.setSimulationRunning(!state.isSimulationRunning);
    });
    this._keyboard.registerAction(
      ["q"],
      () => {
        this._rotatePlacementOrHeld(-InputConfig.keyboard.rotationStep);
      },
      { repeat: true },
    );
    this._keyboard.registerAction(
      ["e"],
      () => {
        this._rotatePlacementOrHeld(InputConfig.keyboard.rotationStep);
      },
      { repeat: true },
    );

    this._keyboard.registerAction(["escape"], () => {
      useEditorStore.getState().clearObjectPlacement();
    });

    this._keyboard.registerAction(
      ["-", "_"],
      (mods) => {
        this._zoomFromKeyboard(-InputConfig.keyboard.zoomStep, mods);
      },
      {
        repeat: true,
      },
    );
    this._keyboard.registerAction(
      ["+", "="],
      (mods) => {
        this._zoomFromKeyboard(InputConfig.keyboard.zoomStep, mods);
      },
      {
        repeat: true,
      },
    );

    this._keyboard.registerAction(["r"], () => {
      const state = useEditorStore.getState();
      state.setShowForceRadius(!state.showForceRadius);
    });

    this._keyboard.registerAction(["i"], () => {
      const state = useEditorStore.getState();

      state.setActivePanel(SidebarPanel.Inspector);

      if (state.selectedIds.size > 0) {
        state.toggleInspectorItems(state.selectedIds);
      }
    });

    this._keyboard.registerAction(["f"], () => {
      this._app.fitView();
    });

    this._keyboard.registerAction(["delete", "backspace"], () => {
      this._app.commands.execute("deleteObject", {
        ids: Array.from(useEditorStore.getState().selectedIds),
      });
    });
    this._keyboard.registerAction(["d"], (mods, event) => {
      if (this._hasPrimaryModifier(mods)) {
        event.preventDefault();
        this._clipboard.execute(ClipboardAction.Duplicate);
      }
    });
    this._keyboard.registerAction(
      ["z"],
      (mods) => {
        if (this._hasPrimaryModifier(mods)) {
          if (mods & KeyModifiers.Shift) {
            this._app.commands.redo();
          } else {
            this._app.commands.undo();
          }
        }
      },
      { repeat: true },
    );
    this._keyboard.registerAction(
      ["y"],
      (mods) => {
        if (this._hasPrimaryModifier(mods)) {
          this._app.commands.redo();
        }
      },
      { repeat: true },
    );
  }

  private _isMultiSelectHeld(): boolean {
    return this.isKeyPressed("control") || this.isKeyPressed("shift");
  }

  private _select(id: string): void {
    useEditorStore.getState().select(id);
  }

  private _deselect(id: string): void {
    useEditorStore.getState().deselect(id);
  }

  private _clearSelection(): void {
    useEditorStore.getState().clearSelection();
  }

  private _isSelected(id: string): boolean {
    return useEditorStore.getState().selectedIds.has(id);
  }

  private _getSelection(): Set<string> {
    return useEditorStore.getState().selectedIds;
  }

  private _rotateHeldObjects(angle: number): void {
    if (this._activePointerMode !== InteractionMode.Play) {
      return;
    }

    this._app.engine.rotateDrag(angle);
  }

  private _rotatePlacementOrHeld(angle: number): void {
    if (this._getObjectPlacement()) {
      useEditorStore.getState().rotateObjectPlacement(angle);
      return;
    }

    this._rotateHeldObjects(angle);
  }

  private _zoomFromKeyboard(delta: number, mods: KeyModifiers): void {
    if (this._hasPrimaryModifier(mods)) {
      return;
    }

    this._app.camera.setZoomAtViewportCenter(
      this._app.camera.getZoom() + delta,
    );
  }

  private _getInteractionMode(): InteractionMode {
    return useEditorStore.getState().interactionMode;
  }

  private _getObjectPlacement() {
    return useEditorStore.getState().objectPlacement;
  }

  private _stampObject(screenPosition: Vector2): void {
    const placement = this._getObjectPlacement();

    if (!placement) {
      return;
    }

    this._app.commands.execute("createObject", {
      type: placement.type,
      position: this._screenToWorld(screenPosition),
      angle: placement.angle,
    });

    useEditorStore
      .getState()
      .setObjectPlacementPosition(screenPosition.toObject());
  }

  private _screenToWorld(pos: Vector2): Vector2 {
    return this._app.camera.screenToWorld(pos);
  }

  private _setActivePointerMode(mode?: InteractionMode): void {
    this._activePointerMode = mode;
    useEditorStore.getState().setActivePointerMode(mode);
  }

  private _updateHoveredObject(pos: Vector2): void {
    const object = this._app.engine.getObjectFromPosition(pos);
    const hoveredObjectId = object ? object.id : undefined;

    useEditorStore.getState().setHoveredObject(hoveredObjectId);
  }

  private _startSelectionGesture(
    screenPosition: Vector2,
    worldPosition: Vector2,
    hitObjectId?: string,
  ): void {
    this._selectionGesture = {
      currentScreen: screenPosition.clone(),
      hitObjectId,
      initialSelection: new Set(this._getSelection()),
      isAdditive: this._isMultiSelectHeld(),
      isBoxActive: false,
      startScreen: screenPosition.clone(),
      startWorld: worldPosition.clone(),
    };
  }

  private _updateSelectionGesture(screenPosition: Vector2): void {
    const gesture = this._selectionGesture;

    if (!gesture) {
      return;
    }

    gesture.currentScreen = screenPosition.clone();

    if (
      !gesture.isBoxActive &&
      gesture.startScreen.distanceSquaredTo(screenPosition) >=
        InputConfig.selection.dragThresholdSquared
    ) {
      gesture.isBoxActive = true;
      this._setActivePointerMode(InteractionMode.Selection);
    }

    if (!gesture.isBoxActive) {
      this._updateHoveredObject(this._screenToWorld(screenPosition));
      return;
    }

    useEditorStore.getState().setSelectionBox({
      start: gesture.startScreen.toObject(),
      current: gesture.currentScreen.toObject(),
    });

    this._applySelectionBox();
  }

  private _endSelectionGesture(): void {
    const gesture = this._selectionGesture;

    if (!gesture) {
      return;
    }

    if (!gesture.isBoxActive) {
      this._applyClickSelection(gesture.hitObjectId);
    }

    this._selectionGesture = undefined;
    useEditorStore.getState().setSelectionBox(undefined);
    this._setActivePointerMode(undefined);
    this._lastPointerPosition = undefined;
  }

  private _applyClickSelection(objectId?: string): void {
    if (!objectId) {
      if (!this._isMultiSelectHeld()) {
        this._clearSelection();
      }

      return;
    }

    if (this._isMultiSelectHeld()) {
      if (this._isSelected(objectId)) {
        this._deselect(objectId);
      } else {
        this._select(objectId);
      }

      return;
    }

    this._clearSelection();
    this._select(objectId);
  }

  private _applySelectionBox(): void {
    const gesture = this._selectionGesture;

    if (!gesture) {
      return;
    }

    const currentWorld = this._screenToWorld(gesture.currentScreen);
    const bounds = {
      minX: Math.min(gesture.startWorld.x, currentWorld.x),
      maxX: Math.max(gesture.startWorld.x, currentWorld.x),
      minY: Math.min(gesture.startWorld.y, currentWorld.y),
      maxY: Math.max(gesture.startWorld.y, currentWorld.y),
    };
    const selectedIds = new Set(
      gesture.isAdditive ? gesture.initialSelection : [],
    );

    for (const object of this._app.engine.getAllObjects()) {
      if (object.flags & SandboxObjectFlags.Hidden) {
        continue;
      }

      if (this._doesBodyIntersectBounds(object.body.bounds, bounds)) {
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

  private _doesBodyIntersectBounds(
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

  private _hasPrimaryModifier(modifiers: KeyModifiers): boolean {
    return (modifiers & (KeyModifiers.Control | KeyModifiers.Meta)) !== 0;
  }
}
