/** Coerces a react-hook-form numeric field value to a finite number, or null
 * if the field is empty / not yet a valid number (RHF's `valueAsNumber`
 * yields NaN, not undefined, for an empty number input). */
export function numOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isNaN(n) ? null : n;
}
