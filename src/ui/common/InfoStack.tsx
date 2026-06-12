import type { ReactNode } from "react";

export interface InfoStackProps {
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}

export function InfoStack({ className, description, title }: InfoStackProps) {
  const classes = ["info-stack", className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="info-stack-title">{title}</span>
      {description !== undefined && (
        <span className="info-stack-description">{description}</span>
      )}
    </span>
  );
}
