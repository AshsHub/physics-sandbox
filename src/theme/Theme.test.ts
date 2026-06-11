import { describe, expect, it, jest } from "@jest/globals";
import {
  readStoredThemeMode,
  resolveThemeMode,
  ThemeMode,
  writeStoredThemeMode,
} from "./Theme";

describe("Theme", () => {
  it("resolves system mode from the browser preference", () => {
    expect(resolveThemeMode(ThemeMode.System, true)).toBe(ThemeMode.Dark);
    expect(resolveThemeMode(ThemeMode.System, false)).toBe(ThemeMode.Light);
  });

  it("uses explicit light and dark modes directly", () => {
    expect(resolveThemeMode(ThemeMode.Light, true)).toBe(ThemeMode.Light);
    expect(resolveThemeMode(ThemeMode.Dark, false)).toBe(ThemeMode.Dark);
  });

  it("reads valid stored theme modes and falls back to system", () => {
    const storage = {
      getItem: jest.fn(() => ThemeMode.Light),
    } as unknown as Storage;

    expect(readStoredThemeMode(storage)).toBe(ThemeMode.Light);

    const invalidStorage = {
      getItem: jest.fn(() => "Blue"),
    } as unknown as Storage;

    expect(readStoredThemeMode(invalidStorage)).toBe(ThemeMode.System);
  });

  it("writes selected theme modes to storage", () => {
    const storage = {
      setItem: jest.fn(),
    } as unknown as Storage;

    writeStoredThemeMode(ThemeMode.Dark, storage);

    expect(storage.setItem).toHaveBeenCalledWith(
      "physics-sandbox-theme-mode",
      ThemeMode.Dark,
    );
  });
});
