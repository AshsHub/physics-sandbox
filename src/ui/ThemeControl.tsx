import { ThemeMode } from "../theme/Theme";
import { useEditorStore } from "../store/editorStore";

const themeOptions = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
] as const;

// TODO: Replace with Icons
const themeInitials: Record<ThemeMode, string> = {
  [ThemeMode.System]: "S",
  [ThemeMode.Light]: "L",
  [ThemeMode.Dark]: "D",
};

export function ThemeControl() {
  const themeMode = useEditorStore((s) => s.themeMode);
  const setThemeMode = useEditorStore((s) => s.setThemeMode);
  const cycleThemeMode = () => {
    const currentIndex = themeOptions.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeOptions.length;

    setThemeMode(themeOptions[nextIndex]);
  };

  return (
    <button
      className="theme-control"
      aria-label={`Theme: ${themeMode}`}
      data-tooltip={`Theme: ${themeMode}`}
      data-tooltip-position="right"
      onClick={cycleThemeMode}
      type="button"
    >
      {themeInitials[themeMode]}
    </button>
  );
}
