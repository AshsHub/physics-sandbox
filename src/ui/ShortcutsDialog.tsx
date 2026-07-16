import { Fragment, useEffect, useRef } from "react";
import { useEditorStore } from "../store/editorStore";
import { AppButton } from "./common/AppButton";
import { ShortcutKey } from "./common/ShortcutKey";
import { isDialogActivationKey, trapDialogFocus } from "./dialogKeyboard";
import { AppIcon } from "./icons/AppIcon";

export interface ShortcutsDialogProps {
  onClose: () => void;
}

interface ShortcutGroups {
  title: string;
  items: { keys: string[]; label: string }[];
}

const shortcutGroups: ShortcutGroups[] = [
  {
    title: "Modes",
    items: [
      { keys: ["1"], label: "Move objects" },
      { keys: ["2"], label: "Selection mode" },
      { keys: ["3"], label: "Camera mode" },
      { keys: ["Middle Mouse"], label: "Temporary camera pan" },
    ],
  },
  {
    title: "Scene",
    items: [
      { keys: ["Space"], label: "Play or pause simulation" },
      { keys: ["F"], label: "Fit objects to view" },
      { keys: ["R"], label: "Show or hide force radius" },
      { keys: ["I"], label: "Open Inspector and toggle selected items" },
    ],
  },
  {
    title: "Selection and Clipboard",
    items: [
      { keys: ["Ctrl / Cmd", "A"], label: "Select every object" },
      { keys: ["Ctrl / Cmd", "C"], label: "Copy selected objects" },
      { keys: ["Ctrl / Cmd", "X"], label: "Cut selected objects" },
      { keys: ["Ctrl / Cmd", "V"], label: "Paste copied objects" },
      { keys: ["Ctrl / Cmd", "D"], label: "Duplicate selected objects" },
    ],
  },
  {
    title: "Placement and Camera",
    items: [
      { keys: ["Q"], label: "Rotate held object or stamp preview left" },
      { keys: ["E"], label: "Rotate held object or stamp preview right" },
      { keys: ["-"], label: "Zoom out" },
      { keys: ["+"], label: "Zoom in" },
      { keys: ["Escape"], label: "Cancel stamp placement or close dialogs" },
    ],
  },
  {
    title: "Editing",
    items: [
      { keys: ["Ctrl / Cmd", "Z"], label: "Undo command" },
      { keys: ["Ctrl / Cmd", "Shift", "Z"], label: "Redo command" },
      { keys: ["Ctrl / Cmd", "Y"], label: "Redo command" },
      { keys: ["Delete / Backspace"], label: "Delete selected objects" },
    ],
  },
];

export function ShortcutsDialog({ onClose }: ShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useEditorStore.getState().setKeyboardInputSuspended(true);
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        event.stopPropagation();
        trapDialogFocus(event, dialogRef.current);
        return;
      }

      if (isDialogActivationKey(event)) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      useEditorStore.getState().setKeyboardInputSuspended(false);
    };
  }, [onClose]);

  return (
    <div
      aria-labelledby="shortcuts-dialog-title"
      aria-modal="true"
      className="shortcuts-dialog-overlay"
      role="dialog"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        className="shortcuts-dialog"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="shortcuts-dialog-header">
          <div className="shortcuts-dialog-heading">
            <h2 id="shortcuts-dialog-title">Keyboard shortcuts</h2>
            <p>
              Fast controls for moving around the sandbox, editing objects, and
              working with command history.
            </p>
          </div>

          <AppButton
            aria-label="Close shortcuts"
            className="shortcuts-dialog-close"
            data-tooltip="Close"
            data-tooltip-position="left"
            onClick={onClose}
            type="button"
            variant="icon"
          >
            <AppIcon name="close" />
          </AppButton>
        </header>

        <div className="shortcuts-dialog-grid">
          {shortcutGroups.map((group) => (
            <section className="shortcuts-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="shortcuts-list">
                {group.items.map((item) => (
                  <div
                    className="shortcuts-row"
                    key={`${group.title}:${item.keys.join("+")}:${item.label}`}
                  >
                    <span className="shortcuts-label">{item.label}</span>
                    <span className="shortcuts-keys">
                      {item.keys.map((key, index) => (
                        <Fragment key={`${key}:${index}`}>
                          <ShortcutKey value={key} />
                          {index < item.keys.length - 1 && (
                            <span
                              className="shortcut-key-separator"
                              aria-hidden="true"
                            >
                              +
                            </span>
                          )}
                        </Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
