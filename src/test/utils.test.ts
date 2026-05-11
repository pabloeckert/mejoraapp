import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isHidden = false;
    expect(cn("base", isActive ? "active" : undefined, isHidden ? "hidden" : undefined)).toBe("base active");
  });

  it("should deduplicate tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("", null, undefined, false)).toBe("");
  });

  it("should handle array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
