import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readMedia } from "@/lib/media";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const media = await prisma.media.findUnique({ include: { submission: true }, where: { id: params.id } });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isApprovedPublic = media.submission.status === "APPROVED" && media.isPublic;
    if (!isApprovedPublic) {
      const admin = await requireAdmin();
      if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await readMedia(media.storagePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(data.length),
        "Cache-Control": isApprovedPublic ? "public, max-age=3600" : "private, no-store"
      }
    });
  } catch (err) {
    console.error("media_read_failed", err);
    return NextResponse.json({ error: "Unable to load media" }, { status: 500 });
  }
}
