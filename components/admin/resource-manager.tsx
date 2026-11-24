"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { LocalImageField } from "./local-image-field";
import { Title } from "./shell";
import { api, ApiError } from "@/lib/api";
import type { UPLOAD_FOLDERS } from "@/lib/constants";

// Rows come from a schemaless list endpoint; each config knows its own shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any> & { _id: string };
export type FieldDef = { key: string; label: string; type?: "text" | "textarea" | "select" | "bool" | "image" | "lines" | "date" | "money" | "combo"; options?: readonly string[]; folder?: (typeof UPLOAD_FOLDERS)[number]; hint?: string; createOnly?: boolean; editOnly?: boolean };
export type Config = {
  resource: string; title: string; noun: string; text?: string; columns: { label: string; render: (r: Row) => React.ReactNode }[];
  fields: FieldDef[]; blank?: Record<string, unknown>; canCreate?: boolean; canDelete?: boolean; canEdit?: boolean; ordered?: boolean; dates?: boolean;
  filters?: { key: string; label: string; options: readonly (readonly [string, string])[] }[];
  detail?: (r: Row, reload: () => void, close: () => void) => React.ReactNode; onOpen?: (r: Row, reload: () => void) => void; extra?: (query: string) => React.ReactNode;
  initial?: () => Record<string, unknown> | null;
};

