import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { getSessionEmail } from "@/lib/auth";

export default async function NewReviewPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">New review</h1>
      <ReviewForm isNew />
    </div>
  );
}
