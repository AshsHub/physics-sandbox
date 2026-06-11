import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Camera } from "../camera/Camera";
import { Commands } from "./Commands";
import { Vector2 } from "../maths/Vector2";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import {
  createMockCamera,
  createMockSandboxEngine,
  createTestSandboxObjectSnapshot,
  testSandboxObjectMetadata,
} from "../testing/TestDoubles.test-support";

describe("Commands", () => {
  let consoleInfo: jest.SpiedFunction<typeof console.info>;

  beforeEach(() => {
    consoleInfo = jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfo.mockRestore();
  });

  it("executes, undoes, redoes, and logs a successful create command", () => {
    const position = new Vector2(10, 20);
    const object = {
      ...createTestSandboxObjectSnapshot("object-1", {
        name: "Object 1",
        position,
      }),
      body: {
        angle: 0,
      },
    };
    const engine = createMockSandboxEngine({
      createObject: jest.fn(() => object),
      getObjectPosition: jest.fn(() => position.clone()),
    });
    const camera = createMockCamera();
    const commands = new Commands(engine, camera);

    expect(
      commands.execute("createObject", {
        type: SandboxObjectType.Box,
        position,
      }),
    ).toEqual({ success: true });

    expect(engine.createObject).toHaveBeenCalledWith(
      position,
      SandboxObjectType.Box,
      undefined,
    );

    expect(commands.undo()).toEqual({ success: true });
    expect(engine.destroyObject).toHaveBeenCalledWith("object-1");

    expect(commands.redo()).toEqual({ success: true });
    expect(engine.createObjectFromSnapshot).toHaveBeenCalledWith({
      id: "object-1",
      name: "Object 1",
      type: SandboxObjectType.Box,
      position,
      angle: 0,
      flags: SandboxObjectFlags.None,
      metadata: testSandboxObjectMetadata,
    });

    expect(commands.getLog()).toMatchObject([
      {
        commandId: 1,
        command: "createObject",
        action: "execute",
        success: true,
      },
      {
        commandId: 1,
        command: "createObject",
        action: "undo",
        success: true,
      },
      {
        commandId: 1,
        command: "createObject",
        action: "redo",
        success: true,
      },
    ]);
  });

  it("does not add failed commands to history", () => {
    const engine = createMockSandboxEngine({
      createSnapshot: jest.fn(() => undefined),
    });
    const commands = new Commands(engine, {} as Camera);

    expect(
      commands.execute("deleteObject", {
        ids: ["missing-object"],
      }),
    ).toEqual({
      success: false,
      message: "No matching objects were found to delete.",
    });

    expect(commands.undo()).toEqual({
      success: false,
      message: "No command to undo.",
    });
    expect(commands.getLog()).toMatchObject([
      {
        commandId: 1,
        command: "deleteObject",
        action: "execute",
        success: false,
      },
    ]);
  });
});
