import { describe, expect, it } from "vitest";
import rows from "@/data/catalogue-sheet.json";
import optimized from "@/data/catalogue-image-urls.json";
import { catalogueImage } from "./catalogue-image";

describe("compressed catalogue photographs", () => {
  it("resolves all 633 catalogue entries to cached WebP photos", () => {
    expect(rows).toHaveLength(633);
    for (const row of rows) {
      expect(catalogueImage(row.img)).toMatch(/^\/__l5e\/assets-v1\/.*\.webp$/);
      expect(catalogueImage(row.img)).not.toBe(row.img);
    }
    expect(Object.keys(optimized)).toHaveLength(632);
  });
  it("uses existing small sachet photos only for thumbnails", () => {
    expect(catalogueImage("/sachets/blank-stick.jpg", true)).toBe("/sachets/thumb/blank-stick.webp");
    expect(catalogueImage("/sachets/blank-stick.jpg")).toBe("/sachets/blank-stick.jpg");
  });
  it("preserves uploaded images and unrecognised sources", () => {
    expect(catalogueImage("data:image/jpeg;base64,example")).toBe("data:image/jpeg;base64,example");
    expect(catalogueImage("/new-photo.webp")).toBe("/new-photo.webp");
  });
});