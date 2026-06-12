import type { ReactNode } from "react";

export interface PrefabCardProps {
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}

export function PrefabCard({ className, description, title }: PrefabCardProps) {
  const classes = ["prefab-card", className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="prefab-card-title">{title}</span>
      {description !== undefined && (
        <span className="prefab-card-description">{description}</span>
      )}
    </span>
  );
}
