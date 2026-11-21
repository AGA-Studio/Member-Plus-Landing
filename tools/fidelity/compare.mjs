import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const root = fileURLToPath(new URL("../../", import.meta.url));
const states = ["empty", "dialog", "member", "amount", "receipt"];
const locales = ["es", "en"];

for (const locale of locales) {
  for (const state of states) {
    const real = PNG.sync.read(await readFile(`${root}tools/captures/desk-cashier-${state}-${locale}.png`));
    const mine = PNG.sync.read(await readFile(`${root}.tmp/fidelity/mine-${state}-${locale}.png`));
    const { width, height } = real;
    const diff = new PNG({ width, height });
    const changed = pixelmatch(real.data, mine.data, diff.data, width, height, { threshold: 0.1 });
    await writeFile(`${root}.tmp/fidelity/diff-${state}-${locale}.png`, PNG.sync.write(diff));
    console.log(`${locale} ${state}: ${((changed / (width * height)) * 100).toFixed(2)} % de píxeles distintos`);
  }
}
