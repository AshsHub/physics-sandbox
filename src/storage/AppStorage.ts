import type { ThemeMode } from "../theme/Theme";

const APP_STORAGE_KEY = "physics-sandbox-settings";

export interface AppSettings {
  [key: string]: unknown;
  clearSceneBeforePrefabSpawn?: boolean;
  themeMode?: ThemeMode;
}

export interface IStorageAdapter {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface IAppStorage {
  clearSettings(): void;
  readSettings(): AppSettings;
  updateSettings(settings: Partial<AppSettings>): AppSettings;
  writeSettings(settings: AppSettings): void;
}

export class AppStorage implements IAppStorage {
  public constructor(
    private readonly _adapter = this._getLocalStorageAdapter(),
  ) {}

  public readSettings(): AppSettings {
    try {
      const storedValue = this._adapter?.getItem(APP_STORAGE_KEY);

      if (!storedValue) {
        return {};
      }

      const parsed = JSON.parse(storedValue) as unknown;

      return this._isAppSettings(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  public writeSettings(settings: AppSettings): void {
    try {
      this._adapter?.setItem(APP_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      return;
    }
  }

  public updateSettings(settings: Partial<AppSettings>): AppSettings {
    const nextSettings = {
      ...this.readSettings(),
      ...settings,
    };

    this.writeSettings(nextSettings);

    return nextSettings;
  }

  public clearSettings(): void {
    try {
      this._adapter?.removeItem(APP_STORAGE_KEY);
    } catch {
      return;
    }
  }

  private _isAppSettings(value: unknown): value is AppSettings {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private _getLocalStorageAdapter(): IStorageAdapter | undefined {
    try {
      return typeof localStorage === "undefined" ? undefined : localStorage;
    } catch {
      return undefined;
    }
  }
}

export const appStorage = new AppStorage();
