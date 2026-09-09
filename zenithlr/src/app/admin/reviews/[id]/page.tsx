import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { getSessionEmail } from "@/lib/auth";
import { getReviewById } from "@/lib/store";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) notFound();
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">Edit review</h1>
      <ReviewForm initial={review} />
    </div>
  );
}
