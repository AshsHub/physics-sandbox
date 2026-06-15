import type { HTMLAttributes } from "react";

export interface ShortcutKeyProps extends HTMLAttributes<HTMLElement> {
  value: string;
}

export function ShortcutKey({
  className,
  value,
  ...props
}: ShortcutKeyProps) {
  return (
    <kbd
      className={className ? `shortcut-key ${className}` : "shortcut-key"}
      {...props}
    >
      {value}
    </kbd>
  );
}
