/**
 * Generiert alle PWA-/Favicon-Größen aus den SVG-Quellen.
 * Ausführen: npm run icons
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");
const publicDir = join(root, "public");

const iconSource = readFileSync(join(iconsDir, "icon-source.svg"));
const maskableSource = readFileSync(join(iconsDir, "maskable-source.svg"));

const pngSizes = [
  { file: "favicon-16x16.png", size: 16 },
  { file: "favicon-32x32.png", size: 32 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192x192.png", size: 192 },
  { file: "icon-512x512.png", size: 512 },
];

async function renderPng(buffer, size, outPath) {
  await sharp(buffer, { density: 300 })
    .resize(size, size, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function main() {
  for (const { file, size } of pngSizes) {
    const out = join(iconsDir, file);
    await renderPng(iconSource, size, out);
    console.log(`✓ ${file}`);
  }

  await sharp(maskableSource, { density: 300 })
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(iconsDir, "maskable-icon-512x512.png"));
  console.log("✓ maskable-icon-512x512.png");

  const favicon16 = readFileSync(join(iconsDir, "favicon-16x16.png"));
  const favicon32 = readFileSync(join(iconsDir, "favicon-32x32.png"));
  const ico = await pngToIco([favicon16, favicon32]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  console.log("✓ favicon.ico");

  // Legacy-Aliase entfernen / aktualisieren
  await renderPng(iconSource, 512, join(iconsDir, "icon-512.png"));
  await renderPng(iconSource, 192, join(iconsDir, "icon-192.png"));
  console.log("✓ Legacy-Aliase icon-512.png, icon-192.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
