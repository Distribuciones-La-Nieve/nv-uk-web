import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

for (const app of ["la-nieve", "unimarka"]) {
  const output = path.resolve("apps", app, ".next", "server", "app");
  const readPage = (relativePath) =>
    readFile(path.join(output, relativePath), "utf8");
  const [
    home,
    culture,
    careers,
    legal,
    ethics,
    pqrs,
    filing,
    suppliers,
    dataPolicy,
    sitemap,
  ] = await Promise.all([
    readPage("index.html"),
    readPage("cultura.html"),
    readPage("trabaja-con-nosotros.html"),
    readPage("legal.html"),
    readPage(path.join("legal", "codigo-de-etica.html")),
    readPage(path.join("legal", "pqrs.html")),
    readPage(path.join("legal", "pqrs", "radicacion.html")),
    readPage("proveedores.html"),
    readPage(path.join("legal", "tratamiento-de-datos.html")),
    readPage("sitemap.xml.body"),
  ]);

  assert.match(home, /whatsapp-personaje/);
  assert.match(culture, /whatsapp-personaje/);
  for (const legalPage of [legal, ethics, pqrs, filing, dataPolicy]) {
    assert.doesNotMatch(legalPage, /whatsapp-personaje/);
  }

  assert.match(careers, /Demostración: no son vacantes reales/);
  assert.match(filing, /Hechos y razones/);
  assert.match(filing, /Explique su requerimiento/);
  assert.doesNotMatch(filing, /Apoderado o representante/);
  assert.doesNotMatch(filing, /Objetivo de la solicitud/);
  assert.doesNotMatch(filing, /Objeto de la solicitud/);
  assert.match(suppliers, /Quiero ser proveedor de/);
  assert.match(suppliers, /Proveedor de servicios/);
  assert.match(suppliers, /Es competencia de alguna/);
  assert.match(suppliers, /Canales directos/);
  assert.match(suppliers, /Redes sociales/);
  assert.doesNotMatch(legal, /Borrador ficticio, provisional y no aprobado/);
  assert.match(ethics, /Borrador ficticio, provisional y no aprobado/);
  assert.match(ethics, /noindex/);
  assert.doesNotMatch(sitemap, /codigo-de-etica/);

  if (app === "unimarka") {
    assert.match(culture, /translateY\(5rem\)/);
    const allies = await readPage("aliados-comerciales.html");
    const order = ["refisal.webp", "fruco.webp", "familia.webp"].map((file) =>
      allies.indexOf(file)
    );
    assert.ok(order.every((position) => position >= 0));
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      order
    );
  }
}

console.log(
  "Both builds include suppliers, ethics, careers and PQRS updates; Unimarka culture and ally ordering are present."
);
