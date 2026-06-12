import { useEditorStore } from "../store/editorStore";
import { isTypingTarget } from "./InputTarget";

export type KeyboardAction = (
  modifiers: KeyModifiers,
  event: KeyboardEvent,
) => void;

interface KeyAction {
  action: KeyboardAction;
  preventDefault: boolean;
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
  private readonly _pressedKeys = new Set<string>();
  private readonly _keyActions = new Map<string, KeyAction[]>();

  private readonly _handleKeyDown = (event: KeyboardEvent) => {
    this.keyDown(event);
  };

  private readonly _handleKeyUp = (event: KeyboardEvent) => {
    this.keyUp(event);
  };

  public init(): void {
    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  public destroy(): void {
    window.removeEventListener("keydown", this._handleKeyDown);
    window.removeEventListener("keyup", this._handleKeyUp);

    this._pressedKeys.clear();
    this._keyActions.clear();
  }

  public registerAction(
    keys: string[],
    action: KeyboardAction,
    options: { preventDefault?: boolean; repeat?: boolean } = {},
  ): void {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase();
      const keyAction = {
        action,
        preventDefault: options.preventDefault ?? false,
        repeat: options.repeat ?? false,
      };

      const actions = this._keyActions.get(normalizedKey);

      if (actions) {
        actions.push(keyAction);
      } else {
        this._keyActions.set(normalizedKey, [keyAction]);
      }
    }
  }

  public keyDown(event: KeyboardEvent): void {
    if (useEditorStore.getState().isKeyboardInputSuspended) {
      return;
    }

    if (isTypingTarget(event.target)) {
      return;
    }

    const normalizedKey = event.key.toLowerCase();
    const wasPressed = this._pressedKeys.has(normalizedKey);
    this._pressedKeys.add(normalizedKey);
    const actions = this._keyActions.get(normalizedKey);

    if (!actions) {
      return;
    }

    const modifiers = this._getKeyModifiers(event);

    actions.forEach(({ action, preventDefault, repeat }) => {
      if (wasPressed && !repeat) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      action(modifiers, event);
    });
  }

  public keyUp(event: KeyboardEvent): void {
    this._pressedKeys.delete(event.key.toLowerCase());
  }

  public isKeyPressed(key: string): boolean {
    return this._pressedKeys.has(key.toLowerCase());
  }

  private _getKeyModifiers(event: KeyboardEvent): KeyModifiers {
    let modifiers = KeyModifiers.None;

    if (event.shiftKey) modifiers |= KeyModifiers.Shift;
    if (event.ctrlKey) modifiers |= KeyModifiers.Control;
    if (event.metaKey) modifiers |= KeyModifiers.Meta;
    if (event.altKey) modifiers |= KeyModifiers.Alt;

    return modifiers;
  }
}
