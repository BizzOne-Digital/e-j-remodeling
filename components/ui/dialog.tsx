"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }) {
  return (
    <D.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[90] bg-ink/70 [animation:fade_.2s]" />
        <D.Content aria-describedby={undefined} className={cn("fixed left-1/2 top-1/2 z-[91] max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7 [animation:fade_.2s]", className)}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <D.Title className="font-sans text-xl font-bold tracking-normal">{title}</D.Title>
            <D.Close aria-label="Close" className="grid size-11 shrink-0 -mt-2 -mr-2 place-items-center rounded-lg hover:bg-mist"><X size={20} /></D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
