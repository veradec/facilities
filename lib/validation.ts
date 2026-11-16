import { z } from "zod";

export const facilityTypes = [
  "Park",
  "Library",
  "Community Center",
  "Restroom",
  "Playground",
  "Transit Stop",
  "Health Clinic",
  "Other"
] as const;

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(facilityTypes),
  description: z.string().trim().min(10).max(2000),
  accessibility: z.string().trim().max(1000).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(40).optional().or(z.literal(""))
});

export const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(1000).optional().or(z.literal("")),
  internalNote: z.string().trim().max(1000).optional().or(z.literal(""))
}).superRefine((val, ctx) => {
  if (val.decision === "REJECTED" && !val.rejectionReason) {
    ctx.addIssue({ code: "custom", path: ["rejectionReason"], message: "Rejection reason is required." });
  }
});

export function parseList(value: string | undefined) {
  return (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
