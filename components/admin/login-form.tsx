"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [s, set] = useState({ busy: false, error: "" });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    set({ busy: true, error: "" });
    try { await api("/api/auth/login", { body: d }); router.replace("/admin/dashboard"); router.refresh(); }
    catch (err) { set({ busy: false, error: (err as Error).message }); }
  }
  return (
    <form method="post" onSubmit={submit} className="grid gap-5">
      <Field label="Email"><Input name="email" type="email" required autoComplete="username" /></Field>
      <Field label="Password"><Input name="password" type="password" required autoComplete="current-password" /></Field>
      {s.error ? <p role="alert" className="text-sm font-medium text-red-700">{s.error}</p> : null}
      <Button size="lg" disabled={s.busy}>{s.busy ? "Signing in..." : "Sign In"}</Button>
    </form>
  );
}
