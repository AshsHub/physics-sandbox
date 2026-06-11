import { describe, expect, it, jest } from "@jest/globals";
import { ThemeMode } from "../theme/Theme";
import { AppStorage, type IStorageAdapter } from "./AppStorage";

const appStorageKey = "physics-sandbox-settings";

describe("AppStorage", () => {
  it("reads stored settings from the root settings object", () => {
    const adapter: IStorageAdapter = {
      getItem: jest.fn(() => JSON.stringify({ themeMode: ThemeMode.Dark })),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    const storage = new AppStorage(adapter);

    expect(storage.readSettings()).toEqual({
      themeMode: ThemeMode.Dark,
    });
    expect(adapter.getItem).toHaveBeenCalledWith(appStorageKey);
  });

  it("writes settings to a single root settings object", () => {
    const adapter: IStorageAdapter = {
      getItem: jest.fn(() => null),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    const storage = new AppStorage(adapter);

    storage.writeSettings({
      themeMode: ThemeMode.Light,
    });

    expect(adapter.setItem).toHaveBeenCalledWith(
      appStorageKey,
      JSON.stringify({ themeMode: ThemeMode.Light }),
    );
  });

  it("updates settings without removing existing settings", () => {
    const adapter: IStorageAdapter = {
      getItem: jest.fn(() =>
        JSON.stringify({
          futureSetting: true,
        }),
      ),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    const storage = new AppStorage(adapter);

    expect(
      storage.updateSettings({
        themeMode: ThemeMode.System,
      }),
    ).toEqual({
      futureSetting: true,
      themeMode: ThemeMode.System,
    });
    expect(adapter.setItem).toHaveBeenCalledWith(
      appStorageKey,
      JSON.stringify({
        futureSetting: true,
        themeMode: ThemeMode.System,
      }),
    );
  });

  it("falls back to empty settings when storage reads fail", () => {
    const adapter: IStorageAdapter = {
      getItem: jest.fn(() => {
        throw new Error("blocked");
      }),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    const storage = new AppStorage(adapter);

    expect(storage.readSettings()).toEqual({});
  });

  it("falls back to empty settings for invalid stored json", () => {
    const adapter: IStorageAdapter = {
      getItem: jest.fn(() => "{"),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    const storage = new AppStorage(adapter);

    expect(storage.readSettings()).toEqual({});
  });
});
