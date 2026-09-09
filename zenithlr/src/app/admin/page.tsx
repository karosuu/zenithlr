import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getAllListings, getAllPosts, getAllReviews, getDb } from "@/lib/store";

export default async function AdminHomePage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const listings = await getAllListings();
  const posts = await getAllPosts();
  const reviews = await getAllReviews();
  const db = await getDb();

  return (
    <div>
      <h1 className="font-serif text-4xl">Overview</h1>
      <p className="mt-2 text-ink/60">
        Edit pages in English and Spanish, publish listings, reviews, and photos.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/properties" className="border border-sand-soft bg-cream p-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">Properties</p>
          <p className="font-serif mt-2 text-4xl">{listings.length}</p>
        </Link>
        <Link href="/admin/reviews" className="border border-sand-soft bg-cream p-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">Reviews</p>
          <p className="font-serif mt-2 text-4xl">{reviews.length}</p>
        </Link>
        <Link href="/admin/blog" className="border border-sand-soft bg-cream p-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">Blog posts</p>
          <p className="font-serif mt-2 text-4xl">{posts.length}</p>
        </Link>
        <Link href="/admin/leads" className="border border-sand-soft bg-cream p-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">Leads</p>
          <p className="font-serif mt-2 text-4xl">{db.leads.length}</p>
        </Link>
      </div>
    </div>
  );
}
