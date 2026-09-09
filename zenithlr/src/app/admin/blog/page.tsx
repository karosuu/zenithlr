import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getAllPosts } from "@/lib/store";

export default async function AdminBlogPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="bg-ink px-4 py-2 text-[11px] tracking-[0.16em] uppercase text-sand"
        >
          New article
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="mt-8 text-ink/60">
          No articles yet. Create one in English and Spanish when you are ready.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-sand-soft border border-sand-soft bg-cream">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.id}`}
              className="block px-5 py-4 hover:bg-sand-soft/40"
            >
              <p>{post.title.en || post.title.es}</p>
              <p className="text-sm text-ink/50">
                {post.date} · {post.published ? "Published" : "Draft"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
