import type { AppIconName } from "./IconTypes";

const iconModules = import.meta.glob("../../assets/icons/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const iconAssets = new Map<AppIconName, string>();

for (const [path, source] of Object.entries(iconModules)) {
  const iconName = path.match(/([^/\\]+)\.svg$/)?.[1];

  if (iconName) {
    iconAssets.set(iconName as AppIconName, source);
  }
}
