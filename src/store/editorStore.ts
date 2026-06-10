import { create } from "zustand";
import { type ViewportSize } from "../camera/Camera";
import { CameraConfig } from "../config/CameraConfig";
import { SimulationConfig } from "../config/SimulationConfig";
import { InteractionMode } from "../input/InteractionMode";
import { GravitySimulationType } from "../physics/SandboxSimulation";
import { SidebarPanel } from "../ui/panels/SidebarPanel";

export interface CameraOffset {
  x: number;
  y: number;
}

export interface SelectionBox {
  start: CameraOffset;
  current: CameraOffset;
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
  viewportSize: ViewportSize;
  hoveredObjectId?: string;
  inspectorScrollTargetId?: string;
  selectionBox?: SelectionBox;
  selectedIds: Set<string>;
  activePanel?: SidebarPanel;
  activeGravitySimulation?: GravitySimulationType;
  isGravityReversed: boolean;
  showForceRadius: boolean;
  windForce: number;

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
  setInteractionMode(mode: InteractionMode): void;
  setActivePointerMode(mode?: InteractionMode): void;
  setHoveredObject(id?: string): void;
  setInspectorScrollTarget(id?: string): void;
  setSelectionBox(selectionBox?: SelectionBox): void;
  setCameraState(state: {
    offset: CameraOffset;
    zoom: number;
    viewportSize: ViewportSize;
  }): void;
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
  viewportSize: {
    width: 0,
    height: 0,
  },
  hoveredObjectId: undefined,
  inspectorScrollTargetId: undefined,
  selectionBox: undefined,
  selectedIds: new Set<string>(),
  activePanel: SidebarPanel.Create,
  activeGravitySimulation: GravitySimulationType.Earth,
  isGravityReversed: false,
  showForceRadius: true,
  windForce: SimulationConfig.wind.defaultWindForce,

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

  setSelectionBox(selectionBox) {
    set({
      selectionBox,
    });
  },

  setCameraState(cameraState) {
    set({
      cameraOffset: cameraState.offset,
      cameraZoom: cameraState.zoom,
      viewportSize: cameraState.viewportSize,
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
}));
