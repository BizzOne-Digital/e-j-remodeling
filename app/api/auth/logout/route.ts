import { logout } from "@/lib/auth";
import { handler, ok } from "@/lib/http";
export const POST = handler(async () => { await logout(); return ok(); });
