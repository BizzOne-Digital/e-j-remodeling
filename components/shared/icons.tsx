import { Layers, Wrench, Zap, type LucideProps } from "lucide-react";

const svg = (p: LucideProps) => ({ width: p.size ?? 24, height: p.size ?? 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: p.strokeWidth ?? 1.6, strokeLinecap: "round", strokeLinejoin: "round", className: p.className, "aria-hidden": true } as const);
const Plumbing = (p: LucideProps) => (
  <svg {...svg(p)}><path d="M3 3h5v3H3zM4 6v7a5.5 5.5 0 0 0 11 0v-1.5a1.5 1.5 0 0 1 1.5-1.5H19M7 6v7a2.5 2.5 0 0 0 5 0v-1.500A4.500 4.500 0 0 1 16.500 7H19M19 5.500v6h2.500v-6zM3.500 9.500h4M8 20h3" /></svg>
);
const Cabinet = (p: LucideProps) => (
  <svg {...svg(p)}><path d="M2 4h20v2.500H2zM3 6.500V20h18V6.500M12 6.500V20M5.500 9h4v8.500h-4zM14.500 9h4v8.500h-4zM10.800 12v2.500M13.200 12v2.500M4.500 20v1.500M19.500 20v1.500" /></svg>
);
const Shower = (p: LucideProps) => (
  <svg {...svg(p)}><path d="M12 2v3M5 12a7 7 0 0 1 14 0zM4 12h16M7.500 15l-.6 1.800M12 15v1.800M16.500 15l.6 1.800M6.400 19.200l-.6 1.800M12 19.200V21M17.600 19.200l.6 1.800M9.700 17v1.600M14.300 17v1.600" /></svg>
);
const Floor = (p: LucideProps) => (
  <svg {...svg(p)}><path d="M9 5h13l-7 11H2zM2 16v2.500h13L22 7.500V5M13.300 5l-7 11M17.600 5l-7 11M8 9.500l-2 3M16.800 8.500l-2.300 3.500" /></svg>
);
const map = { electrical: Zap, plumbing: Plumbing, drywall: Layers, cabinets: Cabinet, showers: Shower, floors: Floor, wrench: Wrench };
export function ServiceIcon({ name, ...p }: { name: string } & LucideProps) {
  const C = map[name as keyof typeof map] ?? Wrench;
  return <C aria-hidden {...p} />;
}
