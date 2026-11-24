import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { currentAdmin, isAuthConfigured } from "@/lib/auth";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const configured = isAuthConfigured();
  if (configured && (await currentAdmin())) redirect("/admin/dashboard");
  const { expired } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-4 py-10"><div className="w-full max-w-md">
      <Image src="/images/logo.png" alt="E&J Kitchen and Bathroom Remodeling, LLC" width={1200} height={400} priority className="mx-auto h-auto w-72" />
      <div className="card p-6 sm:p-8">
        <h1 className="mb-5 text-2xl">Admin sign in</h1>
        {expired ? <p role="status" className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Your session has expired. Please sign in again.</p> : null}
        {configured ? <LoginForm /> : <p className="rounded-lg bg-amber-50 p-4 text-amber-900">Sign-in is not available until MONGODB_URI and AUTH_SECRET (32+ characters) are set.</p>}
      </div>
    </div></main>
  );
}
