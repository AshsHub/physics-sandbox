import { type KeyboardEvent, useId, useRef, useState } from "react";
import { Maths } from "../../maths/Maths";
import { AppButton } from "../common/AppButton";
import { AppIcon } from "../icons/AppIcon";

interface EditableNumberProps {
  disabled?: boolean;
  label: string;
  max?: number;
  min?: number;
  step?: number;
  value: number;
  onCommit: (value: number) => void;
}

export function EditableNumber({
  disabled = false,
  label,
  max,
  min,
  step = 1,
  value,
  onCommit,
}: EditableNumberProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldCancelCommit = useRef(false);
  const [draft, setDraft] = useState(String(value));

  const normalizeValue = (nextValue: number): number =>
    Maths.roundToStep(
      Math.min(
        max ?? Number.POSITIVE_INFINITY,
        Math.max(min ?? Number.NEGATIVE_INFINITY, nextValue),
      ),
      step,
    );

  const setDraftValue = (nextValue: number) => {
    setDraft(String(normalizeValue(nextValue)));
  };

  const parsedDraft = Number(draft);
  const currentStepperValue = normalizeValue(
    Number.isFinite(parsedDraft) ? parsedDraft : value,
  );
  const canDecrease =
    !disabled && (min === undefined || currentStepperValue > min);
  const canIncrease =
    !disabled && (max === undefined || currentStepperValue < max);

  const commitValue = (nextValue: number) => {
    if (disabled) {
      return;
    }

    const normalized = normalizeValue(nextValue);

    setDraft(String(normalized));

    if (normalized !== value) {
      onCommit(normalized);
    }
  };

  const commitDraft = () => {
    if (shouldCancelCommit.current) {
      shouldCancelCommit.current = false;
      setDraft(String(value));
      return;
    }

    const parsed = Number(draft);

    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    commitValue(parsed);
  };

  return (
    <div
      className="inspector-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          commitDraft();
        }
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <label className="entity-meta-label" htmlFor={inputId}>
        {label}
      </label>

      <span className="inspector-number-control">
        <AppButton
          aria-label={`Decrease ${label}`}
          className="inspector-stepper-button"
          data-tooltip={`Decrease ${label}`}
          data-tooltip-position="bottom"
          disabled={!canDecrease}
          onClick={() => {
            inputRef.current?.focus();
            setDraftValue((Number(draft) || value) - step);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          type="button"
          variant="subtle"
        >
          -
        </AppButton>
        <input
          className="inspector-field-control"
          disabled={disabled}
          id={inputId}
          ref={inputRef}
          max={max}
          min={min}
          step={step}
          type="number"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }

            if (event.key === "Escape") {
              shouldCancelCommit.current = true;
              setDraft(String(value));
              event.currentTarget.blur();
            }
          }}
        />
        <AppButton
          aria-label={`Increase ${label}`}
          className="inspector-stepper-button"
          data-tooltip={`Increase ${label}`}
          data-tooltip-position="bottom"
          disabled={!canIncrease}
          onClick={() => {
            inputRef.current?.focus();
            setDraftValue((Number(draft) || value) + step);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          type="button"
          variant="subtle"
        >
          +
        </AppButton>
      </span>
    </div>
  );
}

interface EditableSizeProps {
  aspectLocked: boolean;
  height: number;
  max?: number;
  min?: number;
  step?: number;
  width: number;
  onCommit: (value: {
    aspectLocked: boolean;
    height: number;
    width: number;
  }) => void;
}

