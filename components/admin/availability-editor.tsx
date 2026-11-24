"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Title } from "./shell";
import { api, ApiError } from "@/lib/api";
import type { Availability } from "@/lib/defaults";
import { formatDate } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function AvailabilityEditor() {
  const [a, set] = useState<Availability | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [block, setBlock] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ data: Availability }>("/api/admin/singleton/availability").then((r) => set(r.data), (e) => toast.error(e.message)); }, []);
  if (!a) return <div role="status" aria-label="Loading" className="card h-96 animate-pulse" />;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({});
    try { const r = await api<{ data: Availability }>("/api/admin/singleton/availability", { method: "PUT", body: { ...a, timeSlots: a!.timeSlots.map((t) => t.trim()).filter(Boolean) } }); set(r.data); toast.success("Availability saved."); }
    catch (err) { if (err instanceof ApiError && err.fields) setErrors(err.fields); toast.error((err as Error).message); }
    setBusy(false);
  }
  return (
    <form onSubmit={save} noValidate>
      <Title text="Controls which dates and times customers can request. Requests stay pending until you confirm them.">Availability</Title>
      <div className="card grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Days you accept requests for</legend><div className="flex flex-wrap gap-x-6">{DAYS.map((d, i) => <label key={d} className="flex min-h-11 items-center gap-2.5"><input type="checkbox" className="size-5 accent-[#0754B8]" checked={a.weekdays.includes(i)} onChange={(e) => set({ ...a, weekdays: e.target.checked ? [...a.weekdays, i].sort() : a.weekdays.filter((x) => x !== i) })} />{d}</label>)}</div>{errors.weekdays ? <p role="alert" className="text-sm text-red-700">{errors.weekdays}</p> : null}</fieldset>
        <Field label="Times customers can choose" hint="One per line, for example: Morning or 9:00 AM" error={errors.timeSlots}><Textarea rows={6} value={a.timeSlots.join("\n")} onChange={(e) => set({ ...a, timeSlots: e.target.value.split("\n") })} /></Field>
        <div className="grid content-start gap-5">
          <Field label="Minimum notice (days)" error={errors.leadDays}><Input type="number" min={0} max={60} value={a.leadDays} onChange={(e) => set({ ...a, leadDays: +e.target.value })} /></Field>
          <Field label="Furthest ahead (days)" error={errors.maxDaysAhead}><Input type="number" min={1} max={365} value={a.maxDaysAhead} onChange={(e) => set({ ...a, maxDaysAhead: +e.target.value })} /></Field>
          <Field label="Time zone" error={errors.timeZone}><Input value={a.timeZone} onChange={(e) => set({ ...a, timeZone: e.target.value })} /></Field>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-end gap-3"><Field label="Block a date"><Input type="date" value={block} onChange={(e) => setBlock(e.target.value)} /></Field><Button type="button" variant="light" onClick={() => { if (block) set({ ...a, blockedDates: [...new Set([...a.blockedDates, block])].sort() }); setBlock(""); }}>Block</Button></div>
          <ul className="mt-3 flex flex-wrap gap-2">{a.blockedDates.map((d) => <li key={d} className="flex items-center rounded-full bg-mist pl-4 text-sm font-semibold">{formatDate(d)}<button type="button" aria-label={`Unblock ${formatDate(d)}`} className="grid size-10 place-items-center" onClick={() => set({ ...a, blockedDates: a.blockedDates.filter((x) => x !== d) })}><X size={16} /></button></li>)}</ul>
        </div>
        <Button size="lg" disabled={busy} className="sm:col-span-2 sm:justify-self-end">{busy ? "Saving..." : "Save Availability"}</Button>
      </div>
    </form>
  );
}
