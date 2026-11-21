import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../../", import.meta.url));
const names = ["panel", "customers", "file", "tiers", "movements", "receipt", "card"];
const locales = ["es", "en"];
const format = process.argv[2] ?? "webp";

await mkdir(`${root}public/screens`, { recursive: true });
let total = 0;
for (const locale of locales) {
  for (const name of names) {
    const input = `${root}tools/captures/hd-${name}-${locale}.png`;
    const output = `${root}public/screens/${name}-${locale}.${format}`;
    const pipeline = sharp(input).resize({ width: 2560 });
    const info =
      format === "avif"
        ? await pipeline.avif({ quality: 62, effort: 6 }).toFile(output)
        : await pipeline.webp({ quality: 90, effort: 6 }).toFile(output);
    total += info.size;
  }
}
console.log(`${format}: ${(total / 1024 / 1024).toFixed(2)} MB (${names.length * locales.length} archivos)`);
