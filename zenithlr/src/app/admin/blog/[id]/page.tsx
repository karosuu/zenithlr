import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getSessionEmail } from "@/lib/auth";
import { getPostById } from "@/lib/store";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">Edit article</h1>
      <PostForm initial={post} />
    </div>
  );
}
