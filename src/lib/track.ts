export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function smooth(value: number): number {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export type Keys = ReadonlyArray<readonly [number, number]>;

export function track(progress: number, keys: Keys): number {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return 0;
  if (progress <= first[0]) return first[1];
  for (let index = 1; index < keys.length; index += 1) {
    const end = keys[index];
    const start = keys[index - 1];
    if (!end || !start) continue;
    if (progress <= end[0]) {
      const local = smooth((progress - start[0]) / (end[0] - start[0]));
      return start[1] + (end[1] - start[1]) * local;
    }
  }
  return last[1];
}
