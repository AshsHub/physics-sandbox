import { getFocusableElements } from "./focusUtils";

export function isDialogActivationKey(event: KeyboardEvent): boolean {
  return (
    (event.key === "Enter" || event.key === " ") &&
    event.target instanceof HTMLButtonElement
  );
}

export function trapDialogFocus(
  event: KeyboardEvent,
  dialogElement: HTMLElement | null,
): void {
  if (!dialogElement) {
    return;
  }

  const focusableElements = getFocusableElements(dialogElement);

  if (focusableElements.length === 0) {
    event.preventDefault();
    dialogElement.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
