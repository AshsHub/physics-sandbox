export enum ThemeMode {
  System = "System",
  Light = "Light",
  Dark = "Dark",
}

export type ResolvedTheme = ThemeMode.Light | ThemeMode.Dark;

const THEME_STORAGE_KEY = "physics-sandbox-theme-mode";

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  if (mode === ThemeMode.System) {
    return prefersDark ? ThemeMode.Dark : ThemeMode.Light;
  }

  return mode;
}

export function readStoredThemeMode(storage = getThemeStorage()): ThemeMode {
  const value = storage?.getItem(THEME_STORAGE_KEY) ?? null;

  return isThemeMode(value) ? value : ThemeMode.System;
}

export function writeStoredThemeMode(
  mode: ThemeMode,
  storage = getThemeStorage(),
): void {
  storage?.setItem(THEME_STORAGE_KEY, mode);
}

function isThemeMode(value: string | null): value is ThemeMode {
  return (
    value === ThemeMode.System ||
    value === ThemeMode.Light ||
    value === ThemeMode.Dark
  );
}

function getThemeStorage(): Storage | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
