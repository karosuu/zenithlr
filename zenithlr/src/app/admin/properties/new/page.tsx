import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { getSessionEmail } from "@/lib/auth";

export default async function NewPropertyPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">New property</h1>
      <PropertyForm isNew />
    </div>
  );
}
