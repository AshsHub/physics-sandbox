import { AppConfig } from "../config/AppConfig";

type LogData = Record<string, unknown> | unknown;

export class AppLogger {
  public static info(message: string, data?: LogData): void {
    if (!AppConfig.logging.enabled) {
      return;
    }

    console.info(message, data);
  }
}
