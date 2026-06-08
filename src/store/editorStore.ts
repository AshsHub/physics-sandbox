import { create } from "zustand";
import { InteractionMode } from "../input/InteractionMode";
import { GravitySimulationType } from "../physics/SandboxSimulation";
import { SidebarPanel } from "../ui/panels/SidebarPanel";

export interface CameraOffset {
  x: number;
  y: number;
}

const MIN_CAMERA_ZOOM = 0.2;
const MAX_CAMERA_ZOOM = 4;

export interface IEditorStore {
  staticObjectCount: number;
  dynamicObjectCount: number;
  objectRevision: number;
  isSimulationRunning: boolean;
  interactionMode: InteractionMode;
  activePointerMode?: InteractionMode;
  cameraOffset: CameraOffset;
  cameraZoom: number;
  hoveredObjectId?: string;
  selectedIds: Set<string>;
  activePanel?: SidebarPanel;
  activeGravitySimulation?: GravitySimulationType;
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
  setWindForce(force: number): void;
  clearSimulations(): void;
  setInteractionMode(mode: InteractionMode): void;
  setActivePointerMode(mode?: InteractionMode): void;
  setHoveredObject(id?: string): void;
  panCamera(delta: CameraOffset): void;
  zoomCameraAt(screenPosition: CameraOffset, zoomFactor: number): void;
  setCameraView(offset: CameraOffset, zoom: number): void;
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
  cameraZoom: 1,
  hoveredObjectId: undefined,
  selectedIds: new Set<string>(),
  activePanel: SidebarPanel.Create,
  activeGravitySimulation: GravitySimulationType.Earth,
  windForce: 0,

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

  panCamera(delta: CameraOffset) {
    set((state) => ({
      cameraOffset: {
        x: state.cameraOffset.x + delta.x,
        y: state.cameraOffset.y + delta.y,
      },
    }));
  },

  zoomCameraAt(screenPosition: CameraOffset, zoomFactor: number) {
    set((state) => {
      const nextZoom = clamp(
        state.cameraZoom * zoomFactor,
        MIN_CAMERA_ZOOM,
        MAX_CAMERA_ZOOM,
      );

      if (nextZoom === state.cameraZoom) {
        return state;
      }

      const worldX =
        (screenPosition.x - state.cameraOffset.x) / state.cameraZoom;
      const worldY =
        (screenPosition.y - state.cameraOffset.y) / state.cameraZoom;

      return {
        cameraZoom: nextZoom,
        cameraOffset: {
          x: screenPosition.x - worldX * nextZoom,
          y: screenPosition.y - worldY * nextZoom,
        },
      };
    });
  },

  setCameraView(offset: CameraOffset, zoom: number) {
    set({
      cameraOffset: offset,
      cameraZoom: clamp(zoom, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM),
    });
  },

  setGravitySimulation(sim) {
    set({
      activeGravitySimulation: sim,
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
      windForce: 0,
    });
  },
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
