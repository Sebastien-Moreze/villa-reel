import { GALLERY_PHOTOS } from "@/lib/gallery";
import type { GalleryPhoto } from "@/lib/gallery";

describe("gallery", () => {
  it("exporte un tableau non vide de photos", () => {
    expect(Array.isArray(GALLERY_PHOTOS)).toBe(true);
    expect(GALLERY_PHOTOS.length).toBeGreaterThan(0);
  });

  it("contient 46 photos", () => {
    expect(GALLERY_PHOTOS).toHaveLength(46);
  });

  it("chaque photo a un id, src et alt valides", () => {
    GALLERY_PHOTOS.forEach((photo: GalleryPhoto) => {
      expect(typeof photo.id).toBe("number");
      expect(photo.id).toBeGreaterThan(0);
      expect(typeof photo.src).toBe("string");
      expect(photo.src).toMatch(/^\/images\/gallery\//);
      expect(photo.src).toMatch(/\.jpg$/);
      expect(typeof photo.alt).toBe("string");
      expect(photo.alt.length).toBeGreaterThan(0);
    });
  });

  it("les IDs sont uniques", () => {
    const ids = GALLERY_PHOTOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("les chemins src sont uniques", () => {
    const srcs = GALLERY_PHOTOS.map((p) => p.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});
