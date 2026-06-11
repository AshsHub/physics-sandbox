import { create } from "zustand";
import { type ViewportSize } from "../camera/Camera";
import { CameraConfig } from "../config/CameraConfig";
import { SimulationConfig } from "../config/SimulationConfig";
import { InteractionMode } from "../input/InteractionMode";
import { GravitySimulationType } from "../physics/SandboxSimulation";
import { SandboxObjectType } from "../sandbox/SandboxObjectType";
import { readStoredThemeMode, ThemeMode } from "../theme/Theme";
import { SidebarPanel } from "../ui/panels/SidebarPanel";

export interface CameraOffset {
  x: number;
  y: number;
}

export interface SelectionBox {
  start: CameraOffset;
  current: CameraOffset;
}

export interface ObjectPlacementState {
  angle: number;
  screenPosition?: CameraOffset;
  type: SandboxObjectType;
}

export interface IEditorStore {
  staticObjectCount: number;
  dynamicObjectCount: number;
  objectRevision: number;
  isSimulationRunning: boolean;
  interactionMode: InteractionMode;
  activePointerMode?: InteractionMode;
  cameraOffset: CameraOffset;
  cameraZoom: number;
  clipboardObjectCount: number;
  viewportSize: ViewportSize;
  hoveredObjectId?: string;
  inspectorScrollTargetId?: string;
  openInspectorItemIds: Set<string>;
  selectionBox?: SelectionBox;
  objectPlacement?: ObjectPlacementState;
  selectedIds: Set<string>;
  activePanel?: SidebarPanel;
  activeGravitySimulation?: GravitySimulationType;
  isGravityReversed: boolean;
  showForceRadius: boolean;
  windForce: number;
  themeMode: ThemeMode;

  select(id: string): void;
  deselect(id: string): void;
  clearSelection(): void;
  setSelection(ids: Iterable<string>): void;
  isSelected(id: string): boolean;

  setActivePanel(panel?: SidebarPanel): void;
  setObjectCounts(staticCount: number, dynamicCount: number): void;
  bumpObjectRevision(): void;
  setSimulationRunning(isRunning: boolean): void;
  setGravitySimulation(sim?: GravitySimulationType): void;
  setGravityReversed(isReversed: boolean): void;
  setShowForceRadius(isVisible: boolean): void;
  setWindForce(force: number): void;
  clearSimulations(): void;
  setThemeMode(mode: ThemeMode): void;
  setInteractionMode(mode: InteractionMode): void;
  setActivePointerMode(mode?: InteractionMode): void;
  setHoveredObject(id?: string): void;
  setInspectorScrollTarget(id?: string): void;
  setInspectorItemOpen(id: string, isOpen: boolean): void;
  toggleInspectorItems(ids: Iterable<string>): void;
  setSelectionBox(selectionBox?: SelectionBox): void;
  setObjectPlacement(type: SandboxObjectType): void;
  setObjectPlacementPosition(position?: CameraOffset): void;
  rotateObjectPlacement(angle: number): void;
  clearObjectPlacement(): void;
  setCameraState(state: {
    offset: CameraOffset;
    zoom: number;
    viewportSize: ViewportSize;
  }): void;
  setClipboardObjectCount(count: number): void;
}

