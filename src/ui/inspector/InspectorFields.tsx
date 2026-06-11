import { useId, useRef, useState } from "react";
import { Maths } from "../../maths/Maths";

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
        <button
          aria-label={`Decrease ${label}`}
          className="inspector-stepper-button"
          data-tooltip={`Decrease ${label}`}
          data-tooltip-position="bottom"
          disabled={disabled}
          onClick={() => {
            inputRef.current?.focus();
            setDraftValue((Number(draft) || value) - step);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          type="button"
        >
          -
        </button>
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
        <button
          aria-label={`Increase ${label}`}
          className="inspector-stepper-button"
          data-tooltip={`Increase ${label}`}
          data-tooltip-position="bottom"
          disabled={disabled}
          onClick={() => {
            inputRef.current?.focus();
            setDraftValue((Number(draft) || value) + step);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          type="button"
        >
          +
        </button>
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

  const commit = () => {
    if (draft !== value) {
      onCommit(draft);
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
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
        />
        <input
          className="inspector-field-control"
          value={draft}
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
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
        className="inspector-field-control"
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
        className="inspector-field-control"
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
