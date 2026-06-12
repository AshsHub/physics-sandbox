import { ThemeMode } from "../theme/Theme";
import { useEditorStore } from "../store/editorStore";
import { AppButton } from "./common/AppButton";
import { AppIcon, type AppIconName } from "./icons/AppIcon";

const themeOptions = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
] as const;

const themeIcons: Record<ThemeMode, AppIconName> = {
  [ThemeMode.System]: "monitor",
  [ThemeMode.Light]: "sun",
  [ThemeMode.Dark]: "moon",
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
    <AppButton
      className="theme-control"
      aria-label={`Theme: ${themeMode}`}
      data-tooltip={`Theme: ${themeMode}`}
      data-tooltip-position="right"
      onClick={cycleThemeMode}
      type="button"
      variant="icon"
    >
      <AppIcon name={themeIcons[themeMode]} />
    </AppButton>
  );
}
