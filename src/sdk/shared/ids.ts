export type OneOrMany<T> = T | T[];

export function asArray<T>(value: OneOrMany<T>): T[] {
  return Array.isArray(value) ? value : [value];
}
