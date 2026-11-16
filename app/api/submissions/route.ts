import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { submissionSchema } from "@/lib/validation";
import { allowedImageTypes, allowedVideoTypes, maxImageBytes, maxVideoBytes, saveUpload } from "@/lib/media";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const payload = {
      name: String(form.get("name") || ""),
      type: String(form.get("type") || ""),
      description: String(form.get("description") || ""),
      accessibility: String(form.get("accessibility") || ""),
      latitude: String(form.get("latitude") || ""),
      longitude: String(form.get("longitude") || ""),
      contactName: String(form.get("contactName") || ""),
      contactEmail: String(form.get("contactEmail") || ""),
      contactPhone: String(form.get("contactPhone") || "")
    };
    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const videos = form.getAll("videos").filter((v): v is File => v instanceof File && v.size > 0);
    const photos = form.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
    if (videos.length < 1) return NextResponse.json({ error: "At least one video is required." }, { status: 400 });
    for (const v of videos) {
      if (!allowedVideoTypes().includes(v.type)) return NextResponse.json({ error: `Unsupported video type: ${v.type}` }, { status: 400 });
      if (v.size > maxVideoBytes()) return NextResponse.json({ error: `Video too large: ${v.name}` }, { status: 400 });
    }
    for (const p of photos) {
      if (!allowedImageTypes().includes(p.type)) return NextResponse.json({ error: `Unsupported image type: ${p.type}` }, { status: 400 });
      if (p.size > maxImageBytes()) return NextResponse.json({ error: `Image too large: ${p.name}` }, { status: 400 });
    }

    const savedVideos = await Promise.all(videos.map(async (f) => ({ file: f, saved: await saveUpload(f, "VIDEO") })));
    const savedPhotos = await Promise.all(photos.map(async (f) => ({ file: f, saved: await saveUpload(f, "PHOTO") })));

    const submission = await prisma.submission.create({
      data: {
        ...parsed.data,
        accessibility: parsed.data.accessibility || null,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
        status: "PENDING",
        media: {
          create: [
            ...savedVideos.map(({ file, saved }) => ({
              kind: "VIDEO" as const, originalName: file.name || "video", mimeType: file.type, sizeBytes: saved.sizeBytes, storagePath: saved.storagePath, isPublic: false
            })),
            ...savedPhotos.map(({ file, saved }) => ({
              kind: "PHOTO" as const, originalName: file.name || "photo", mimeType: file.type, sizeBytes: saved.sizeBytes, storagePath: saved.storagePath, isPublic: false
            }))
          ]
        }
      },
      select: { id: true, status: true }
    });
    console.info("submission_created", { id: submission.id });
    return NextResponse.json({ id: submission.id, status: submission.status }, { status: 201 });
  } catch (err) {
    console.error("submission_create_failed", err);
    return NextResponse.json({ error: "Failed to submit facility." }, { status: 500 });
  }
}
