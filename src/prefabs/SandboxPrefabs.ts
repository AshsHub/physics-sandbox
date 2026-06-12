import type { ISandboxObjectMetadata } from "../sandbox/SandboxObject";
import type {
  SandboxObjectFlags,
  SandboxObjectType,
} from "../sandbox/SandboxObjectType";
import { platformStackPrefab } from "./definitions/PlatformStackPrefab";

export interface SandboxPrefabOffset {
  x: number;
  y: number;
}

export interface SandboxPrefabObject {
  angle: number;
  flags: SandboxObjectFlags;
  metadata: ISandboxObjectMetadata;
  name: string;
  offset: SandboxPrefabOffset;
  type: SandboxObjectType;
}

export interface SandboxPrefab {
  description?: string;
  id: string;
  name: string;
  objects: SandboxPrefabObject[];
}

export const sandboxPrefabs = [platformStackPrefab];
