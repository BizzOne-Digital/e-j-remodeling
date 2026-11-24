/** Detects the real image type from magic bytes; null when it is not a supported image. */
export function sniffImage(b: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | "image/gif" | null {
  if (b.length < 16) return null;
  const ascii = (a: number, z: number) => String.fromCharCode(...b.subarray(a, z));
  if (b[0] === 0x89 && ascii(1, 4) === "PNG" && b[4] === 0x0d && b[5] === 0x0a) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (["GIF87a", "GIF89a"].includes(ascii(0, 6))) return "image/gif";
  return null;
}
export const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" } as const;
export const FILENAME_RE = /^\d{13}-[a-f0-9]{24}\.(png|jpg|webp|gif)$/;
