/*
 * Rebuild Structure — scripts/build-static.mjs
 * Cloudflare Pagesに公開する静的ファイルだけを dist/ へコピーするビルドスクリプト。
 * Node.js標準機能のみを使用（npmパッケージ不要）。
 * 実行方法: node scripts/build-static.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// 公開対象（allowlist）：これ以外はdistへコピーしない
const ROOT_FILES = ["index.html", "privacy.html", "404.html"];
const ROOT_DIRS = ["css", "js", "assets", "works"];

// dist生成後に混入していないことを確認する公開禁止エントリ
const FORBIDDEN_ENTRIES = [
  "docs",
  "README.md",
  ".gitignore",
  "scripts",
  ".git",
  ".env",
];

const MAX_FILE_BYTES = 25 * 1024 * 1024; // Cloudflare Pages: 1ファイル25MiB制限

function log(message) {
  console.log(message);
}

function fail(message) {
  console.error(`\n✗ ビルド失敗: ${message}\n`);
  process.exit(1);
}

function cleanAndCreateDist() {
  log("[1/6] 既存の dist/ を確認しています…");
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
    log("  既存の dist/ を削除しました。");
  } else {
    log("  既存の dist/ はありませんでした。");
  }
  fs.mkdirSync(DIST, { recursive: true });
  log("  dist/ を新規作成しました。\n");
}

function copyAllowlist() {
  log("[2/6] 公開対象ファイル・フォルダをコピーしています…");

  for (const file of ROOT_FILES) {
    const src = path.join(ROOT, file);
    if (!fs.existsSync(src)) {
      fail(`公開対象ファイルが見つかりません: ${file}`);
    }
    fs.copyFileSync(src, path.join(DIST, file));
    log(`  コピー: ${file}`);
  }

  for (const dir of ROOT_DIRS) {
    const src = path.join(ROOT, dir);
    if (!fs.existsSync(src)) {
      fail(`公開対象フォルダが見つかりません: ${dir}/`);
    }
    fs.cpSync(src, path.join(DIST, dir), { recursive: true });
    log(`  コピー: ${dir}/`);
  }
  log("");
}

function walkFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function toDistRelativePosix(fullPath) {
  return path.relative(DIST, fullPath).split(path.sep).join("/");
}

function checkFileSizes(files) {
  log("[3/6] ファイルサイズを確認しています（Cloudflare Pages 25MiB制限）…");

  let maxFile = null;
  let maxSize = -1;
  const oversized = [];

  for (const file of files) {
    const size = fs.statSync(file).size;
    if (size > maxSize) {
      maxSize = size;
      maxFile = file;
    }
    if (size > MAX_FILE_BYTES) {
      oversized.push({ file, size });
    }
  }

  if (oversized.length > 0) {
    console.error("  ✗ 25MiBを超過するファイルが見つかりました:");
    for (const { file, size } of oversized) {
      console.error(`    - ${toDistRelativePosix(file)}: ${(size / 1048576).toFixed(2)} MiB`);
    }
    fail("25MiB超過ファイルがあるため、dist/を公開可能な状態にできません。手動でファイルを見直してください。");
  }

  log("  Cloudflare Pages 25MiB制限：問題なし");
  if (maxFile) {
    log(`  最大ファイル: ${toDistRelativePosix(maxFile)} (${(maxSize / 1048576).toFixed(2)} MiB)`);
  }
  log("");
}

function checkForbiddenEntries() {
  log("[4/6] 公開禁止ファイルの混入を確認しています…");
  for (const name of FORBIDDEN_ENTRIES) {
    const p = path.join(DIST, name);
    if (fs.existsSync(p)) {
      fail(`公開禁止のファイル/フォルダが dist/ に混入しています: ${name}`);
    }
  }
  log("  公開禁止ファイルの混入検査：問題なし\n");
}

function verifyHtmlReferences(files) {
  log("[5/6] HTMLからのローカルファイル参照を検証しています…");

  const distFileSet = new Set(files.map(toDistRelativePosix));
  const htmlTargets = [
    "index.html",
    "works/ai-secretary-app.html",
    "works/event-automation.html",
    "works/make-automation-demo.html",
  ];
  const refRegex = /(?:href|src)="([^"]+)"/g;
  const missing = [];

  for (const rel of htmlTargets) {
    const full = path.join(DIST, ...rel.split("/"));
    if (!fs.existsSync(full)) {
      missing.push(`${rel}（ファイル自体が dist に存在しません）`);
      continue;
    }
    const html = fs.readFileSync(full, "utf8");
    const baseDir = path.posix.dirname(rel);
    let match;
    while ((match = refRegex.exec(html)) !== null) {
      const ref = match[1];
      if (/^https?:\/\//.test(ref) || ref.startsWith("#") || ref.startsWith("mailto:") || ref.startsWith("javascript:")) {
        continue;
      }
      const [pathPart] = ref.split("#");
      if (!pathPart) continue;
      const resolved = path.posix.normalize(path.posix.join(baseDir, pathPart));
      if (!distFileSet.has(resolved)) {
        missing.push(`${rel} が参照する "${ref}" → dist内に見つかりません（解決先: ${resolved}）`);
      }
    }
  }

  if (missing.length > 0) {
    console.error("  ✗ 参照先が見つからないファイルがあります:");
    missing.forEach((m) => console.error(`    - ${m}`));
    fail("dist内に存在しない参照ファイルがあります。allowlistまたはHTMLの参照パスを確認してください。");
  }

  log("  HTML参照の簡易検証：問題なし（CSS/JS/画像/動画/詳細ページの参照先をすべて確認）\n");
}

function printSummary(files) {
  log("[6/6] dist/ の最終構成:");
  const relFiles = files.map(toDistRelativePosix).sort();
  relFiles.forEach((r) => log(`  dist/${r}`));
  log("");
  log(`✓ ビルド成功: dist/ に ${files.length} ファイルを出力しました。`);
  log("✓ Cloudflare Pagesの Build output directory は \"dist\" を指定してください。");
}

function main() {
  cleanAndCreateDist();
  copyAllowlist();
  const files = walkFiles(DIST);
  checkFileSizes(files);
  checkForbiddenEntries();
  verifyHtmlReferences(files);
  printSummary(files);
}

main();