export const useEditorStore = create<IEditorStore>((set, get) => ({
  staticObjectCount: 0,
  dynamicObjectCount: 0,
  objectRevision: 0,
  isSimulationRunning: true,
  interactionMode: InteractionMode.Play,
  activePointerMode: undefined,
  cameraOffset: {
    x: 0,
    y: 0,
  },
  cameraZoom: CameraConfig.zoom.initial,
  clipboardObjectCount: 0,
  viewportSize: {
    width: 0,
    height: 0,
  },
  hoveredObjectId: undefined,
  inspectorScrollTargetId: undefined,
  openInspectorItemIds: new Set<string>(),
  selectionBox: undefined,
  objectPlacement: undefined,
  selectedIds: new Set<string>(),
  activePanel: SidebarPanel.Creator,
  activeGravitySimulation: GravitySimulationType.Earth,
  isGravityReversed: false,
  showForceRadius: true,
  windForce: SimulationConfig.wind.defaultWindForce,
  themeMode: readStoredThemeMode(),

  select(id: string) {
    set((state) => ({
      selectedIds: new Set(state.selectedIds).add(id),
    }));
  },

  deselect(id: string) {
    set((state) => {
      const next = new Set(state.selectedIds);

      next.delete(id);

      return {
        selectedIds: next,
      };
    });
  },

  clearSelection() {
    set({
      selectedIds: new Set(),
    });
  },

  setSelection(ids: Iterable<string>) {
    set({
      selectedIds: new Set(ids),
    });
  },

  isSelected(id: string) {
    return get().selectedIds.has(id);
  },

  setActivePanel(panel?: SidebarPanel) {
    set({
      activePanel: panel,
    });
  },

  setObjectCounts(staticCount: number, dynamicCount: number) {
    set({
      staticObjectCount: staticCount,
      dynamicObjectCount: dynamicCount,
    });
  },

  bumpObjectRevision() {
    set((state) => ({
      objectRevision: state.objectRevision + 1,
    }));
  },

  setSimulationRunning(isRunning: boolean) {
    set({
      isSimulationRunning: isRunning,
    });
  },

  setInteractionMode(mode: InteractionMode) {
    set((state) => {
      if (state.interactionMode === mode && !state.hoveredObjectId) {
        return state;
      }

      return {
        interactionMode: mode,
        hoveredObjectId: undefined,
      };
    });
  },

  setActivePointerMode(mode?: InteractionMode) {
    set((state) => {
      if (state.activePointerMode === mode) {
        return state;
      }

      return {
        activePointerMode: mode,
      };
    });
  },

  setHoveredObject(id?: string) {
    set((state) => {
      if (state.hoveredObjectId === id) {
        return state;
      }

      return {
        hoveredObjectId: id,
      };
    });
  },

  setInspectorScrollTarget(id?: string) {
    set({
      inspectorScrollTargetId: id,
    });
  },

  setInspectorItemOpen(id, isOpen) {
    set((state) => ({
      openInspectorItemIds: (() => {
        const next = new Set(state.openInspectorItemIds);

        if (isOpen) {
          next.add(id);
        } else {
          next.delete(id);
        }

        return next;
      })(),
    }));
  },

  toggleInspectorItems(ids) {
    set((state) => {
      const next = new Set(state.openInspectorItemIds);

      for (const id of ids) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }

      return {
        openInspectorItemIds: next,
      };
    });
  },

  setSelectionBox(selectionBox) {
    set({
      selectionBox,
    });
  },

  setObjectPlacement(type) {
    set({
      objectPlacement: {
        angle: 0,
        type,
      },
    });
  },

  setObjectPlacementPosition(position) {
    set((state) => {
      if (!state.objectPlacement) {
        return state;
      }

      return {
        objectPlacement: {
          ...state.objectPlacement,
          screenPosition: position,
        },
      };
    });
  },

  rotateObjectPlacement(angle) {
    set((state) => {
      if (!state.objectPlacement) {
        return state;
      }

      return {
        objectPlacement: {
          ...state.objectPlacement,
          angle: state.objectPlacement.angle + angle,
        },
      };
    });
  },

  clearObjectPlacement() {
    set({
      objectPlacement: undefined,
    });
  },

  setCameraState(cameraState) {
    set((state) => ({
      cameraOffset: cameraState.offset,
      cameraZoom: cameraState.zoom,
      viewportSize: (() => {
        const sameWidth =
          state.viewportSize.width === cameraState.viewportSize.width;
        const sameHeight =
          state.viewportSize.height === cameraState.viewportSize.height;

        return sameWidth && sameHeight
          ? state.viewportSize
          : cameraState.viewportSize;
      })(),
    }));
  },

  setClipboardObjectCount(count) {
    set({
      clipboardObjectCount: count,
    });
  },

  setGravitySimulation(sim) {
    set({
      activeGravitySimulation: sim,
    });
  },

  setGravityReversed(isReversed) {
    set({
      isGravityReversed: isReversed,
    });
  },

  setShowForceRadius(isVisible) {
    set({
      showForceRadius: isVisible,
    });
  },

  setWindForce(force) {
    set({
      windForce: force,
    });
  },

  clearSimulations() {
    set({
      activeGravitySimulation: undefined,
      isGravityReversed: false,
      windForce: SimulationConfig.wind.defaultWindForce,
    });
  },

  setThemeMode(mode) {
    set({
      themeMode: mode,
    });
  },
}));
