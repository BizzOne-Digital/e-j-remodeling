import { requireAdmin } from "@/lib/auth";
import { handler, ok } from "@/lib/http";
import { sweepOrphans } from "@/lib/uploads";
export const POST = handler(async () => { await requireAdmin(); return ok({ removed: await sweepOrphans() }); });
