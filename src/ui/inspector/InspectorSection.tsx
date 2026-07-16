import { useState, type ReactNode } from "react";
import { AppButton } from "../common/AppButton";
import { AppIcon } from "../icons/AppIcon";

export function InspectorSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="inspector-section">
      <AppButton
        aria-expanded={isOpen}
        className="inspector-section-header"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        type="button"
        variant="ghost"
      >
        <span className="inspector-section-title">{title}</span>
        <span className="chevron">
          <span
            className="chevron-icon"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            <AppIcon name="chevron" />
          </span>
        </span>
      </AppButton>

      {isOpen && <div className="inspector-section-content">{children}</div>}
    </section>
  );
}
