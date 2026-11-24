import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { currentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
/** Gate for the panel. Pages hold no data themselves; every admin API checks the session again. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
