"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { LocalImageField } from "./local-image-field";
import { Title } from "./shell";
import { api, ApiError } from "@/lib/api";
import type { UPLOAD_FOLDERS } from "@/lib/constants";

type V = string | number | boolean | V[] | { [k: string]: V };
const LABELS: Record<string, string> = { whyChooseUs: "Why Choose Us", faq: "FAQ", cta: "Final call to action", seo: "SEO metadata", pages: "Inner page banners", logoImage: "Logo", showMap: "Show Google map (needs an address)", sections: "Section visibility", topBarText: "Top bar text" };
const human = (k: string) => LABELS[k] ?? k.replace(/Url$/, " URL").replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])(?=[a-z])/g, (_, c) => " " + c.toLowerCase());
const blankOf = (v: V | undefined): V => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).map((k) => [k, ""])) : "");

function Node({ k, v, path, errors, folder, onChange }: { k: string; v: V; path: string; errors: Record<string, string>; folder: (typeof UPLOAD_FOLDERS)[number]; onChange: (v: V) => void }) {
  if (typeof v === "boolean") return <label className="flex min-h-11 items-center gap-3 font-medium"><input type="checkbox" checked={v} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[#0754B8]" />{human(k)}</label>;
  if (Array.isArray(v)) {
    const icon = "grid size-11 shrink-0 place-items-center rounded-lg border bg-white disabled:opacity-30";
    const swap = (i: number, j: number) => { const n = [...v]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
    return (
      <div className="sm:col-span-2"><p className="mb-2 text-sm font-semibold">{human(k)}</p>
        <div className="grid gap-3">{v.map((x, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg bg-mist p-3">
            <div className="grid min-w-56 grow gap-3"><Node k={typeof x === "string" ? `${i + 1}` : ""} v={x} path={`${path}.${i}`} errors={errors} folder={folder} onChange={(n) => onChange(v.map((o, j) => (j === i ? n : o)))} /></div>
            <button type="button" aria-label="Move up" disabled={!i} className={icon} onClick={() => swap(i, i - 1)}><ArrowUp size={16} /></button>
            <button type="button" aria-label="Move down" disabled={i === v.length - 1} className={icon} onClick={() => swap(i, i + 1)}><ArrowDown size={16} /></button>
            <button type="button" aria-label="Remove" disabled={v.length < 2} className={icon} onClick={() => onChange(v.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
          </div>
        ))}</div>
        <Button type="button" variant="light" size="sm" className="mt-3" onClick={() => onChange([...v, blankOf(v[0])])}><Plus size={16} aria-hidden />Add</Button>
      </div>
    );
  }
  if (typeof v === "object") {
    const inner = Object.entries(v).map(([ck, cv]) => <Node key={ck} k={ck} v={cv} path={path ? `${path}.${ck}` : ck} errors={errors} folder={folder} onChange={(n) => onChange({ ...v, [ck]: n })} />);
    return k ? <fieldset className="rounded-xl border p-4 sm:col-span-2"><legend className="px-2 font-bold">{human(k)}</legend><div className="grid gap-4 sm:grid-cols-2">{inner}</div></fieldset> : <div className="grid gap-4 sm:grid-cols-2">{inner}</div>;
  }
  if (/image$/i.test(k)) return <div className="sm:col-span-2"><LocalImageField label={human(k)} value={String(v)} folder={k === "logoImage" ? "branding" : folder} onChange={onChange} /></div>;
  const long = /description|text$|paragraph/i.test(k) && k !== "topBarText" || String(v).length > 90;
  return <Field label={human(k)} error={errors[path]} className={long ? "sm:col-span-2" : ""}>{long ? <Textarea rows={3} value={String(v)} onChange={(e) => onChange(e.target.value)} /> : <Input value={String(v)} onChange={(e) => onChange(e.target.value)} />}</Field>;
}

export function ContentEditor({ name, title, text, extra }: { name: "settings" | "home"; title: string; text: string; extra?: React.ReactNode }) {
  const [data, setData] = useState<Record<string, V> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState("");
  useEffect(() => { api<{ data: Record<string, V> }>(`/api/admin/singleton/${name}`).then((r) => setData(r.data), (e) => setLoadError(e.message)); }, [name]);
  useEffect(() => {
    if (!dirty) return;
    const on = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [dirty]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({});
    try { const r = await api<{ data: Record<string, V> }>(`/api/admin/singleton/${name}`, { method: "PUT", body: data }); setData(r.data); setDirty(false); toast.success("Saved and published."); }
    catch (err) { if (err instanceof ApiError && err.fields) setErrors(err.fields); toast.error((err as Error).message); }
    setBusy(false);
  }
  if (loadError) return <p role="alert" className="card p-6 text-red-700">{loadError}</p>;
  const change = (k: string, n: V) => { setDirty(true); setData((d) => d && { ...d, [k]: n }); };
  const simple = data ? Object.entries(data).filter(([, v]) => typeof v !== "object") : [], groups = data ? Object.entries(data).filter(([, v]) => typeof v === "object") : [];
  return (
    <form onSubmit={save} noValidate>
      <Title text={text}>{title}</Title>
      {!data ? <div role="status" aria-label="Loading" className="card h-96 animate-pulse" /> : (
        <div className="grid gap-4">
          {simple.length ? <div className="card grid gap-4 p-5 sm:grid-cols-2">{simple.map(([k, v]) => <Node key={k} k={k} v={v} path={k} errors={errors} folder="pages" onChange={(n) => change(k, n)} />)}</div> : null}
          {groups.map(([k, v]) => {
            const bad = Object.keys(errors).some((e) => e.startsWith(k + "."));
            return <details key={k} className="card" open={bad || k === "sections" || undefined}><summary className="flex min-h-14 items-center px-5 text-lg font-bold">{human(k)}</summary><div className="border-t p-5"><Node k="" v={v} path={k} errors={errors} folder="pages" onChange={(n) => change(k, n)} /></div></details>;
          })}
        </div>
      )}
      <div className="sticky bottom-0 mt-5 flex items-center justify-end gap-4 bg-mist/95 py-4">{dirty ? <span className="text-sm text-muted">Unsaved changes</span> : null}<Button size="lg" disabled={busy || !data}>{busy ? "Saving..." : "Save Changes"}</Button></div>
      {extra}
    </form>
  );
}
