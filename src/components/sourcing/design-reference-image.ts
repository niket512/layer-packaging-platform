import type { PackagingDesign } from "./packaging-catalogue";

/** Preserve every selected reference in one chat attachment, leaving room for buyer uploads. */
export async function designReferenceImage(designs: PackagingDesign[]): Promise<string> {
  // Remote catalogue photos may block downloads; keep the ones that load.
  const loaded = await Promise.all(designs.map(async design => {
    try {
      const response = await fetch(design.image);
      return response.ok ? await createImageBitmap(await response.blob()) : null;
    } catch { return null; }
  }));
  const images = loaded.filter((image): image is ImageBitmap => image !== null);
  if (!images.length) throw new Error("This design’s photo couldn’t be attached, but its name and ID are in your request.");
  try {
    const columns = Math.ceil(Math.sqrt(images.length));
    const cell = images.length === 1 ? 600 : 240;
    const canvas = document.createElement("canvas");
    canvas.width = columns * cell;
    canvas.height = Math.ceil(images.length / columns) * cell;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn’t prepare the design reference.");
    // White is part of the exported reference photograph, not application styling.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    images.forEach((image, index) => {
      const scale = Math.min((cell - 16) / image.width, (cell - 32) / image.height);
      const x = (index % columns) * cell;
      const y = Math.floor(index / columns) * cell;
      ctx.drawImage(image, x + (cell - image.width * scale) / 2, y + 8, image.width * scale, image.height * scale);
      if (images.length > 1) { ctx.fillStyle = "black"; ctx.font = "12px sans-serif"; ctx.fillText(`Reference ${index + 1}`, x + 8, y + cell - 8); }
    });
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally { images.forEach(image => image.close()); }
}