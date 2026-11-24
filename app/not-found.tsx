import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 py-16 text-center text-white"><div>
      <Image src="/images/logo.png" alt="E&J Kitchen and Bathroom Remodeling, LLC" width={1200} height={400} className="mx-auto h-auto w-80" />
      <h1 className="mt-6 text-3xl sm:text-4xl">Page not found</h1><p className="mt-4 text-lg text-silver">The page you are looking for has moved or does not exist.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild><Link href="/">Back to Home</Link></Button><Button asChild variant="outline"><Link href="/contact">Contact Us</Link></Button></div>
    </div></main>
  );
}
