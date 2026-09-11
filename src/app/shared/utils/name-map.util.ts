/**
 * Builds a lookup map of id -> display name from a list of entities.
 * Several controllers (appointments, treatment-plans, clinical-records) need
 * to resolve a related patient/dentist/treatment name for display purposes;
 * this helper replaces the near-identical `createXNameMap` methods that used
 * to be duplicated in each controller.
 */
export function toNameMap<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getName: (item: T) => string
): Map<string, string> {
  return new Map(items.map((item) => [getId(item), getName(item)]));
}
