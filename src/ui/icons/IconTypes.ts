import type { HTMLAttributes } from "react";

export type AppIconName =
  | "black-hole"
  | "box"
  | "camera"
  | "chevron"
  | "circle"
  | "close"
  | "fit-view"
  | "inspector"
  | "lock"
  | "minus"
  | "moon"
  | "monitor"
  | "oval"
  | "pause"
  | "pentagon"
  | "platform"
  | "play"
  | "plus"
  | "ramp-left"
  | "ramp-right"
  | "selection"
  | "shortcuts"
  | "sun"
  | "triangle"
  | "trash"
  | "unlock"
  | "wall"
  | "white-hole";

export interface AppIconProps extends HTMLAttributes<HTMLSpanElement> {
  name: AppIconName;
}
