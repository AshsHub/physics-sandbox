import type { CSSProperties } from "react";
import { iconAssets } from "./IconAssets";
import type { AppIconProps, AppIconName } from "./IconTypes";

export type { AppIconName };

export function AppIcon({ className, name, style, ...props }: AppIconProps) {
  const iconUrl = iconAssets.get(name) ?? "";
  const iconStyle = {
    WebkitMask: `url("${iconUrl}") center / contain no-repeat`,
    mask: `url("${iconUrl}") center / contain no-repeat`,
    ...style,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={className ? `app-icon ${className}` : "app-icon"}
      style={iconStyle}
      {...props}
    />
  );
}
