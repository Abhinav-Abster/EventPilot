/**
 * Parses YYYY-MM-DD to a local Date object without UTC timezone drift
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds or subtracts days from a date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

/**
 * Calculates day difference between two date strings (target - base)
 */
export function daysBetween(baseDateStr: string, targetDateStr: string): number {
  const base = parseISODate(baseDateStr);
  const target = parseISODate(targetDateStr);
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
