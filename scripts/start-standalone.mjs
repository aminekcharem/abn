import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");
const staticSourceDir = path.join(rootDir, ".next", "static");
const staticTargetDir = path.join(standaloneDir, ".next", "static");
const publicSourceDir = path.join(rootDir, "public");
const publicTargetDir = path.join(standaloneDir, "public");

if (!existsSync(serverEntry)) {
  console.error("Standalone server entry was not found at", serverEntry);
  process.exit(1);
}

if (existsSync(staticSourceDir)) {
  mkdirSync(path.dirname(staticTargetDir), { recursive: true });
  rmSync(staticTargetDir, { recursive: true, force: true });
  cpSync(staticSourceDir, staticTargetDir, { recursive: true });
}

if (existsSync(publicSourceDir)) {
  rmSync(publicTargetDir, { recursive: true, force: true });
  cpSync(publicSourceDir, publicTargetDir, { recursive: true });
}

const result = spawnSync(process.execPath, [serverEntry], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
