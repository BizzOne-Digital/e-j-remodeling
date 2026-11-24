import { LockKeyhole } from "lucide-react";
export function PaymentShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="marble min-h-[70vh] px-4 py-14 sm:py-20"><div className="card mx-auto max-w-xl overflow-hidden">
      <div className="flex items-center gap-4 bg-night px-6 py-6 text-white sm:px-9"><LockKeyhole size={28} className="shrink-0 text-bright" aria-hidden /><h1 className="text-2xl">{title}</h1></div>
      <div className="p-6 sm:p-9">{children}</div>
    </div></section>
  );
}
