"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-mist px-6 text-center"><div>
      <h1 className="text-3xl">Something went wrong</h1><p className="mt-4 text-lg text-muted">Please try again, or call <a className="font-bold text-royal underline" href="tel:5706562154">570-656-2154</a>.</p>
      <Button className="mt-7" onClick={reset}>Try Again</Button>
    </div></main>
  );
}
