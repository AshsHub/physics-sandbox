import { useState, type ReactNode } from "react";

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
      <button
        className="inspector-section-header"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span className="inspector-section-title">{title}</span>
        <span
          className="chevron"
        >
          <span
            className="chevron-icon"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            v
          </span>
        </span>
      </button>

      {isOpen && <div className="inspector-section-content">{children}</div>}
    </section>
  );
}
