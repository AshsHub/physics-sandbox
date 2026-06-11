import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AppButton({
  children,
  disabled = false,
  onClick,
  type = "button",
  ...props
}: AppButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <button {...props} disabled={disabled} onClick={handleClick} type={type}>
      {children}
    </button>
  );
}
