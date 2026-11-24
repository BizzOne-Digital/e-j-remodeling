export class ApiError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string>) { super(message); }
}
/** Browser fetch helper for our JSON endpoints; throws ApiError with a displayable message. */
export async function api<T = object>(url: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? (opts.body !== undefined || opts.form ? "POST" : "GET"),
      headers: opts.form ? undefined : { "Content-Type": "application/json" },
      body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    });
  } catch { throw new ApiError("Could not connect. Check your internet connection and try again.", 0); }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 401 && url.startsWith("/api/admin")) window.location.replace("/admin/login?expired=1");
    throw new ApiError(json?.error ?? (res.status === 413 ? "That file is too large." : "Something went wrong. Please try again."), res.status, json?.fields);
  }
  return json as T;
}
