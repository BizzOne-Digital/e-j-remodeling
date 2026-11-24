import { describe, expect, it } from "vitest";
import { defaultHome, defaultSettings } from "@/lib/defaults";
import { FILENAME_RE, sniffImage } from "@/lib/image-signature";
import { makeRef, makeToken } from "@/lib/refs";
import { addDaysTo, money, todayIn, weekdayOf } from "@/lib/utils";
import { bookingSchema, paymentLookupSchema, tokenSchema } from "@/validators/forms";
import { imageUrl, mergeDefaults, shapeOf } from "@/validators/shape";

const booking = { requestType: "Consultation", fullName: "Pat Doe", email: "PAT@Example.com", phone: "(570) 555-0100", address: "1 Main Street", city: "Scranton", zip: "18503", service: "Showers", preferredDate: "2030-01-02", preferredTime: "Morning", budget: "", description: "Replace a tub with a shower", contactMethod: "Phone", consent: true };
describe("forms", () => {
  it("accepts and normalises a valid booking", () => expect(bookingSchema.parse(booking).email).toBe("pat@example.com"));
  it.each([["email", "x"], ["phone", "123"], ["zip", "ABC"], ["service", "Roofing"], ["preferredDate", "soon"], ["consent", false], ["description", "hi"], ["email", { $gt: "" }]])("rejects bad %s", (k, v) => expect(bookingSchema.safeParse({ ...booking, [k]: v }).success).toBe(false));
  it("validates payment lookups", () => {
    expect(paymentLookupSchema.parse({ reference: "pay-abcd2345", email: "a@b.co" }).reference).toBe("PAY-ABCD2345");
    expect(tokenSchema.safeParse({ token: { $ne: null } }).success).toBe(false);
    expect(tokenSchema.safeParse({ token: makeToken() }).success).toBe(true);
  });
});
describe("content shape", () => {
  it("accepts its own defaults", () => { shapeOf(defaultSettings).parse(defaultSettings); shapeOf(defaultHome).parse(defaultHome); });
  it("blocks script URLs and strips unknown keys", () => {
    expect(shapeOf(defaultSettings).safeParse({ ...defaultSettings, social: { ...defaultSettings.social, facebookUrl: "javascript:alert(1)" } }).success).toBe(false);
    expect(shapeOf(defaultSettings).parse({ ...defaultSettings, evil: 1 })).not.toHaveProperty("evil");
  });
  it("only allows local images", () => {
    for (const bad of ["https://x.com/a.png", "/images/../secret", "//x.com/a"]) expect(imageUrl.safeParse(bad).success).toBe(false);
    expect(imageUrl.safeParse("/api/uploads/gallery/1.webp").success).toBe(true);
  });
  it("merges stored content over defaults", () => expect(mergeDefaults({ a: "x", b: { c: true }, d: ["1"] }, { a: 5, b: { c: false }, d: [] })).toEqual({ a: "x", b: { c: false }, d: [] }));
});
describe("uploads", () => {
  it("detects real image types", () => {
    expect(sniffImage(Buffer.from("89504e470d0a1a0a0000000000000000", "hex"))).toBe("image/png");
    expect(sniffImage(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
  it("rejects traversal", () => { for (const f of ["../x.png", "1.png", "1700000000000-aaaaaaaaaaaaaaaaaaaaaaaa.svg"]) expect(FILENAME_RE.test(f)).toBe(false); });
});
describe("utils", () => {
  it("handles dates", () => { expect(addDaysTo("2026-02-28", 1)).toBe("2026-03-01"); expect(addDaysTo("2026-02-31", 0)).not.toBe("2026-02-31"); expect(weekdayOf("2026-11-25")).toBe(3); expect(todayIn("America/New_York")).toMatch(/^\d{4}-\d\d-\d\d$/); });
  it("formats money and references", () => { expect(money(123456)).toBe("$1,234.56"); expect(makeRef("EJ")).toMatch(/^EJ-[A-Z2-9]{8}$/); });
});
