"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Title } from "./shell";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Info = { email: string; sessions: { id: string; current: boolean; createdAt: string; expiresAt: string }[] };
export function Account() {
  const [info, set] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<Info>("/api/admin/account").then(set, (e) => toast.error(e.message)), []);
  useEffect(() => { load(); }, [load]);
  async function change(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, d = Object.fromEntries(new FormData(form));
    if (d.next !== d.again) return void toast.error("The new passwords do not match.");
    setBusy(true);
    try { await api("/api/admin/account", { method: "PATCH", body: { current: d.current, next: d.next } }); form.reset(); toast.success("Password changed. Other sessions were signed out."); load(); } catch (err) { toast.error((err as Error).message); }
    setBusy(false);
  }
  return (
    <>
      <Title text={info ? `Signed in as ${info.email}` : undefined}>Account</Title>
      <div className="grid gap-6 lg:grid-cols-2">
        <form method="post" onSubmit={change} className="card grid content-start gap-5 p-6"><h2 className="font-sans text-lg font-bold tracking-normal">Change password</h2>
          <Field label="Current password"><Input name="current" type="password" required autoComplete="current-password" /></Field>
          <Field label="New password" hint="At least 12 characters"><Input name="next" type="password" minLength={12} required autoComplete="new-password" /></Field>
          <Field label="Repeat new password"><Input name="again" type="password" minLength={12} required autoComplete="new-password" /></Field>
          <Button disabled={busy}>{busy ? "Saving..." : "Change Password"}</Button>
        </form>
        <section className="card p-6"><h2 className="mb-4 font-sans text-lg font-bold tracking-normal">Active sessions</h2>
          <ul className="divide-y">{info?.sessions.map((s) => <li key={s.id} className="py-3"><strong>{s.current ? "This device" : "Another device"}</strong><span className="block text-sm text-muted">Signed in {formatDate(s.createdAt)}, expires {formatDate(s.expiresAt)}</span></li>)}</ul>
          {info && info.sessions.length > 1 ? <Button variant="light" size="sm" className="mt-4" onClick={async () => { try { await api("/api/admin/account", { method: "DELETE" }); toast.success("Other sessions signed out."); load(); } catch (e) { toast.error((e as Error).message); } }}>Sign out other devices</Button> : null}
        </section>
      </div>
    </>
  );
}
