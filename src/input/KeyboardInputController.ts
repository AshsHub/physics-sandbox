export type KeyboardAction = (modifiers: KeyModifiers) => void;

interface KeyAction {
  action: KeyboardAction;
  repeat: boolean;
}

export enum KeyModifiers {
  None = 0,
  Control = 1 << 0,
  Meta = 1 << 1,
  Shift = 1 << 2,
  Alt = 1 << 3,
}

export class KeyboardInputController {
  private readonly pressedKeys = new Set<string>();
  private readonly keyActions = new Map<string, KeyAction[]>();

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    this.keyDown(event);
  };

  private readonly handleKeyUp = (event: KeyboardEvent) => {
    this.keyUp(event);
  };

  public init(): void {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    this.pressedKeys.clear();
    this.keyActions.clear();
  }

  public registerAction(
    keys: string[],
    action: KeyboardAction,
    options: { repeat?: boolean } = {},
  ): void {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase();
      const keyAction = {
        action,
        repeat: options.repeat ?? false,
      };

      const actions = this.keyActions.get(normalizedKey);

      if (actions) {
        actions.push(keyAction);
      } else {
        this.keyActions.set(normalizedKey, [keyAction]);
      }
    }
  }

  public keyDown(event: KeyboardEvent): void {
    if (this.isTypingTarget(event.target)) {
      return;
    }

    const normalizedKey = event.key.toLowerCase();
    const wasPressed = this.pressedKeys.has(normalizedKey);
    this.pressedKeys.add(normalizedKey);
    const actions = this.keyActions.get(normalizedKey);

    if (!actions) {
      return;
    }

    const modifiers = getKeyModifiers(event);

    actions.forEach(({ action, repeat }) => {
      if (wasPressed && !repeat) {
        return;
      }

      action(modifiers);
    });
  }

  public keyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key.toLowerCase());
  }

  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    );
  }
}

export function hasPrimaryModifier(modifiers: KeyModifiers): boolean {
  return (modifiers & (KeyModifiers.Control | KeyModifiers.Meta)) !== 0;
}

function getKeyModifiers(event: KeyboardEvent): KeyModifiers {
  let modifiers = KeyModifiers.None;

  if (event.shiftKey) modifiers |= KeyModifiers.Shift;
  if (event.ctrlKey) modifiers |= KeyModifiers.Control;
  if (event.metaKey) modifiers |= KeyModifiers.Meta;
  if (event.altKey) modifiers |= KeyModifiers.Alt;

  return modifiers;
}
