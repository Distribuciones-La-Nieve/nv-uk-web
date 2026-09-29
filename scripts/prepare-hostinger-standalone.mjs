import { cp, access, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = process.argv[2];

if (app !== "la-nieve" && app !== "unimarka") {
  throw new Error("Uso: prepare-hostinger-standalone.mjs <la-nieve|unimarka>");
}

const appRoot = path.join(root, "apps", app);
const standaloneApp = path.join(appRoot, ".next", "standalone", "apps", app);
const entrypoint = path.join(standaloneApp, "server.js");
await access(entrypoint);

// Dependencies are hoisted to .next/standalone/node_modules in this monorepo.
// Fail during build rather than serving a deployment that cannot resolve React.
const requireFromServer = createRequire(entrypoint);
requireFromServer.resolve("next");
requireFromServer.resolve("react");
requireFromServer.resolve("react-dom/server");

await cp(path.join(appRoot, "public"), path.join(standaloneApp, "public"), {
  recursive: true,
});
await mkdir(path.join(standaloneApp, ".next"), { recursive: true });
await cp(
  path.join(appRoot, ".next", "static"),
  path.join(standaloneApp, ".next", "static"),
  { recursive: true }
);

console.log(`[hostinger] Servidor y recursos listos: apps/${app}/server.js`);
