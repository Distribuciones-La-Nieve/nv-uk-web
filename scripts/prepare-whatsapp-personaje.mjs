import { access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const sources = [
  ["la-nieve", "assets/personajes final-02.png"],
  ["unimarka", "assets/personajes-final-06.png"],
].map(([brand, sourcePath]) => ({
  brand,
  source: new URL(sourcePath, root),
  destination: new URL(`apps/${brand}/public/images/`, root),
  output:
    brand === "unimarka"
      ? "whatsapp-personaje-unimarka-v2.webp"
      : "whatsapp-personaje.webp",
}));

await Promise.all(
  sources.flatMap(({ source, destination }) => [
    access(source),
    access(destination),
  ])
);

// Trim transparent margins before resizing, preserving the whole character.
for (const { brand, source, destination, output } of sources) {
  const { data, info } = await sharp(fileURLToPath(source))
    .trim()
    .resize({ height: 256, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(new URL(output, destination), data);
  console.log(
    `${brand}: ${output} ${info.width}x${info.height}, ${info.size} bytes`
  );
}
