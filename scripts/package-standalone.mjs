import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const applicationId = process.argv[2];
const supportedApplications = new Set(["la-nieve", "unimarka"]);

if (!supportedApplications.has(applicationId)) {
  console.error("Uso: node scripts/package-standalone.mjs <la-nieve|unimarka>");
  process.exit(1);
}

const applicationRoot = path.join(repositoryRoot, "apps", applicationId);
const nextOutput = path.join(applicationRoot, ".next");
const standaloneSource = path.join(nextOutput, "standalone");
const deploymentRoot = path.join(repositoryRoot, "deploy", applicationId);
const deployedApplicationRoot = path.join(
  deploymentRoot,
  "apps",
  applicationId
);

await rm(deploymentRoot, { recursive: true, force: true });
await mkdir(deploymentRoot, { recursive: true });
await cp(standaloneSource, deploymentRoot, { recursive: true });
await cp(
  path.join(applicationRoot, "public"),
  path.join(deployedApplicationRoot, "public"),
  {
    recursive: true,
  }
);
await mkdir(path.join(deployedApplicationRoot, ".next"), { recursive: true });
await cp(
  path.join(nextOutput, "static"),
  path.join(deployedApplicationRoot, ".next", "static"),
  { recursive: true }
);

const startScript = `node apps/${applicationId}/server.js`;
await writeFile(
  path.join(deploymentRoot, "package.json"),
  `${JSON.stringify(
    {
      name: `corporativo-${applicationId}-standalone`,
      private: true,
      scripts: { start: startScript },
      engines: { node: ">=20.9.0" },
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log(`[deploy] Paquete generado en deploy/${applicationId}`);
console.log(`[deploy] Inicio: ${startScript}`);
