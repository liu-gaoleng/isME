// 一次性图片压缩脚本：对 public/material 下的 JPG 原地重新编码（mozjpeg, quality=80）
// 保持文件名 / 路径 / 像素尺寸不变，对前端引用完全透明。
// 用法：node scripts/compress-images.mjs
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const ROOT = "public/material";
const QUALITY = 80;
const MAX_EDGE = 1920; // 超过则等比缩小，避免超大原图；当前素材均未超过

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const isJpg = (f) => [".jpg", ".jpeg"].includes(extname(f).toLowerCase());

let before = 0;
let after = 0;
let count = 0;

const files = (await walk(ROOT)).filter(isJpg);
for (const file of files) {
  const origSize = (await stat(file)).size;
  const tmp = file + ".tmp";
  await sharp(file)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tmp);
  const newSize = (await stat(tmp)).size;
  // 只有压缩后更小才替换，避免把已优化图片改大
  if (newSize < origSize) {
    await rename(tmp, file);
    after += newSize;
  } else {
    await unlink(tmp);
    after += origSize;
  }
  before += origSize;
  count++;
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(`处理 ${count} 张 JPG`);
console.log(`压缩前: ${mb(before)} MB`);
console.log(`压缩后: ${mb(after)} MB`);
console.log(`节省:   ${mb(before - after)} MB (${(((before - after) / before) * 100).toFixed(1)}%)`);
