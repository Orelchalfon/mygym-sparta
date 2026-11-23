import { describe, expect, it } from "vitest";
import { safeRedirect } from "./auth-redirect";

describe("safeRedirect", () => {
  it("keeps same-origin paths with query strings", () => {
    expect(safeRedirect("/areas/legs/exercise/abc?x=1")).toBe("/areas/legs/exercise/abc?x=1");
    expect(safeRedirect("/history")).toBe("/history");
  });

  it.each([
    ["absolute URL", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["relative path", "areas"],
    ["empty string", ""],
  ])("drops %s", (_label, value) => {
    expect(safeRedirect(value)).toBeUndefined();
  });

  it("drops /auth targets so sign-in can't loop", () => {
    expect(safeRedirect("/auth")).toBeUndefined();
    expect(safeRedirect("/auth?redirect=/history")).toBeUndefined();
  });

  it("drops non-strings", () => {
    expect(safeRedirect(undefined)).toBeUndefined();
    expect(safeRedirect(42)).toBeUndefined();
    expect(safeRedirect(["/areas"])).toBeUndefined();
  });
});
