import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const telHref = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
export const money = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function addDaysTo(date: string, n: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Today's date (YYYY-MM-DD) in a time zone, shifted by whole days. */
export function todayIn(timeZone: string, addDays = 0) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return addDaysTo(`${p.year}-${p.month}-${p.day}`, addDays);
}
export const weekdayOf = (date: string) => new Date(date + "T12:00:00Z").getUTCDay();
export const formatDate = (date: string | Date) =>
  typeof date === "string" && date.length === 10
    ? new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })
    : new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
