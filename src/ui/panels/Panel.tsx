// Panel.tsx

import type { ReactNode } from "react";
import { AppButton } from "../common/AppButton";

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
          >
            x
          </AppButton>
        )}
      </div>

      {children}
    </section>
  );
}
