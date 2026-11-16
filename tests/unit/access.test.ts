import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { media: { findUnique: vi.fn() } } }));
vi.mock("@/lib/media", () => ({ readMedia: vi.fn(async () => Buffer.from("x")) }));

import { GET as getMedia } from "@/app/api/media/[id]/route";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

describe("media access control", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non-admin from unapproved media", async () => {
    (requireAdmin as any).mockResolvedValue(null);
    (prisma.media.findUnique as any).mockResolvedValue({ id: "m1", mimeType: "video/mp4", storagePath: "/x", isPublic: false, submission: { status: "PENDING" } });
    const res = await getMedia(new Request("http://test"), { params: { id: "m1" } });
    expect(res.status).toBe(401);
  });

  it("allows approved public media", async () => {
    (prisma.media.findUnique as any).mockResolvedValue({ id: "m2", mimeType: "image/jpeg", storagePath: "/x", isPublic: true, submission: { status: "APPROVED" } });
    const res = await getMedia(new Request("http://test"), { params: { id: "m2" } });
    expect(res.status).toBe(200);
  });
});
