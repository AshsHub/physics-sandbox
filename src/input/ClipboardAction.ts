export enum ClipboardAction {
  Copy = "Copy",
  Cut = "Cut",
  Paste = "Paste",
  Duplicate = "Duplicate",
}

export type ClipboardSelectionAction = Exclude<
  ClipboardAction,
  ClipboardAction.Paste
>;
