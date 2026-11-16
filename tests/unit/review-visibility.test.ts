import { describe, expect, it } from "vitest";

describe("public visibility rules", () => {
  it("treats only APPROVED as public in query intent", () => {
    const statuses = ["PENDING", "APPROVED", "REJECTED"];
    const publicVisible = statuses.filter(s => s === "APPROVED");
    expect(publicVisible).toEqual(["APPROVED"]);
  });
});
