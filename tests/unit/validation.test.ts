import { describe, expect, it } from "vitest";
import { submissionSchema, reviewSchema } from "@/lib/validation";

describe("submissionSchema", () => {
  it("accepts valid submission", () => {
    const r = submissionSchema.safeParse({
      name: "Central Park",
      type: "Park",
      description: "Large public park with walking paths.",
      latitude: "40.7",
      longitude: "-73.9"
    });
    expect(r.success).toBe(true);
  });
  it("rejects invalid coordinates", () => {
    const r = submissionSchema.safeParse({
      name: "Bad Coords",
      type: "Park",
      description: "Description long enough",
      latitude: 120,
      longitude: 10
    });
    expect(r.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("requires reason for rejection", () => {
    const r = reviewSchema.safeParse({ decision: "REJECTED", rejectionReason: "" });
    expect(r.success).toBe(false);
  });
  it("allows approval without reason", () => {
    const r = reviewSchema.safeParse({ decision: "APPROVED", internalNote: "Looks good" });
    expect(r.success).toBe(true);
  });
});
