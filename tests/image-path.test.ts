import { describe, expect, it } from "vitest";
import { imagePathError, isProjectImagePath } from "@/lib/image-path";

describe("isProjectImagePath", () => {
  it.each(["/images/gems/sapphire.webp", "/images/gallery/a/b.JPG", "/images/site/Hero img.png"])(
    "accepts %s",
    (p) => expect(isProjectImagePath(p)).toBe(true),
  );
  it.each([
    "images/gems/a.png",
    "/images/other/a.png",
    "/images/gems/../../secret.png",
    "/images/gems/a.svg",
    "/images/gems/a.png?x=1",
    "https://example.com/images/gems/a.png",
    "//evil.com/images/gems/a.png",
    "/images/gems/a\b.png",
    "/images/gems/",
  ])("rejects %s", (p) => expect(isProjectImagePath(p)).toBe(false));
});

describe("imagePathError", () => {
  it("allows an unchanged legacy value", () => {
    const legacy = "https://x.public.blob.vercel-storage.com/a.jpg";
    expect(imagePathError(legacy, [legacy])).toBeNull();
    expect(imagePathError(legacy)).not.toBeNull();
  });
});
