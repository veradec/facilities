import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "change-me-now";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash }
  });

  const mediaDir = path.resolve(process.cwd(), process.env.MEDIA_STORAGE_DIR || "./uploads", "seed");
  await fs.mkdir(mediaDir, { recursive: true });
  const videoPath = path.join(mediaDir, "sample-public.webm");
  const photoPath = path.join(mediaDir, "sample-public.jpg");
  if (!(await exists(videoPath))) await fs.writeFile(videoPath, Buffer.from("placeholder"));
  if (!(await exists(photoPath))) await fs.writeFile(photoPath, Buffer.from("placeholder"));

  const existing = await prisma.submission.findFirst({ where: { name: "Riverside Community Library" } });
  if (!existing) {
    await prisma.submission.create({
      data: {
        name: "Riverside Community Library",
        type: "Library",
        description: "A community library offering public reading areas, study rooms, and accessible entryways.",
        accessibility: "Step-free entrance, accessible restroom, and elevator access to upper floors.",
        latitude: 37.7792,
        longitude: -122.4188,
        status: "APPROVED",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        contactVisibility: "PRIVATE",
        media: {
          create: [
            { kind: "VIDEO", originalName: "sample-public.webm", mimeType: "video/webm", sizeBytes: 11, storagePath: videoPath, isPublic: true },
            { kind: "PHOTO", originalName: "sample-public.jpg", mimeType: "image/jpeg", sizeBytes: 11, storagePath: photoPath, isPublic: true }
          ]
        }
      }
    });
  }

  const pending = await prisma.submission.findFirst({ where: { name: "Harbor View Restroom", status: "PENDING" } });
  if (!pending) {
    const pendingVideo = path.join(mediaDir, "sample-pending.webm");
    if (!(await exists(pendingVideo))) await fs.writeFile(pendingVideo, Buffer.from("placeholder"));
    await prisma.submission.create({
      data: {
        name: "Harbor View Restroom",
        type: "Restroom",
        description: "Public restroom facility near the waterfront promenade with daytime access.",
        accessibility: "Ground-level access reported by submitter.",
        latitude: 37.7815,
        longitude: -122.4151,
        status: "PENDING",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        contactName: "Sample Submitter",
        contactEmail: "submitter@example.com",
        contactVisibility: "PRIVATE",
        media: {
          create: [
            { kind: "VIDEO", originalName: "sample-pending.webm", mimeType: "video/webm", sizeBytes: 11, storagePath: pendingVideo, isPublic: false }
          ]
        }
      }
    });
  }

  console.log("Seed complete. Admin:", email);
}

async function exists(p: string) { try { await fs.access(p); return true; } catch { return false; } }

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
