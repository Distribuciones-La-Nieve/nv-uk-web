import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alliesHtml = readFileSync(
  "apps/la-nieve/.next/server/app/aliados-comerciales.html",
  "utf8"
);
const homeHtml = readFileSync(
  "apps/la-nieve/.next/server/app/index.html",
  "utf8"
);

const expectedOrder = [
  "061",
  "057",
  "060",
  "010",
  "006",
  "004",
  "003",
  "008",
  "002",
  "012",
  "011",
  "014",
  "056",
  "016",
  "021",
  "015",
  "018",
  "022",
  "017",
  "019",
  "023",
  "020",
  "054",
  "055",
  "035",
  "036",
  "039",
  "038",
  "037",
  "043",
  "044",
  "046",
  "045",
  "047",
  "029",
  "028",
  "027",
];

const minimumOpticalScales = new Map([
  ["004", 1.5],
  ["008", 1.9],
  ["010", 1.7],
  ["014", 1.6],
  ["018", 1.9],
  ["021", 1.6],
  ["022", 1.5],
  ["023", 1.5],
]);

function renderedImages(html) {
  return html.match(/<img\b[^>]*>/g) ?? [];
}

function extractedLogoId(imageTag) {
  return imageTag.match(/logo-(\d{3})\.webp/)?.[1];
}

const allyLogoImages = renderedImages(alliesHtml).filter(extractedLogoId);
const renderedOrder = allyLogoImages.map(extractedLogoId);
const homeExtractedLogos = renderedImages(homeHtml).filter(extractedLogoId);
const allyLogoStages =
  alliesHtml.match(/<div[^>]*data-ally-logo-stage="true"[^>]*>/g) ?? [];

assert.deepEqual(
  renderedOrder,
  expectedOrder,
  "La página debe presentar las 37 marcas en el orden editorial aprobado"
);

assert.doesNotMatch(
  alliesHtml,
  /Casa comercial|>\d+ marcas</,
  "La cuadrícula no debe repetir la casa comercial ni el conteo de marcas"
);

assert.equal(
  allyLogoStages.length,
  37,
  "Cada logo debe tener una zona visual independiente del texto"
);
for (const stage of allyLogoStages) {
  assert.match(
    stage,
    /class="[^"]*\bh-28\b[^"]*\boverflow-hidden\b[^"]*"/,
    "Las ampliaciones deben quedar contenidas dentro de una zona de 112 px"
  );
}

for (const [id, minimumScale] of minimumOpticalScales) {
  const image = allyLogoImages.find((tag) => extractedLogoId(tag) === id);
  assert.ok(image, `Debe renderizarse el logo ${id}`);
  const scale = Number(image.match(/transform:scale\(([^)]+)\)/)?.[1] ?? 1);
  assert.ok(
    scale >= minimumScale,
    `El logo ${id} debe compensar su espacio interno con escala >= ${minimumScale}; recibió ${scale}`
  );
}

assert.match(
  alliesHtml,
  /data-allies-logo-grid="true"/,
  "La cuadrícula debe usar la aparición progresiva exclusiva de aliados"
);
assert.equal(
  (alliesHtml.match(/data-ally-card="true"/g) ?? []).length,
  37,
  "Cada logo debe participar individualmente en la aparición progresiva"
);
assert.equal(
  homeExtractedLogos.length,
  0,
  "El catálogo extraído no debe renderizarse en el carrusel del inicio"
);

console.log("Aliados La Nieve: orden, escala óptica y aparición verificados.");
