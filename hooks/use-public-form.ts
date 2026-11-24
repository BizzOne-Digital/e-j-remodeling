"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { api, ApiError } from "@/lib/api";

/** Form-fill timer plus an idempotency key, so a retried submission is stored once. */
const newMeta = () => ({ startedAt: Date.now(), submissionId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2).padEnd(12, "0")}` });

/** Validation code is fetched on first use instead of delaying page load. */
const lazyResolver = <T extends FieldValues>(load: () => Promise<z.ZodType<T>>): Resolver<T> => async (...args) => {
  const [{ zodResolver }, schema] = await Promise.all([import("@hookform/resolvers/zod"), load()]);
  return (zodResolver(schema as never) as unknown as Resolver<T>)(...args);
};

/** Shared behaviour for public forms: validation, spam fields, idempotency and error toasts. */
export function usePublicForm<T extends FieldValues, R = object>(loadSchema: () => Promise<z.ZodType<T>>, url: string, defaultValues: DefaultValues<T>) {
  const form = useForm<T>({ resolver: lazyResolver(loadSchema), defaultValues });
  const [result, setResult] = useState<R | null>(null);
  const meta = useRef<ReturnType<typeof newMeta> | null>(null);
  useEffect(() => { if (!result) meta.current = newMeta(); }, [result]);
  async function send(data: T) {
    try {
      const r = await api<R>(url, { body: { ...data, ...meta.current } });
      form.reset();
      setResult(r);
    } catch (e) {
      if (e instanceof ApiError && e.fields) for (const [k, message] of Object.entries(e.fields)) form.setError(k as Path<T>, { message }, { shouldFocus: true });
      toast.error((e as Error).message);
    }
  }
  const submit = (e: React.FormEvent) => form.handleSubmit(send, () => { toast.error("Please check the highlighted fields."); })(e);
  const err = (k: Path<T>) => form.formState.errors[k]?.message as string | undefined;
  return { ...form, submit, err, result, clear: () => setResult(null), busy: form.formState.isSubmitting };
}
