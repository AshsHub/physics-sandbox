// Panel.tsx

import type { ReactNode } from "react";

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
          <button
            aria-label={`Close ${title} panel`}
            className="panel-close-button"
            data-tooltip="Close panel"
            data-tooltip-position="left"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        )}
      </div>

      {children}
    </section>
  );
}
