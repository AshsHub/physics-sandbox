import { Commands } from "../commands/Commands";
import { InputManager } from "../input/InputManager";
import type { Vector2 } from "../maths/Vector2";
import { Renderer } from "../rendering/Renderer";
import { useEditorStore } from "../store/editorStore";
import { EventBus } from "../events/EventBus";
import { SandboxEngine } from "../engine/SandboxEngine";
import type { IApplication } from "./IApplication";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";

export class Application implements IApplication {
  public readonly engine: SandboxEngine;
  public readonly renderer: Renderer;
  public readonly commands: Commands;
  public readonly inputManager: InputManager;
  public readonly events = new EventBus();

  private readonly unsubscribers: (() => void)[] = [];

  public constructor() {
    this.engine = new SandboxEngine(this.events);
    this.commands = new Commands(this.engine);
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
        (o) => o.flags & SandboxObjectFlags.Locked,
      ).length;

      const dynamicCount = objects.length - staticCount;

      useEditorStore.getState().setObjectCounts(staticCount, dynamicCount);
    };

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectCreated", () => {
        updateCounts();
      }),
    );

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectDestroyed", ({ id }) => {
        const editorStoreState = useEditorStore.getState();

        if (editorStoreState.selectedIds.has(id)) {
          editorStoreState.deselect(id);
        }

        updateCounts();
      }),
    );

    this.unsubscribers.push(
      this.events.subscribe("sandboxObjectChanged", () => {
        useEditorStore.getState().bumpObjectRevision();
      }),
    );
  }

  update() {
    this.engine.update();
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

  pointerUp() {
    this.inputManager.pointerUp();
  }

  pointerLeave() {
    this.inputManager.pointerLeave();
  }
}
