import Link from "next/link";
import { redirect } from "next/navigation";
import { PropertyList } from "@/components/admin/PropertyList";
import { getSessionEmail } from "@/lib/auth";
import { getAllListings } from "@/lib/store";

export default async function AdminPropertiesPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const listings = await getAllListings();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="bg-ink px-4 py-2 text-[11px] tracking-[0.16em] uppercase text-sand"
        >
          New property
        </Link>
      </div>
      <PropertyList
        listings={listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          location: listing.location,
          status: listing.status,
          goals: listing.goals,
          price: listing.price,
        }))}
      />
    </div>
  );
}
