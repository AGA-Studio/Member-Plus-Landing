const size = 21;

function hash(seed: string): () => number {
  let state = 2166136261;
  for (const char of seed) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function isFinder(x: number, y: number): boolean {
  const inCorner = (cx: number, cy: number) => x >= cx && x < cx + 8 && y >= cy && y < cy + 8;
  return inCorner(0, 0) || inCorner(size - 8, 0) || inCorner(0, size - 8);
}

function finderModule(x: number, y: number, cx: number, cy: number): boolean {
  const dx = x - cx;
  const dy = y - cy;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return false;
  const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
  const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
  return ring || core;
}

export type QrShape = { size: number; path: string };

export function buildQrShape(seed: string): QrShape {
  const next = hash(seed);
  let path = "";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dark = isFinder(x, y)
        ? finderModule(x, y, 0, 0) || finderModule(x, y, size - 7, 0) || finderModule(x, y, 0, size - 7)
        : next() > 0.52;
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { size, path };
}
