import { beforeEach, describe, expect, it } from "@jest/globals";
import { ClipboardAction } from "./ClipboardAction";
import { ClipboardConfig } from "../config/ClipboardConfig";
import { ClipboardManager } from "./ClipboardManager";
import { Vector2 } from "../maths/Vector2";
import { useEditorStore } from "../store/editorStore";
import {
  createMockApplication,
  createTestSandboxObjectSnapshot,
} from "../testing/TestDoubles.test-support";

describe("ClipboardManager", () => {
  beforeEach(() => {
    useEditorStore.getState().clearSelection();
    useEditorStore.getState().setClipboardObjectCount(0);
  });

  it("copies selected objects and pastes them with incremental offsets", () => {
    const app = createMockApplication();
    const manager = new ClipboardManager(app);

    useEditorStore.getState().setSelection(["a"]);

    expect(manager.execute(ClipboardAction.Copy)).toBe(true);
    expect(useEditorStore.getState().clipboardObjectCount).toBe(1);

    expect(manager.execute(ClipboardAction.Paste)).toBe(true);
    expect(manager.execute(ClipboardAction.Paste)).toBe(true);

    expect(app.commands.execute).toHaveBeenNthCalledWith(1, "pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset),
      snapshots: [createTestSandboxObjectSnapshot("a")],
    });
    expect(app.commands.execute).toHaveBeenNthCalledWith(2, "pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset).multiply(2),
      snapshots: [createTestSandboxObjectSnapshot("a")],
    });
  });

  it("duplicates selected objects without replacing clipboard contents", () => {
    const app = createMockApplication();
    const manager = new ClipboardManager(app);

    useEditorStore.getState().setSelection(["a"]);
    expect(manager.execute(ClipboardAction.Copy)).toBe(true);

    useEditorStore.getState().setSelection(["b"]);
    expect(manager.execute(ClipboardAction.Duplicate)).toBe(true);
    expect(manager.execute(ClipboardAction.Paste)).toBe(true);

    expect(app.commands.execute).toHaveBeenNthCalledWith(1, "pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset),
      snapshots: [createTestSandboxObjectSnapshot("b")],
    });
    expect(app.commands.execute).toHaveBeenNthCalledWith(2, "pasteObjects", {
      offset: new Vector2(ClipboardConfig.pasteOffset),
      snapshots: [createTestSandboxObjectSnapshot("a")],
    });
    expect(useEditorStore.getState().clipboardObjectCount).toBe(1);
  });

  it("cuts copied objects by deleting the same target ids", () => {
    const app = createMockApplication();
    const manager = new ClipboardManager(app);

    expect(manager.execute(ClipboardAction.Cut, ["a", "b"])).toBe(true);

    expect(app.commands.execute).toHaveBeenCalledWith("deleteObject", {
      ids: ["a", "b"],
    });
    expect(useEditorStore.getState().clipboardObjectCount).toBe(2);
  });

  it("fails paste when there is no clipboard content", () => {
    const app = createMockApplication();
    const manager = new ClipboardManager(app);

    expect(manager.execute(ClipboardAction.Paste)).toBe(false);
    expect(app.commands.execute).not.toHaveBeenCalled();
  });
});
