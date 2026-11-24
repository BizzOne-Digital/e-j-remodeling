import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { PageHero } from "@/components/shared/sections";
import { ReviewGrid } from "@/components/shared/review-grid";
import { ReviewForm } from "@/components/forms/review-form";
import { getReviews, getSite } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => pageMeta("testimonials", "/testimonials");
export default async function TestimonialsPage() {
  const [{ home }, reviews] = await Promise.all([getSite(), getReviews()]);
  return (
    <>
      <PageHero {...home.pages.testimonials} crumb="Testimonials" path="/testimonials" />
      <section className="section marble" aria-label="Customer reviews"><div className="wrap">
        {reviews.items.length ? <ReviewGrid first={reviews.items} more={reviews.hasMore} /> : (
          <div className="mx-auto max-w-xl text-center"><MessagesSquare size={48} strokeWidth={1.300} className="mx-auto text-primary" aria-hidden /><h2 className="h2 mt-4">No reviews published yet</h2><p className="mt-3 text-lg text-muted">If you have worked with us, be the first to share your experience below.</p></div>
        )}
      </div></section>
      <section id="leave-review" className="section bg-mist" aria-labelledby="lr-h"><div className="wrap grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div><h2 id="lr-h" className="h2">Leave a Review</h2><p className="mt-4 text-lg leading-relaxed text-muted">Tell other homeowners about your project. Every review is checked before it is published, and your email address is never shown.</p></div>
        <ReviewForm />
      </div></section>
    </>
  );
}
