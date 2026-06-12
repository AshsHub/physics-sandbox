import type { IApplication } from "../../application/IApplication";
import { ClipboardAction } from "../../input/ClipboardAction";
import { useEditorStore } from "../../store/editorStore";
import { AppButton } from "../common/AppButton";
import { AppIcon } from "../icons/AppIcon";

export interface ClipboardContextSubmenuProps {
  app: IApplication;
  targetIds?: string[];
  onClose: () => void;
}

export function ClipboardContextSubmenu({
  app,
  targetIds,
  onClose,
}: ClipboardContextSubmenuProps) {
  const clipboardObjectCount = useEditorStore((s) => s.clipboardObjectCount);
  const selectedCount = useEditorStore((s) => s.selectedIds.size);
  const targetCount = targetIds?.length ?? 0;
  const canUseSelection = targetCount > 0 || selectedCount > 0;
  const hasClipboardContent = clipboardObjectCount > 0;

  const runAction = (action: () => boolean) => {
    if (action()) {
      onClose();
    }
  };

  return (
    <div className="canvas-context-menu-submenu">
      <AppButton
        className="canvas-context-menu-submenu-trigger"
        type="button"
        variant="ghost"
      >
        <span>Clipboard</span>
        <AppIcon className="context-submenu-icon" name="chevron" />
      </AppButton>

      <div className="canvas-context-menu-subpanel clipboard-context-subpanel">
        <AppButton
          className="object-context-menu-action"
          disabled={!canUseSelection}
          onClick={() =>
            runAction(() =>
              app.executeClipboardAction(ClipboardAction.Copy, targetIds),
            )
          }
          onPointerDown={(event) => event.preventDefault()}
          variant="ghost"
        >
          Copy
        </AppButton>
        <AppButton
          className="object-context-menu-action"
          disabled={!canUseSelection}
          onClick={() =>
            runAction(() =>
              app.executeClipboardAction(ClipboardAction.Cut, targetIds),
            )
          }
          onPointerDown={(event) => event.preventDefault()}
          variant="ghost"
        >
          Cut
        </AppButton>
        <AppButton
          className="object-context-menu-action"
          disabled={!hasClipboardContent}
          onClick={() =>
            runAction(() => app.executeClipboardAction(ClipboardAction.Paste))
          }
          onPointerDown={(event) => event.preventDefault()}
          variant="ghost"
        >
          Paste
        </AppButton>
        <AppButton
          className="object-context-menu-action"
          disabled={!canUseSelection}
          onClick={() =>
            runAction(() =>
              app.executeClipboardAction(ClipboardAction.Duplicate, targetIds),
            )
          }
          onPointerDown={(event) => event.preventDefault()}
          variant="ghost"
        >
          Duplicate
        </AppButton>
      </div>
    </div>
  );
}
