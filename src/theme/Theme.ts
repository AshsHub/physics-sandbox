import { type IAppStorage, appStorage } from "../storage/AppStorage";

export enum ThemeMode {
  System = "System",
  Light = "Light",
  Dark = "Dark",
}

export type ResolvedTheme = ThemeMode.Light | ThemeMode.Dark;

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  if (mode === ThemeMode.System) {
    return prefersDark ? ThemeMode.Dark : ThemeMode.Light;
  }

  return mode;
}

export function readStoredThemeMode(storage = appStorage): ThemeMode {
  const value = storage.readSettings().themeMode ?? null;

  if (isThemeMode(value)) {
    return value;
  }

  return ThemeMode.System;
}

export function writeStoredThemeMode(
  mode: ThemeMode,
  storage: IAppStorage = appStorage,
): void {
  storage.updateSettings({
    themeMode: mode,
  });
}

function isThemeMode(value: string | null): value is ThemeMode {
  return (
    value === ThemeMode.System ||
    value === ThemeMode.Light ||
    value === ThemeMode.Dark
  );
}
