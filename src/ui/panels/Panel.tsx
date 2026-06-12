// Panel.tsx

import type { ReactNode } from "react";
import { AppButton } from "../common/AppButton";
import { AppIcon } from "../icons/AppIcon";

export interface PanelProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}

export function Panel({ title, onClose, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>

        {onClose && (
          <AppButton
            aria-label={`Close ${title} panel`}
            className="panel-close-button"
            data-tooltip="Close panel"
            data-tooltip-position="left"
            onClick={onClose}
            type="button"
            variant="icon"
          >
            <AppIcon name="close" />
          </AppButton>
        )}
      </div>

      {children}
    </section>
  );
}
