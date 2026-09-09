import { redirect } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getSessionEmail } from "@/lib/auth";

export default async function NewPostPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  return (
    <div>
      <h1 className="font-serif mb-8 text-4xl">New article</h1>
      <PostForm isNew />
    </div>
  );
}
