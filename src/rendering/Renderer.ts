import type { ISandboxEngine } from "../engine/ISandboxEngine";
import { type ISandboxObject } from "../sandbox/SandboxObject";
import { SandboxObjectFlags } from "../sandbox/SandboxObjectType";
import { useEditorStore } from "../store/editorStore";

export class Renderer {
  constructor(private engine: ISandboxEngine) {}

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    const objects = this.engine.getAllObjects();
    const editorState = useEditorStore.getState();
    const cameraOffset = editorState.cameraOffset;
    const cameraZoom = editorState.cameraZoom;

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    for (const object of objects) {
      this.drawSandboxObject(ctx, object);
    }

    ctx.restore();
  }

  private drawSandboxObject(
    ctx: CanvasRenderingContext2D,
    entity: ISandboxObject,
  ) {
    if (entity.flags & SandboxObjectFlags.Hidden) return;

    const body = entity.body;

    const vertices = body.vertices;

    ctx.beginPath();

    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();

    const selectedIds = useEditorStore.getState().selectedIds;

    ctx.fillStyle = selectedIds.has(entity.id) ? "orange" : "#444";

    ctx.fill();
  }
}
