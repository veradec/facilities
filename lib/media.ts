import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const MEDIA_DIR = process.env.MEDIA_STORAGE_DIR || "./uploads";

export function getMediaRoot() {
  return path.resolve(process.cwd(), MEDIA_DIR);
}

export function allowedVideoTypes() {
  return (process.env.ALLOWED_VIDEO_TYPES || "video/mp4,video/webm,video/quicktime").split(",").map(s => s.trim());
}
export function allowedImageTypes() {
  return (process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",").map(s => s.trim());
}
export function maxVideoBytes() { return Number(process.env.MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024; }
export function maxImageBytes() { return Number(process.env.MAX_IMAGE_SIZE_MB || 10) * 1024 * 1024; }

export function safeExt(mime: string, kind: "VIDEO" | "PHOTO") {
  const map: Record<string, string> = {
    "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
    "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"
  };
  return map[mime] || (kind === "VIDEO" ? ".bin" : ".bin");
}

export async function saveUpload(file: File, kind: "VIDEO" | "PHOTO") {
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${crypto.randomUUID()}${safeExt(file.type, kind)}`;
  const dir = path.join(getMediaRoot(), kind.toLowerCase());
  await fs.mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, name);
  await fs.writeFile(storagePath, bytes);
  return { storagePath, sizeBytes: bytes.length };
}

export async function readMedia(storagePath: string) {
  const root = getMediaRoot();
  const resolved = path.resolve(storagePath);
  if (!resolved.startsWith(root)) throw new Error("Invalid media path");
  return fs.readFile(resolved);
}

export async function removeMedia(storagePath: string) {
  try { await fs.unlink(path.resolve(storagePath)); } catch {}
}
