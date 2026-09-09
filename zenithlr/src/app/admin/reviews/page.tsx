import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewList } from "@/components/admin/ReviewList";
import { getSessionEmail } from "@/lib/auth";
import { getAllReviews } from "@/lib/store";

export default async function AdminReviewsPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const reviews = await getAllReviews();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Reviews</h1>
        <Link
          href="/admin/reviews/new"
          className="bg-ink px-4 py-2 text-[11px] tracking-[0.16em] uppercase text-sand"
        >
          New review
        </Link>
      </div>
      {reviews.length === 0 ? (
        <p className="mt-8 text-ink/60">
          No reviews yet. Add one in English and Spanish when you are ready.
        </p>
      ) : (
        <ReviewList
          reviews={reviews.map((review) => ({
            id: review.id,
            author: review.author,
            date: review.date,
            published: review.published,
            featured: review.featured,
          }))}
        />
      )}
    </div>
  );
}
