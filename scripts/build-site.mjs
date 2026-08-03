import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const rootFiles = [
  "index.html",
  "work.html",
  "resume.html",
  "styles.css",
  "script.js",
  "CNAME",
  "_headers",
  "_redirects",
];
const rootDirs = ["projects"];
const ignoredAssetFiles = new Set(["annual-competitive-report-may-25-final.pdf"]);

function copyAssets(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  for (const name of readdirSync(sourceDir)) {
    if (ignoredAssetFiles.has(name)) continue;
    const source = join(sourceDir, name);
    const target = join(targetDir, name);
    const stats = statSync(source);
    if (stats.isDirectory()) {
      copyAssets(source, target);
    } else if (stats.isFile()) {
      cpSync(source, target);
    }
  }
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of rootFiles) {
  if (existsSync(file)) {
    cpSync(file, join(distDir, file));
  }
}

for (const dir of rootDirs) {
  if (existsSync(dir)) {
    cpSync(dir, join(distDir, dir), { recursive: true });
  }
}

copyAssets("assets", join(distDir, "assets"));
