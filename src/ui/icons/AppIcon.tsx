import { iconAssets } from "./IconAssets";
import type { AppIconName, AppIconProps } from "./IconTypes";

export type { AppIconName };

export function AppIcon({
  name,
  isMask = false,
  className,
  style,
  ...props
}: AppIconProps) {
  const iconUrl = iconAssets.get(name) ?? "";

  if (isMask) {
    return (
      <span
        aria-hidden="true"
        className={className ? `app-icon ${className}` : "app-icon"}
        style={{
          backgroundImage: `url("${iconUrl}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          ...style,
        }}
        {...props}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={className ? `app-icon ${className}` : "app-icon"}
      style={{
        WebkitMask: `url("${iconUrl}") center / contain no-repeat`,
        mask: `url("${iconUrl}") center / contain no-repeat`,
        ...style,
      }}
      {...props}
    />
  );
}
