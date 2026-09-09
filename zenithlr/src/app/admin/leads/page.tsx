import { redirect } from "next/navigation";
import { LeadList } from "@/components/admin/LeadList";
import { getSessionEmail } from "@/lib/auth";
import { getAllLeads } from "@/lib/store";

export default async function AdminLeadsPage() {
  if (!(await getSessionEmail())) redirect("/admin/login");
  const leads = await getAllLeads();

  return (
    <div>
      <h1 className="font-serif text-4xl">Leads</h1>
      <p className="mt-2 text-ink/60">
        Messages from contact, visits, sell-with-us, and the newsletter form.
      </p>
      {leads.length === 0 ? (
        <p className="mt-8 text-ink/60">No leads yet.</p>
      ) : (
        <LeadList leads={leads} />
      )}
    </div>
  );
}
