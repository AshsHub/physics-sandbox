import { Commands } from "../commands/Commands";
import { Camera } from "../camera/Camera";
import { InputManager } from "../input/InputManager";
import type { Vector2 } from "../maths/Vector2";
import { Renderer } from "../rendering/Renderer";
import { useEditorStore } from "../store/editorStore";
import { EventBus } from "../events/EventBus";
import { SandboxEngine } from "../engine/SandboxEngine";
import type { IApplication } from "./IApplication";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";

export class Application implements IApplication {
  public readonly camera: Camera;
  public readonly engine: SandboxEngine;
  public readonly renderer: Renderer;
  public readonly commands: Commands;
  public readonly inputManager: InputManager;
  public readonly events = new EventBus();

  private readonly unsubscribers: (() => void)[] = [];

  public constructor() {
    this.camera = new Camera(undefined, (view) => {
      useEditorStore.getState().setCameraState(view);
    });
    this.engine = new SandboxEngine(this.events, this.camera);
    this.commands = new Commands(this.engine, this.camera);
    this.inputManager = new InputManager(this);
    this.renderer = new Renderer(this.engine);
  }

  public init(): void {
    this.registerEvents();
    this.engine.init();
    this.inputManager.init();
  }

  public destroy(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());

    this.unsubscribers.length = 0;

    this.inputManager.destroy();
    this.engine.destroy();
  }

  public registerEvents(): void {
    const updateCounts = () => {
      const objects = this.engine.getAllObjects();

      const staticCount = objects.filter(
        (o) => o.flags & SandboxObjectFlags.Static,
      ).length;

      const dynamicCount = objects.length - staticCount;

      useEditorStore.getState().setObjectCounts(staticCount, dynamicCount);
    };

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectCreated", () => {
        updateCounts();
        useEditorStore.getState().bumpObjectRevision();
      }),
    );

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectDestroyed", ({ id }) => {
        const editorStoreState = useEditorStore.getState();

        if (editorStoreState.selectedIds.has(id)) {
          editorStoreState.deselect(id);
        }

        updateCounts();
        useEditorStore.getState().bumpObjectRevision();
      }),
    );

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectChanged", () => {
        updateCounts();
        useEditorStore.getState().bumpObjectRevision();
      }),
    );
  }

  public fitView(): void {
    const visibleBounds = this.engine
      .getAllObjects()
      .filter((object) => (object.flags & SandboxObjectFlags.Hidden) === 0)
      .map((object) => object.body.bounds);

    this.camera.fitBoundsFromCollection(visibleBounds);
  }

  update(width: number, height: number) {
    this.engine.update();
    this.engine.cullObjectsOutsideViewport(width, height);
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.renderer.render(ctx, width, height);
  }

  pointerDown(pos: Vector2, button: number) {
    this.inputManager.pointerDown(pos, button);
  }

  pointerMove(pos: Vector2) {
    this.inputManager.pointerMove(pos);
  }

  pointerWheel(deltaY: number, pos: Vector2) {
    this.inputManager.pointerWheel(deltaY, pos);
  }

  pointerUp() {
    this.inputManager.pointerUp();
  }

  pointerLeave() {
    this.inputManager.pointerLeave();
  }
}
