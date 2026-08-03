import sharp from "sharp";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";

const imageExts = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".gif", ".webp"]);
const roots = [
  { key: "branding", source: "assets/branding", targetName: "branding", maxSize: 2400 },
  { key: "creative-work", source: "assets/Creative Work", targetName: "creative-work", maxSize: 2400 },
  { key: "event", source: "assets/Event", targetName: "event", maxSize: 2400 },
];
const requestedKeys = new Set(process.argv.slice(2));
const selectedRoots = requestedKeys.size > 0 ? roots.filter((root) => requestedKeys.has(root.key)) : roots;

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = join(".asset-backups", `charles-bui-assets-backup-${timestamp}`);
const tempRoot = "assets/.normalized-new-assets";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      entries.push(...walk(path));
    } else if (stats.isFile()) {
      entries.push(path);
    }
  }
  return entries;
}

function uniquePath(path, usedPaths) {
  const dir = dirname(path);
  const ext = extname(path);
  const base = basename(path, ext);
  let candidate = path;
  let index = 2;
  while (usedPaths.has(candidate) || existsSync(candidate)) {
    candidate = join(dir, `${base}-${String(index).padStart(2, "0")}${ext}`);
    index += 1;
  }
  usedPaths.add(candidate);
  return candidate;
}

async function convertImage(source, target, maxSize) {
  const ext = extname(source).toLowerCase();
  const image = sharp(source, { animated: ext === ".gif", pages: ext === ".gif" ? -1 : undefined });
  const metadata = await image.metadata();
  const animated = (metadata.pages ?? 1) > 1;

  let pipeline = image.rotate();
  if (!animated) {
    pipeline = pipeline.resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await pipeline.webp({ quality: animated ? 80 : 82, effort: 6, smartSubsample: true }).toFile(target);
}

rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(tempRoot, { recursive: true });
mkdirSync(backupRoot, { recursive: true });

for (const root of selectedRoots) {
  if (existsSync(root.source)) {
    cpSync(root.source, join(backupRoot, root.targetName), { recursive: true });
  }
}

const usedPaths = new Set();
const summary = {
  converted: 0,
  copied: 0,
  skipped: 0,
};

for (const root of selectedRoots) {
  if (!existsSync(root.source)) continue;

  for (const source of walk(root.source)) {
    const rawExt = extname(source);
    const ext = rawExt.toLowerCase();
    const rel = relative(root.source, source);
    const relDir = dirname(rel) === "." ? "" : dirname(rel);
    const targetDir = join(tempRoot, root.targetName, ...relDir.split(/[\\/]/).filter(Boolean).map(slugify));
    const base = slugify(basename(source, rawExt)) || "asset";
    const targetExt = imageExts.has(ext) ? ".webp" : ext;
    const target = uniquePath(join(targetDir, `${base}${targetExt}`), usedPaths);

    mkdirSync(dirname(target), { recursive: true });

    if (imageExts.has(ext)) {
      await convertImage(source, target, root.maxSize);
      summary.converted += 1;
    } else if (ext === ".pdf") {
      cpSync(source, target);
      summary.copied += 1;
    } else {
      summary.skipped += 1;
    }
  }
}

for (const root of selectedRoots) {
  if (existsSync(root.source)) {
    rmSync(root.source, { recursive: true, force: true });
  }
}

for (const root of selectedRoots) {
  const normalizedSource = join(tempRoot, root.targetName);
  const normalizedTarget = join("assets", root.targetName);
  if (existsSync(normalizedSource)) {
    if (existsSync(normalizedTarget)) {
      rmSync(normalizedTarget, { recursive: true, force: true });
    }
    renameSync(normalizedSource, normalizedTarget);
  }
}

rmSync(tempRoot, { recursive: true, force: true });

console.log(`Backup: ${backupRoot}`);
console.log(`Converted images: ${summary.converted}`);
console.log(`Copied PDFs: ${summary.copied}`);
console.log(`Skipped files: ${summary.skipped}`);
