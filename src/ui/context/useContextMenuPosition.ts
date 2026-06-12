import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Maths } from "../../maths/Maths";
import type { Vector2 } from "../../maths/Vector2";
import { useEditorStore } from "../../store/editorStore";

const CONTEXT_MENU_VIEWPORT_PADDING = 8;
const CONTEXT_SUBMENU_GAP = 8;
const CONTEXT_SUBMENU_TOP_OFFSET = -6;

type ContextMenuStyle = CSSProperties & {
  [customProperty: `--${string}`]: string | number | undefined;
};

export interface ContextMenuPosition {
  classNameSuffix: string;
  style: ContextMenuStyle;
}

interface SubmenuMeasurement {
  size: {
    height: number;
    width: number;
  };
  submenu: HTMLElement;
}

export function useContextMenuPosition(
  ref: RefObject<HTMLElement | null>,
  position: Vector2,
): ContextMenuPosition {
  const viewportWidth = useEditorStore((state) => state.viewportSize.width);
  const viewportHeight = useEditorStore((state) => state.viewportSize.height);
  const [menuPosition, setMenuPosition] = useState<ContextMenuPosition>({
    classNameSuffix: "",
    style: {
      left: position.x,
      top: position.y,
    },
  });

  useLayoutEffect(() => {
    const updatePosition = () => {
      const menu = ref.current;

      if (!menu) {
        return;
      }

      const bounds = menu.getBoundingClientRect();
      const submenuMeasurements = getSubmenuMeasurements(menu);
      const largestSubpanelWidth = getLargestSubpanelWidth(submenuMeasurements);
      const maxLeft =
        window.innerWidth - bounds.width - CONTEXT_MENU_VIEWPORT_PADDING;
      const maxTop =
        window.innerHeight - bounds.height - CONTEXT_MENU_VIEWPORT_PADDING;
      const left = Maths.clamp(
        position.x,
        CONTEXT_MENU_VIEWPORT_PADDING,
        Math.max(CONTEXT_MENU_VIEWPORT_PADDING, maxLeft),
      );
      const top = Maths.clamp(
        position.y,
        CONTEXT_MENU_VIEWPORT_PADDING,
        Math.max(CONTEXT_MENU_VIEWPORT_PADDING, maxTop),
      );
      const wouldOverflowRight =
        left + bounds.width + CONTEXT_SUBMENU_GAP + largestSubpanelWidth >
        window.innerWidth - CONTEXT_MENU_VIEWPORT_PADDING;
      const canOpenLeft =
        left - CONTEXT_SUBMENU_GAP - largestSubpanelWidth >=
        CONTEXT_MENU_VIEWPORT_PADDING;

      const style: ContextMenuStyle = {
        left,
        top,
      };

      positionSubmenus(submenuMeasurements, top);

      setMenuPosition({
        classNameSuffix: wouldOverflowRight && canOpenLeft ? " open-left" : "",
        style,
      });
    };

    updatePosition();
  }, [position, ref, viewportHeight, viewportWidth]);

  return menuPosition;
}

function getSubpanelTop({
  submenuTop,
  subpanelHeight,
}: {
  submenuTop: number;
  subpanelHeight: number;
}): number {
  const minTop = CONTEXT_MENU_VIEWPORT_PADDING - submenuTop;
  const maxTop =
    window.innerHeight -
    CONTEXT_MENU_VIEWPORT_PADDING -
    submenuTop -
    subpanelHeight;

  return Maths.clamp(CONTEXT_SUBMENU_TOP_OFFSET, minTop, maxTop);
}

function positionSubmenus(
  submenuMeasurements: SubmenuMeasurement[],
  menuTop: number,
): void {
  const subpanelMaxHeight =
    window.innerHeight - CONTEXT_MENU_VIEWPORT_PADDING * 2;

  for (const { size, submenu } of submenuMeasurements) {
    const subpanelHeight = Math.min(size.height, subpanelMaxHeight);
    const submenuTop = menuTop + submenu.offsetTop;
    const subpanelTop = getSubpanelTop({
      submenuTop,
      subpanelHeight,
    });

    submenu.style.setProperty(
      "--context-subpanel-max-height",
      `${subpanelMaxHeight}px`,
    );
    submenu.style.setProperty("--context-subpanel-top", `${subpanelTop}px`);
  }
}

function getLargestSubpanelWidth(
  submenuMeasurements: SubmenuMeasurement[],
): number {
  return submenuMeasurements.reduce(
    (largestWidth, { size }) => Math.max(largestWidth, size.width),
    0,
  );
}

function getSubmenuMeasurements(menu: HTMLElement): SubmenuMeasurement[] {
  return Array.from(
    menu.querySelectorAll<HTMLElement>(".canvas-context-menu-submenu"),
  ).flatMap((submenu) => {
    const subpanel = submenu.querySelector<HTMLElement>(
      ".canvas-context-menu-subpanel",
    );

    return subpanel
      ? [
          {
            size: measureSubpanel(subpanel),
            submenu,
          },
        ]
      : [];
  });
}

function measureSubpanel(subpanel: HTMLElement): {
  height: number;
  width: number;
} {
  const previousDisplay = subpanel.style.display;
  const previousPointerEvents = subpanel.style.pointerEvents;
  const previousVisibility = subpanel.style.visibility;

  subpanel.style.display = "flex";
  subpanel.style.pointerEvents = "none";
  subpanel.style.visibility = "hidden";

  try {
    const bounds = subpanel.getBoundingClientRect();

    return {
      height: bounds.height,
      width: bounds.width,
    };
  } finally {
    subpanel.style.display = previousDisplay;
    subpanel.style.pointerEvents = previousPointerEvents;
    subpanel.style.visibility = previousVisibility;
  }
}
