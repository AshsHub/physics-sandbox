export class Maths {
  public static clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  public static roundToStep(value: number, step: number): number {
    const decimalPlaces = Math.max(0, `${step}`.split(".")[1]?.length ?? 0);

    return Number(value.toFixed(decimalPlaces));
  }
}
