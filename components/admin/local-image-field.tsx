"use client";
import { useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MAX_SOURCE_BYTES, MAX_UPLOAD_BYTES, UPLOAD_MIMES, type UPLOAD_FOLDERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Resizes and re-encodes large photos so they fit Vercel's request limit. GIFs pass through to keep animation. */
async function compress(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size <= 600_000) return file;
  const bmp = await createImageBitmap(file);
  try {
    for (const [max, q] of [[2400, 0.85], [2000, 0.78], [1600, 0.7]] as const) {
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", q));
      if (blob && blob.size < MAX_UPLOAD_BYTES * 0.95) {
        // Browsers without WebP encoding fall back to PNG; keep the type honest.
        return blob.size < file.size ? new File([blob], "image", { type: blob.type }) : file;
      }
    }
  } finally { bmp.close(); }
  return file;
}

export function LocalImageField({ label, value, folder, onChange }: { label: string; value: string; folder: (typeof UPLOAD_FOLDERS)[number]; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [broken, setBroken] = useState("");
  async function upload(f?: File) {
    if (!f || busy) return;
    if (!(UPLOAD_MIMES as readonly string[]).includes(f.type)) return void toast.error("Use a PNG, JPEG, WebP or GIF image.");
    if (f.size > MAX_SOURCE_BYTES) return void toast.error("Choose an image under 8 MB.");
    setBusy(true);
    try {
      const file = await compress(f).catch(() => { throw new Error("That file could not be read as an image."); });
      if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is still over 4 MB. Please choose a smaller one.");
      const form = new FormData();
      form.set("file", file); form.set("folder", folder);
      onChange((await api<{ url: string }>("/api/upload", { form })).url);
      toast.success("Image uploaded. Save to publish it.");
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  }
  const btn = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-silver bg-white px-3.5 text-sm font-semibold hover:border-primary disabled:opacity-60";
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-1.5 text-sm font-semibold">{label}</p>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
        className={cn("flex flex-wrap items-center gap-4 rounded-lg border-2 border-dashed p-3 transition", drag ? "border-primary bg-sky-50" : "border-silver")}>
        {value && broken !== value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of a just-uploaded file
          <img src={value} alt="Current image" onError={() => setBroken(value)} className="h-24 w-36 rounded-md bg-navy object-contain" />
        ) : <span className="grid h-24 w-36 place-items-center rounded-md bg-mist text-muted">{broken && broken === value ? "Missing" : <ImagePlus aria-hidden />}</span>}
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className={btn}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : value ? <RefreshCw size={16} /> : <ImagePlus size={16} />}{busy ? "Uploading..." : value ? "Replace" : "Choose image"}</button>
            {value ? <button type="button" disabled={busy} onClick={() => onChange("")} className={btn}><Trash2 size={16} />Remove</button> : null}
          </div>
          <p className="text-xs text-muted">Or drop an image here. PNG, JPEG, WebP, or GIF up to 8 MB.</p>
        </div>
        <input ref={input} type="file" accept={UPLOAD_MIMES.join(",")} className="hidden" aria-label={`${label} file`} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
    </div>
  );
}
