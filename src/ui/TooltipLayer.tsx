import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TooltipConfig } from "../config/TooltipConfig";
import { Maths } from "../maths/Maths";

type TooltipPosition = "bottom" | "left" | "right" | "top";

interface ActiveTooltip {
  formatted: FormattedTooltipText;
  target: HTMLElement;
  preferredPosition: TooltipPosition;
  targetRect: DOMRect;
}

interface TooltipPlacement {
  left: number;
  top: number;
  position: TooltipPosition;
  secondaryLeft?: number;
  secondaryTop?: number;
}

interface FormattedTooltipText {
  label: string;
  secondary?: string;
  shortcut?: string;
}

export function TooltipLayer() {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipSecondaryRef = useRef<HTMLDivElement>(null);
  const activeTargetRef = useRef<HTMLElement | undefined>(undefined);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>();
  const [placement, setPlacement] = useState<TooltipPlacement>();

  useEffect(() => {
    const showTooltip = (target: HTMLElement) => {
      const text = target.dataset.tooltip;

      if (!text) {
        return;
      }

      activeTargetRef.current?.removeAttribute("aria-describedby");
      target.setAttribute("aria-describedby", TooltipConfig.id);
      activeTargetRef.current = target;

      setActiveTooltip({
        formatted: formatTooltipText(text),
        target,
        preferredPosition: getTooltipPosition(target),
        targetRect: target.getBoundingClientRect(),
      });
    };

    const hideTooltip = () => {
      activeTargetRef.current?.removeAttribute("aria-describedby");
      activeTargetRef.current = undefined;
      setActiveTooltip(undefined);
      setPlacement(undefined);
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = getTooltipTarget(event.target);

      if (target) {
        showTooltip(target);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = getTooltipTarget(event.target);

      if (!target) {
        return;
      }

      if (
        event.relatedTarget instanceof Node &&
        target.contains(event.relatedTarget)
      ) {
        return;
      }

      hideTooltip();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = getTooltipTarget(event.target);

      if (target) {
        showTooltip(target);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = getTooltipTarget(event.target);

      if (!target) {
        return;
      }

      if (
        event.relatedTarget instanceof Node &&
        target.contains(event.relatedTarget)
      ) {
        return;
      }

      hideTooltip();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideTooltip();
      }
    };

    window.addEventListener("pointerover", handlePointerOver);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);

    return () => {
      activeTargetRef.current?.removeAttribute("aria-describedby");
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", hideTooltip, true);
      window.removeEventListener("resize", hideTooltip);
    };
  }, []);

  useLayoutEffect(() => {
    if (!activeTooltip || !tooltipRef.current) {
      return;
    }

    setPlacement(
      calculateTooltipPlacement(
        activeTooltip.targetRect,
        tooltipRef.current.getBoundingClientRect(),
        activeTooltip.preferredPosition,
        tooltipSecondaryRef.current?.getBoundingClientRect(),
      ),
    );
  }, [activeTooltip]);

  if (!activeTooltip) {
    return null;
  }

  return (
    <div
      className={`app-tooltip ${placement ? `app-tooltip-${placement.position}` : ""}`}
      id={TooltipConfig.id}
      ref={tooltipRef}
      role="tooltip"
      style={{
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        visibility: placement ? "visible" : "hidden",
      }}
    >
      <span>{activeTooltip.formatted.label}</span>
      {activeTooltip.formatted.shortcut && (
        <kbd className="app-tooltip-key">
          {activeTooltip.formatted.shortcut}
        </kbd>
      )}
      {activeTooltip.formatted.secondary && (
        <div
          className="app-tooltip-secondary"
          ref={tooltipSecondaryRef}
          style={{
            left: placement?.secondaryLeft ?? 0,
            top: placement?.secondaryTop ?? 0,
            visibility: placement ? "visible" : "hidden",
          }}
        >
          {activeTooltip.formatted.secondary}
        </div>
      )}
    </div>
  );
}

function formatTooltipText(text: string): FormattedTooltipText {
  const shortcutMatch = text.match(/\s+\(([^)]+)\)$/);
  const shortcut = shortcutMatch?.[1];
  const withoutShortcut = shortcutMatch
    ? text.slice(0, shortcutMatch.index).trim()
    : text;
  const secondaryMatch = withoutShortcut.match(/\s+\[([^\]]+)\]$/);
  const secondary = secondaryMatch?.[1];
  const label = secondaryMatch
    ? withoutShortcut.slice(0, secondaryMatch.index).trim()
    : withoutShortcut;

  if (!shortcut && !secondary) {
    return {
      label: text,
    };
  }

  return {
    label,
    secondary,
    shortcut,
  };
}

