import { z } from "zod";

export const imageUrl = z.string().max(300).refine(
  (v) => v === "" || (/^\/(images|api\/uploads)\/[\w./-]+$/.test(v) && !v.includes("..")), "Choose an uploaded image");
export const httpsUrl = z.string().max(300).refine((v) => v === "" || /^https:\/\/[^\s<>"]+$/i.test(v), "Use a full https:// address");

/** Builds a strict schema from a defaults object, so editable content can only ever take the known shape. */
export function shapeOf(value: unknown, key = ""): z.ZodType {
  if (typeof value === "boolean") return z.boolean();
  if (typeof value === "number") return z.number();
  if (Array.isArray(value)) return z.array(shapeOf(value[0] ?? "")).max(40);
  if (value && typeof value === "object")
    return z.object(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shapeOf(v, k)])));
  if (/image$/i.test(key)) return imageUrl;
  if (/Url$/.test(key)) return httpsUrl;
  if (key === "email") return z.email();
  if (["businessName", "phone", "heading"].includes(key)) return z.string().trim().min(1, "Required").max(200);
  return z.string().trim().max(3000);
}

/** Overlays stored content on defaults; new keys added in code keep working with older documents. */
export function mergeDefaults<T>(def: T, stored: unknown): T {
  if (stored === undefined || stored === null) return def;
  if (Array.isArray(def)) return (Array.isArray(stored) ? stored : def) as T;
  if (def && typeof def === "object") {
    if (typeof stored !== "object") return def;
    const s = stored as Record<string, unknown>;
    return Object.fromEntries(Object.entries(def).map(([k, v]) => [k, mergeDefaults(v, s[k])])) as T;
  }
  return (typeof stored === typeof def ? stored : def) as T;
}