export function EditableSize({
  aspectLocked,
  height,
  max,
  min,
  step = 1,
  width,
  onCommit,
}: EditableSizeProps) {
  const widthInputId = useId();
  const heightInputId = useId();
  const [draft, setDraft] = useState({
    aspectLocked,
    height: String(height),
    width: String(width),
  });
  const aspectRatio = height !== 0 ? width / height : 1;

  const normalizeValue = (nextValue: number): number =>
    Maths.roundToStep(
      Math.min(
        max ?? Number.POSITIVE_INFINITY,
        Math.max(min ?? Number.NEGATIVE_INFINITY, nextValue),
      ),
      step,
    );

  const resetDraft = () => {
    setDraft({
      aspectLocked,
      height: String(height),
      width: String(width),
    });
  };

  const commitDraft = () => {
    const parsedWidth = Number(draft.width);
    const parsedHeight = Number(draft.height);

    if (!Number.isFinite(parsedWidth) || !Number.isFinite(parsedHeight)) {
      resetDraft();
      return;
    }

    const nextWidth = normalizeValue(parsedWidth);
    const nextHeight = draft.aspectLocked
      ? normalizeValue(nextWidth / aspectRatio)
      : normalizeValue(parsedHeight);

    setDraft({
      aspectLocked: draft.aspectLocked,
      height: String(nextHeight),
      width: String(nextWidth),
    });

    if (
      nextWidth !== width ||
      nextHeight !== height ||
      draft.aspectLocked !== aspectLocked
    ) {
      onCommit({
        aspectLocked: draft.aspectLocked,
        height: nextHeight,
        width: nextWidth,
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitDraft();
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      resetDraft();
      event.currentTarget.blur();
    }
  };
  const updateDraftSize = (axis: "height" | "width", value: string) => {
    const parsedValue = Number(value);

    setDraft((currentDraft) => {
      if (!currentDraft.aspectLocked || !Number.isFinite(parsedValue)) {
        return {
          ...currentDraft,
          [axis]: value,
        };
      }

      return axis === "width"
        ? {
            ...currentDraft,
            height: String(normalizeValue(parsedValue / aspectRatio)),
            width: value,
          }
        : {
            ...currentDraft,
            height: value,
            width: String(normalizeValue(parsedValue * aspectRatio)),
          };
    });
  };
  const toggleAspectLock = () => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      aspectLocked: !currentDraft.aspectLocked,
    }));
  };
  const renderSizeInput = (
    axis: "height" | "width",
    label: string,
    inputId: string,
  ) => (
    <label className="inspector-size-input" htmlFor={inputId}>
      <span>{label}</span>
      <input
        className="inspector-field-control"
        id={inputId}
        max={max}
        min={min}
        step={step}
        type="number"
        value={draft[axis]}
        onChange={(event) => updateDraftSize(axis, event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
  const aspectLockLabel = draft.aspectLocked
    ? "Unlock aspect ratio"
    : "Lock aspect ratio";

  return (
    <div
      className="inspector-field inspector-size-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          commitDraft();
        }
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="entity-meta-label">Size</span>

      <span className="inspector-size-control">
        <AppButton
          aria-label={aspectLockLabel}
          className={
            draft.aspectLocked
              ? "inspector-size-lock selected"
              : "inspector-size-lock"
          }
          data-tooltip={aspectLockLabel}
          data-tooltip-position="bottom"
          onClick={toggleAspectLock}
          type="button"
          variant="subtle"
        >
          <AppIcon name={draft.aspectLocked ? "lock" : "unlock"} />
        </AppButton>

        <span className="inspector-size-stack">
          {renderSizeInput("width", "W", widthInputId)}
          {renderSizeInput("height", "H", heightInputId)}
        </span>
      </span>
    </div>
  );
}

interface EditableColorProps {
  label: string;
  value: string;
  onCommit: (value: string) => void;
}

export function EditableColor({ label, value, onCommit }: EditableColorProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(value);

  const commit = (nextValue: string = draft) => {
    setDraft(nextValue);

    if (nextValue !== value) {
      onCommit(nextValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commit(event.currentTarget.value);
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      setDraft(value);
      event.currentTarget.blur();
    }
  };

  return (
    <div
      className="inspector-field"
      onClick={(event) => event.stopPropagation()}
    >
      <label className="entity-meta-label" htmlFor={inputId}>
        {label}
      </label>
      <span className="inspector-color-control">
        <input
          aria-label={label}
          id={inputId}
          type="color"
          value={draft}
          onBlur={() => commit()}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="inspector-field-control"
          value={draft}
          onBlur={() => commit()}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </span>
    </div>
  );
}

interface EditableSelectProps<T extends string> {
  label: string;
  options: T[];
  value: T;
  onCommit: (value: T) => void;
}

export function EditableSelect<T extends string>({
  label,
  options,
  value,
  onCommit,
}: EditableSelectProps<T>) {
  const inputId = useId();

  return (
    <div
      className="inspector-field"
      onClick={(event) => event.stopPropagation()}
    >
      <label className="entity-meta-label" htmlFor={inputId}>
        {label}
      </label>
      <select
        className="app-select inspector-field-control"
        id={inputId}
        value={value}
        onChange={(event) => onCommit(event.currentTarget.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

interface EditableOption<T extends string | number> {
  label: string;
  value: T;
}

interface EditableOptionSelectProps<T extends string | number> {
  label: string;
  options: readonly EditableOption<T>[];
  value: T;
  onCommit: (value: T) => void;
}

export function EditableOptionSelect<T extends string | number>({
  label,
  options,
  value,
  onCommit,
}: EditableOptionSelectProps<T>) {
  const inputId = useId();

  return (
    <div
      className="inspector-field"
      onClick={(event) => event.stopPropagation()}
    >
      <label className="entity-meta-label" htmlFor={inputId}>
        {label}
      </label>
      <select
        className="app-select inspector-field-control"
        id={inputId}
        value={String(value)}
        onChange={(event) => {
          const selected = options.find(
            (option) => String(option.value) === event.currentTarget.value,
          );

          if (selected) {
            onCommit(selected.value);
          }
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface EditableCheckboxProps {
  label: string;
  value: boolean;
  onCommit: (value: boolean) => void;
}

export function EditableCheckbox({
  label,
  value,
  onCommit,
}: EditableCheckboxProps) {
  const inputId = useId();

  return (
    <div
      className="inspector-field"
      onClick={(event) => event.stopPropagation()}
    >
      <label className="entity-meta-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        checked={value}
        className="inspector-checkbox-control"
        id={inputId}
        type="checkbox"
        onChange={(event) => onCommit(event.currentTarget.checked)}
      />
    </div>
  );
}

export function ReadOnlyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="entity-meta-row">
      <span className="entity-meta-label">{label}</span>
      <span className="entity-inspector-info">{value}</span>
    </div>
  );
}