function getTooltipTarget(target: EventTarget | null): HTMLElement | undefined {
  if (!(target instanceof Element)) {
    return;
  }

  const tooltipTarget = target.closest<HTMLElement>("[data-tooltip]");

  return tooltipTarget ?? undefined;
}

function getTooltipPosition(target: HTMLElement): TooltipPosition {
  const position = target.dataset.tooltipPosition;

  if (
    position === "bottom" ||
    position === "left" ||
    position === "right" ||
    position === "top"
  ) {
    return position;
  }

  return "bottom";
}

function calculateTooltipPlacement(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: TooltipPosition,
  secondaryRect?: DOMRect,
): TooltipPlacement {
  const position = choosePosition(targetRect, tooltipRect, preferredPosition);
  const unclamped = getUnclampedPlacement(targetRect, tooltipRect, position);
  const left = Maths.clamp(
    unclamped.left,
    TooltipConfig.viewportPadding,
    window.innerWidth - tooltipRect.width - TooltipConfig.viewportPadding,
  );
  const top = Maths.clamp(
    unclamped.top,
    TooltipConfig.viewportPadding,
    window.innerHeight - tooltipRect.height - TooltipConfig.viewportPadding,
  );
  const secondaryPlacement = secondaryRect
    ? getTooltipSecondaryPlacement(
        {
          left,
          top,
        },
        tooltipRect,
        secondaryRect,
        position,
      )
    : undefined;

  return {
    left,
    top,
    position,
    secondaryLeft: secondaryPlacement?.left,
    secondaryTop: secondaryPlacement?.top,
  };
}

function choosePosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: TooltipPosition,
): TooltipPosition {
  const fits = {
    bottom:
      targetRect.bottom + TooltipConfig.gap + tooltipRect.height <=
      window.innerHeight - TooltipConfig.viewportPadding,
    left:
      targetRect.left - TooltipConfig.gap - tooltipRect.width >=
      TooltipConfig.viewportPadding,
    right:
      targetRect.right + TooltipConfig.gap + tooltipRect.width <=
      window.innerWidth - TooltipConfig.viewportPadding,
    top:
      targetRect.top - TooltipConfig.gap - tooltipRect.height >=
      TooltipConfig.viewportPadding,
  };

  if (fits[preferredPosition]) {
    return preferredPosition;
  }

  const fallbackOrder: TooltipPosition[] = ["bottom", "right", "left", "top"];

  return fallbackOrder.find((position) => fits[position]) ?? preferredPosition;
}

function getUnclampedPlacement(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
): { left: number; top: number } {
  switch (position) {
    case "left":
      return {
        left: targetRect.left - tooltipRect.width - TooltipConfig.gap,
        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
      };
    case "right":
      return {
        left: targetRect.right + TooltipConfig.gap,
        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
      };
    case "top":
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        top: targetRect.top - tooltipRect.height - TooltipConfig.gap,
      };
    case "bottom":
    default:
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        top: targetRect.bottom + TooltipConfig.gap,
      };
  }
}

function getTooltipSecondaryPlacement(
  tooltipPosition: { left: number; top: number },
  tooltipRect: DOMRect,
  secondaryRect: DOMRect,
  position: TooltipPosition,
): { left: number; top: number } {
  const gap = TooltipConfig.gap;
  const unclamped = (() => {
    switch (position) {
      case "left":
        return {
          left: tooltipPosition.left - secondaryRect.width - gap,
          top: tooltipPosition.top,
        };
      case "right":
        return {
          left: tooltipPosition.left + tooltipRect.width + gap,
          top: tooltipPosition.top,
        };
      case "top":
        return {
          left: tooltipPosition.left,
          top: tooltipPosition.top - secondaryRect.height - gap,
        };
      case "bottom":
      default:
        return {
          left: tooltipPosition.left,
          top: tooltipPosition.top + tooltipRect.height + gap,
        };
    }
  })();

  return {
    left: Maths.clamp(
      unclamped.left,
      TooltipConfig.viewportPadding,
      window.innerWidth - secondaryRect.width - TooltipConfig.viewportPadding,
    ),
    top: Maths.clamp(
      unclamped.top,
      TooltipConfig.viewportPadding,
      window.innerHeight - secondaryRect.height - TooltipConfig.viewportPadding,
    ),
  };
}