export function ResourceManager({ config: c }: { config: Config }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Row[]; total: number; pages: number } | null>(null);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState<{ row: Row | null; values: Record<string, unknown> } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Row | null>(null);
  const seq = useRef(0);
  const query = new URLSearchParams({ ...(q && { q }), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }).toString();
  const base = `/api/admin/${c.resource}`;
  const load = useCallback(() => {
    const n = ++seq.current;
    return api<{ items: Row[]; total: number; pages: number }>(`${base}?${query}&page=${page}`).then((d) => { if (n === seq.current) { setData(d); setError(""); } }, (e) => { if (n === seq.current) setError(e.message); });
  }, [base, query, page]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  const { initial } = c;
  useEffect(() => { const v = initial?.(); if (v) queueMicrotask(() => setEdit({ row: null, values: v })); }, [initial]);

  const openRow = (row: Row) => { setErrors({}); setEdit({ row, values: Object.fromEntries(c.fields.filter((f) => !f.createOnly).map((f) => [f.key, row[f.key] ?? (f.type === "bool" ? false : f.type === "lines" ? [] : "")])) }); c.onOpen?.(row, load); };
  const set = (k: string, v: unknown) => setEdit((e) => e && { ...e, values: { ...e.values, [k]: v } });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit || busy) return;
    setBusy(true); setErrors({});
    try {
      const body = Object.fromEntries(Object.entries(edit.values).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : v]));
      for (const f of c.fields) if (f.type === "money" && f.key in body) body[f.key] = Number(body[f.key]);
      await api(edit.row ? `${base}/${edit.row._id}` : base, { method: edit.row ? "PATCH" : "POST", body });
      toast.success("Saved.");
      setEdit(null);
      load();
    } catch (err) { if (err instanceof ApiError && err.fields) setErrors(err.fields); toast.error((err as Error).message); }
    setBusy(false);
  }
  async function remove() {
    if (!confirm) return;
    setBusy(true);
    try { await api(`${base}/${confirm._id}`, { method: "DELETE" }); toast.success("Deleted."); setConfirm(null); load(); } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  }
  async function move(i: number, d: number) {
    if (!data || busy) return;
    const items = [...data.items];
    [items[i], items[i + d]] = [items[i + d], items[i]];
    setData({ ...data, items });
    setBusy(true);
    try { await api(base, { method: "PUT", body: { ids: items.map((x) => x._id) } }); } catch (e) { toast.error((e as Error).message); load(); }
    setBusy(false);
  }
  const icon = "grid size-11 place-items-center rounded-lg border bg-white hover:border-primary disabled:opacity-30";
  const name = (r: Row) => r.title ?? r.question ?? r.fullName ?? r.customerName ?? "item";
  const fields = c.fields.filter((f) => (edit?.row ? !f.createOnly : !f.editOnly));
  return (
    <>
      <Title text={c.text} action={<div className="flex flex-wrap gap-3">{c.extra?.(query)}{c.canCreate ? <Button size="sm" onClick={() => { setErrors({}); setEdit({ row: null, values: { ...c.blank } }); }}><Plus size={18} aria-hidden />Add {c.noun}</Button> : null}</div>}>{c.title}</Title>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 grow"><Search size={18} className="absolute left-3.5 top-3.5 text-muted" aria-hidden /><Input aria-label="Search" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-11" /></div>
        {c.filters?.map((f) => <Select key={f.key} aria-label={f.label} value={filters[f.key] ?? ""} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); setPage(1); }} className="w-auto"><option value="">{f.label}: all</option>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>)}
        {c.dates ? (["from", "to"] as const).map((k) => <Input key={k} type="date" aria-label={k === "from" ? "From date" : "To date"} value={filters[k] ?? ""} onChange={(e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); }} className="w-auto" />) : null}
      </div>
      {error ? <p role="alert" className="card p-6 text-red-700">{error} <button type="button" className="underline" onClick={load}>Retry</button></p> : !data ? <div role="status" aria-label="Loading" className="card h-64 animate-pulse" /> : !data.items.length ? (
        <p className="card p-10 text-center text-muted">{query ? "Nothing matches your search." : `No ${c.noun}s yet.`}</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-[.95rem]">
            <thead className="hidden bg-mist text-sm text-muted md:table-header-group"><tr>{c.columns.map((k) => <th key={k.label} scope="col" className="px-4 py-3 font-semibold">{k.label}</th>)}<th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody className="divide-y">
              {data.items.map((r, i) => (
                <tr key={r._id} className="block p-3 md:table-row md:p-0">
                  {c.columns.map((k) => <td key={k.label} className="flex justify-between gap-4 px-1 py-1.5 align-middle break-words md:table-cell md:max-w-72 md:px-4 md:py-3"><span className="shrink-0 text-sm text-muted md:hidden">{k.label}</span><span className="min-w-0 text-right md:text-left">{k.render(r)}</span></td>)}
                  <td className="block px-1 py-2 md:table-cell md:px-4"><div className="flex justify-end gap-2">
                    {c.ordered && !query ? <><button type="button" aria-label={`Move ${name(r)} up`} disabled={!i || busy} onClick={() => move(i, -1)} className={icon}><ArrowUp size={17} /></button><button type="button" aria-label={`Move ${name(r)} down`} disabled={i === data.items.length - 1 || busy} onClick={() => move(i, 1)} className={icon}><ArrowDown size={17} /></button></> : null}
                    <button type="button" aria-label={`Open ${name(r)}`} onClick={() => openRow(r)} className={icon}><Pencil size={17} /></button>
                    {c.canDelete ? <button type="button" aria-label={`Delete ${name(r)}`} onClick={() => setConfirm(r)} className={icon}><Trash2 size={17} /></button> : null}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.pages > 1 ? <div className="mt-4 flex items-center justify-between"><Button variant="light" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm text-muted">Page {page} of {data.pages} ({data.total} total)</span><Button variant="light" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button></div> : null}

      <Modal open={Boolean(edit)} onClose={() => !busy && setEdit(null)} title={edit?.row ? `Edit ${c.noun}` : `Add ${c.noun}`}>
        {edit ? (
          <form onSubmit={save} noValidate className="grid gap-5">
            {edit.row && c.detail ? <Detail render={c.detail} row={edit.row} reload={load} close={() => setEdit(null)} /> : null}
            {fields.map((f) => {
              const v = edit.values[f.key], common = { label: f.label, error: errors[f.key] ?? Object.entries(errors).find(([k]) => k.startsWith(f.key + "."))?.[1], hint: f.hint };
              if (f.type === "image") return <div key={f.key}><LocalImageField label={f.label} folder={f.folder ?? "misc"} value={String(v ?? "")} onChange={(u) => set(f.key, u)} />{common.error ? <p role="alert" className="mt-1 text-sm text-red-700">{common.error}</p> : null}</div>;
              if (f.type === "bool") return <label key={f.key} className="flex min-h-11 items-center gap-3 font-semibold"><input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} className="size-5 accent-[#0754B8]" />{f.label}</label>;
              if (f.type === "select") return <Field key={f.key} {...common}><Select value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</Select></Field>;
              if (f.type === "textarea" || f.type === "lines") return <Field key={f.key} {...common} hint={f.type === "lines" ? "One per line" : f.hint}><Textarea rows={4} value={Array.isArray(v) ? v.join("\n") : String(v ?? "")} onChange={(e) => set(f.key, f.type === "lines" ? e.target.value.split("\n") : e.target.value)} /></Field>;
              if (f.type === "combo") return <div key={f.key}><Field {...common}><Input list={`l-${f.key}`} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} /></Field><datalist id={`l-${f.key}`}>{f.options!.map((o) => <option key={o} value={o} />)}</datalist></div>;
              return <Field key={f.key} {...common}><Input type={f.type === "date" ? "date" : f.type === "money" ? "number" : "text"} {...(f.type === "money" && { min: 0.5, step: "0.01", inputMode: "decimal" })} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} /></Field>;
            })}
            <div className="flex justify-end gap-3"><Button type="button" variant="light" onClick={() => setEdit(null)}>Close</Button>{fields.length ? <Button disabled={busy}>{busy ? "Saving..." : "Save"}</Button> : null}</div>
          </form>
        ) : null}
      </Modal>
      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} title={`Delete this ${c.noun}?`} className="max-w-md">
        <p className="mb-6 text-muted">“{confirm ? name(confirm) : ""}” will be permanently deleted. This cannot be undone.</p>
        <div className="flex justify-end gap-3"><Button variant="light" onClick={() => setConfirm(null)}>Keep</Button><Button variant="danger" disabled={busy} onClick={remove}>Delete</Button></div>
      </Modal>
    </>
  );
}

function Detail({ render, row, reload, close }: { render: NonNullable<Config["detail"]>; row: Row; reload: () => void; close: () => void }) {
  return <>{render(row, reload, close)}</>;
}
