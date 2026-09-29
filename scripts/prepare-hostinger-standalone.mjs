import { cp, access, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = process.argv[2];

if (app !== "la-nieve" && app !== "unimarka") {
  throw new Error("Uso: prepare-hostinger-standalone.mjs <la-nieve|unimarka>");
}

const appRoot = path.join(root, "apps", app);
const standaloneRoot = path.join(appRoot, ".next", "standalone");
const standaloneApp = path.join(standaloneRoot, "apps", app);
const entrypoint = path.join(standaloneApp, "server.js");
await access(entrypoint);

// Dependencies are hoisted to .next/standalone/node_modules in this monorepo.
// Fail during build rather than serving a deployment that cannot resolve React.
const requireFromServer = createRequire(entrypoint);
requireFromServer.resolve("next");
requireFromServer.resolve("react");
requireFromServer.resolve("react-dom/server");

// Hostinger's Next.js preset auto-detects a server.js inside standalone. In a
// monorepo, the generated entry is nested deeper than react-dom/server.js, so
// expose an unambiguous entry at the root of the output it publishes.
const hostingerEntry = path.join(standaloneRoot, "server.js");
await writeFile(
  hostingerEntry,
  `require("./apps/${app}/server.js");\n`,
  "utf8"
);

await cp(path.join(appRoot, "public"), path.join(standaloneApp, "public"), {
  recursive: true,
});
await mkdir(path.join(standaloneApp, ".next"), { recursive: true });
await cp(
  path.join(appRoot, ".next", "static"),
  path.join(standaloneApp, ".next", "static"),
  { recursive: true }
);

console.log(`[hostinger] Servidor y recursos listos: server.js -> apps/${app}/server.js`);
