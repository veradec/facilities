import { prisma } from "./db";

export async function getApprovedFacilities(params: { q?: string; type?: string } = {}) {
  const q = params.q?.trim().toLowerCase();
  const type = params.type?.trim();
  const items = await prisma.submission.findMany({
    where: { status: "APPROVED", ...(type ? { type } : {}) },
    include: { media: { where: { kind: "PHOTO", isPublic: true }, take: 1 } },
    orderBy: { reviewedAt: "desc" }
  });
  if (!q) return items;
  return items.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
}

export async function getApprovedFacility(id: string) {
  return prisma.submission.findFirst({
    where: { id, status: "APPROVED" },
    include: { media: { where: { isPublic: true }, orderBy: { createdAt: "asc" } } }
  });
}
