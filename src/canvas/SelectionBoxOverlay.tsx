import type { SelectionBox } from "../store/editorStore";

export function SelectionBoxOverlay({
  selectionBox,
}: {
  selectionBox: SelectionBox;
}) {
  const left = Math.min(selectionBox.start.x, selectionBox.current.x);
  const top = Math.min(selectionBox.start.y, selectionBox.current.y);
  const width = Math.abs(selectionBox.current.x - selectionBox.start.x);
  const height = Math.abs(selectionBox.current.y - selectionBox.start.y);

  return (
    <div
      className="selection-box"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
}
