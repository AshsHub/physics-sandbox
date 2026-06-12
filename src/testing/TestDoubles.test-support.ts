import { jest } from "@jest/globals";
import type { IApplication } from "../application/IApplication";
import type { Camera } from "../camera/Camera";
import type { SandboxEngine } from "../engine/SandboxEngine";
import { Vector2 } from "../maths/Vector2";
import {
  SandboxObjectBorderStyle,
  SandboxObjectCollisionRole,
  SandboxObjectRadialForceMode,
  type ISandboxObjectMetadata,
  type ISandboxObjectSnapshot,
} from "../sandbox/SandboxObject";
import {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";

export const testSandboxObjectMetadata: ISandboxObjectMetadata = {
  width: 100,
  height: 50,
  color: "#ffffff",
  opacity: 1,
  borderColor: "#000000",
  borderWidth: 0,
  borderStyle: SandboxObjectBorderStyle.None,
  label: "",
  description: "",
  mass: 1,
  bounce: 0,
  friction: 0,
  radialForceMode: SandboxObjectRadialForceMode.None,
  radialForceRadius: 0,
  radialForceStrength: 0,
  collisionRole: SandboxObjectCollisionRole.Victim,
};

export function createTestSandboxObjectSnapshot(
  id: string,
  overrides: Partial<ISandboxObjectSnapshot> = {},
): ISandboxObjectSnapshot {
  return {
    id,
    name: `Object ${id.toUpperCase()}`,
    type: SandboxObjectType.Box,
    position: new Vector2(id === "a" ? 10 : 20, id === "a" ? 30 : 40),
    angle: 0,
    flags: SandboxObjectFlags.None,
    metadata: testSandboxObjectMetadata,
    ...overrides,
  };
}

export function createMockApplication(
  snapshots: Record<string, ISandboxObjectSnapshot> = {
    a: createTestSandboxObjectSnapshot("a"),
    b: createTestSandboxObjectSnapshot("b"),
  },
): IApplication {
  return {
    commands: {
      execute: jest.fn(() => ({ success: true })),
    },
    engine: {
      generateSnapshot: jest.fn((id: string) => snapshots[id]),
    },
  } as unknown as IApplication;
}

export function createMockCamera(): Camera {
  return {
    getViewportCenterPosition: jest.fn(() => new Vector2(500, 300)),
  } as unknown as Camera;
}

export function createMockSandboxEngine(
  overrides: Partial<Record<keyof SandboxEngine, unknown>> = {},
): SandboxEngine {
  return {
    createObject: jest.fn(),
    getObjectPosition: jest.fn(),
    createObjectFromSnapshot: jest.fn(),
    destroyObject: jest.fn(),
    generateSnapshot: jest.fn(),
    ...overrides,
  } as unknown as SandboxEngine;
}
