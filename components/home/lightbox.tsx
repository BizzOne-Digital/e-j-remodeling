"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import type { GalleryItem } from "@/lib/defaults";

export default function Lightbox({ items, index, onIndex, onClose, label }: { items: GalleryItem[]; index: number; onIndex: (i: number) => void; onClose: () => void; label: (g: GalleryItem) => string }) {
  const g = items[index];
  if (!g) return null;
  const go = (d: number) => onIndex((index + d + items.length) % items.length);
  const btn = "grid size-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30";
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[95] bg-ink/95 [animation:fade_.25s]" />
        <Dialog.Content aria-describedby={undefined} onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }} className="fixed inset-0 z-[96] flex flex-col p-3 text-white outline-none sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-sm text-[#8fd0ff]">{label(g)} · {index + 1} of {items.length}</p><Dialog.Title className="truncate font-sans text-lg font-semibold tracking-normal">{g.title}</Dialog.Title></div>
            <Dialog.Close aria-label="Close gallery" className={btn}><X /></Dialog.Close>
          </div>
          <div key={g.image} className="relative my-4 min-h-0 grow [animation:zoom-in_.3s]"><SmartImage src={g.image} alt={g.title} fill sizes="100vw" className="object-contain" /></div>
          {g.description ? <p className="mx-auto mb-3 max-w-2xl text-center text-silver">{g.description}</p> : null}
          {items.length > 1 ? <div className="flex justify-center gap-4"><button type="button" aria-label="Previous image" className={btn} onClick={() => go(-1)}><ChevronLeft /></button><button type="button" aria-label="Next image" className={btn} onClick={() => go(1)}><ChevronRight /></button></div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
