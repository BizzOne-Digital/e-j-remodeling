import { Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { telHref } from "@/lib/utils";
import type { Settings } from "@/lib/defaults";

export function ContactCards({ s }: { s: Settings }) {
  const rows = ([[User, "Contact Person", s.contactPerson, ""], [Phone, "Phone", s.phone, telHref(s.phone)], [Mail, "Email", s.email, `mailto:${s.email}`], [Clock, "Business Hours", s.businessHours, ""], [MapPin, "Address", s.businessAddress, ""], [MapPin, "Service Area", s.serviceAreas, ""]] as const).filter((r) => r[2]);
  return (
    <ul className="grid gap-4">
      {rows.map(([I, label, value, href]) => (
        <li key={label} className="card flex items-center gap-4 p-5">
          <span className="grad grid size-12 shrink-0 place-items-center rounded-xl text-white"><I size={23} aria-hidden /></span>
          <div className="min-w-0"><p className="text-sm text-muted">{label}</p>{href ? <a href={href} className="inline-block py-0.5 text-lg font-bold break-words hover:text-royal">{value}</a> : <p className="text-lg font-bold">{value}</p>}</div>
        </li>
      ))}
    </ul>
  );
}
