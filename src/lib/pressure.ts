const DEFAULT_MAX_WEIGHT_G = 3500;

export function forceToGrams(force: number, calibrationFactor: number = 1.0): number {
  return Math.round(force * DEFAULT_MAX_WEIGHT_G * calibrationFactor);
}

export function gramsToOunces(grams: number): number {
  return Math.round(grams * 0.03527396 * 10) / 10;
}

export function getCalibrationFactor(knownWeightG: number, measuredForce: number): number {
  if (measuredForce <= 0) return 1;
  const expectedForce = knownWeightG / DEFAULT_MAX_WEIGHT_G;
  return expectedForce / measuredForce;
}

export function saveCalibration(factor: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem("calscale_calibration", JSON.stringify(factor));
  }
}

export function loadCalibration(): number {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("calscale_calibration");
    if (saved) return JSON.parse(saved);
  }
  return 1.0;
}
