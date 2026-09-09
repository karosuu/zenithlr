import { notFound, redirect } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { getSessionEmail } from "@/lib/auth";
import { getListingById } from "@/lib/store";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">Edit property</h1>
      <PropertyForm initial={listing} />
    </div>
  );
}
