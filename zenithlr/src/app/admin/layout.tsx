import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { getSessionEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();

  if (!email) {
    return children;
  }

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sand-soft bg-cream px-6 py-8 lg:block">
        <p className="font-serif text-2xl tracking-[0.16em] uppercase">Zenith</p>
        <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-sand-deep">Panel</p>
        <nav className="mt-10 flex flex-col gap-3 text-sm">
          <Link href="/admin" className="hover:text-sand-deep">
            Overview
          </Link>
          <Link href="/admin/pages" className="hover:text-sand-deep">
            Pages EN / ES
          </Link>
          <Link href="/admin/properties" className="hover:text-sand-deep">
            Properties
          </Link>
          <Link href="/admin/reviews" className="hover:text-sand-deep">
            Reviews
          </Link>
          <Link href="/admin/blog" className="hover:text-sand-deep">
            Blog
          </Link>
          <a href="/en" className="mt-6 text-ink/50 hover:text-ink">
            View site
          </a>
          <SignOutButton />
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-sand-soft px-5 py-4 lg:hidden">
          <p className="font-serif text-xl">Zenith</p>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/pages">Pages</Link>
            <Link href="/admin/properties">Listings</Link>
            <Link href="/admin/reviews">Reviews</Link>
            <Link href="/admin/blog">Blog</Link>
          </div>
        </header>
        <div className="px-5 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
