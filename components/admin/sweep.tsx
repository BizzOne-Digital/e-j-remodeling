"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
export const Sweep = () => (
  <div className="card mt-2 flex flex-wrap items-center justify-between gap-4 p-5"><p className="max-w-xl"><strong>Unused uploads.</strong> <span className="text-muted">Remove images uploaded over a day ago that no page uses.</span></p>
    <Button type="button" variant="light" size="sm" onClick={async () => { try { const r = await api<{ removed: number }>("/api/admin/uploads/sweep", { method: "POST" }); toast.success(r.removed ? `${r.removed} unused image(s) removed.` : "No unused images found."); } catch (e) { toast.error((e as Error).message); } }}>Clean up</Button></div>
);
