/** The value, or a test failure that names what was missing. */
export function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Expected ${what} to exist`);
  return value;
}
