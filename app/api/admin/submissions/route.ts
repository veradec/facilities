import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "PENDING").toUpperCase();
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = 10;
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const type = searchParams.get("type")?.trim() || "";

  const where: any = { status, ...(type ? { type } : {}) };
  const all = await prisma.submission.findMany({
    where,
    include: { media: { select: { id: true, kind: true, mimeType: true } } },
    orderBy: { submittedAt: "desc" }
  });
  const filtered = q ? all.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) : all;
  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(({ contactName, contactEmail, contactPhone, rejectionReason, internalNote, reviewedById, ...rest }) => ({
    ...rest, contactName, contactEmail, contactPhone
  }));
  return NextResponse.json({ total, page, pageSize, items });
}
