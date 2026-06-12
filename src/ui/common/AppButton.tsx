import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

export type AppButtonVariant =
  | "accent"
  | "default"
  | "ghost"
  | "icon"
  | "subtle";

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: AppButtonVariant;
}

export function AppButton({
  children,
  className,
  disabled = false,
  onClick,
  type = "button",
  variant = "default",
  ...props
}: AppButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };
  const buttonClassName = ["app-button", `app-button-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      className={buttonClassName}
      disabled={disabled}
      onClick={handleClick}
      type={type}
    >
      {children}
    </button>
  );
}
