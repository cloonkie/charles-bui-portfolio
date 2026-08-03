import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
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
const rootDirs = ["assets", "projects"];

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
