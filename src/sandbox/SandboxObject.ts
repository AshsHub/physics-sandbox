import Matter from "matter-js";
import type {
  SandboxObjectFlags,
  SandboxObjectType,
} from "./SandboxObjectType";

export interface ISandboxObject {
  id: string;
  name: string;
  type: SandboxObjectType;
  body: Matter.Body;

  flags: SandboxObjectFlags;
}
