import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { reviewSchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email.toLowerCase() } });
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const submission = await prisma.submission.findUnique({ where: { id: params.id }, include: { media: true } });
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (submission.status !== "PENDING") return NextResponse.json({ error: "Submission already reviewed." }, { status: 409 });

    const { decision, rejectionReason, internalNote } = parsed.data;
    const result = await prisma.$transaction(async (tx) => {
      if (decision === "APPROVED") {
        await tx.media.updateMany({ where: { submissionId: submission.id }, data: { isPublic: true } });
      }
      return tx.submission.update({
        where: { id: submission.id },
        data: {
          status: decision,
          reviewedAt: new Date(),
          reviewedById: admin.id,
          rejectionReason: decision === "REJECTED" ? rejectionReason || null : null,
          internalNote: internalNote || null
        },
        select: { id: true, status: true }
      });
    });
    console.info("submission_reviewed", { id: result.id, status: result.status, admin: admin.email });
    return NextResponse.json(result);
  } catch (err) {
    console.error("submission_review_failed", err);
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
