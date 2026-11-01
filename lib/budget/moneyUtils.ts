/**
 * Deterministic Financial Utilities for EventPilot
 *
 * All internal monetary calculations use Integer Minor Units (Paise)
 * 1 INR = 100 Paise (e.g., ₹40,000 = 4,000,000 Paise)
 * This avoids floating-point inaccuracies completely.
 */

/**
 * Converts Indian Rupees to integer Paise (minor units)
 */
export function rupeesToPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts integer Paise to Rupees
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return Math.floor(paise) / 100;
}

/**
 * Formats Paise into Indian Rupee format (e.g., ₹40,000)
 */
export function formatINR(paise: number, showDecimals: boolean = false): string {
  const rupees = paiseToRupees(paise);
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees);

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absRupees);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Safe integer addition
 */
export function addMoney(aPaise: number, bPaise: number): number {
  return Math.round(aPaise) + Math.round(bPaise);
}

/**
 * Safe integer subtraction
 */
export function subtractMoney(aPaise: number, bPaise: number): number {
  return Math.round(aPaise) - Math.round(bPaise);
}

/**
 * Safe integer percentage calculation
 */
export function percentOfMoney(paise: number, percent: number): number {
  return Math.round((paise * percent) / 100);
}
