import { redirect } from "next/navigation";
import { PagesEditor } from "@/components/admin/PagesEditor";
import { getSessionEmail } from "@/lib/auth";
import { getDb } from "@/lib/store";

export default async function AdminPagesPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const db = await getDb();
  return (
    <div>
      <h1 className="font-serif text-4xl">Pages</h1>
      <p className="mt-2 mb-8 text-ink/60">
        Each field has English and Spanish. Leave one empty and the other language is used.
      </p>
      <PagesEditor pages={db.pages} />
    </div>
  );
}
