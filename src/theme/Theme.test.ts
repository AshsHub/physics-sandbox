import { describe, expect, it, jest } from "@jest/globals";
import { AppStorage } from "../storage/AppStorage";
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
    const adapter = {
      getItem: jest.fn(() => JSON.stringify({ themeMode: ThemeMode.Light })),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    } as unknown as Storage;
    const storage = new AppStorage(adapter);

    expect(readStoredThemeMode(storage)).toBe(ThemeMode.Light);

    const invalidAdapter = {
      getItem: jest.fn(() => JSON.stringify({ themeMode: "Blue" })),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    } as unknown as Storage;
    const invalidStorage = new AppStorage(invalidAdapter);

    expect(readStoredThemeMode(invalidStorage)).toBe(ThemeMode.System);
  });

  it("writes selected theme modes to storage", () => {
    const adapter = {
      getItem: jest.fn(() => JSON.stringify({ futureSetting: true })),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    } as unknown as Storage;
    const storage = new AppStorage(adapter);

    writeStoredThemeMode(ThemeMode.Dark, storage);

    expect(adapter.setItem).toHaveBeenCalledWith(
      "physics-sandbox-settings",
      JSON.stringify({
        futureSetting: true,
        themeMode: ThemeMode.Dark,
      }),
    );
  });
});
