import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { adminNav } from "@/lib/nav-items";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({ meta: [{ title: "Manage Students — TeachLearn AI" }] }),
  component: Students,
});

function Students() {
  const { data } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id,full_name,class_name").in("id", ids);
      return data ?? [];
    },
  });
  return (
    <PortalShell role="admin" nav={adminNav} title="Manage Students" breadcrumbs={["Home", "Students"]}>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left"><tr><th className="py-3 px-4">Name</th><th className="py-3 px-4">Class</th></tr></thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.id} className="border-t"><td className="py-3 px-4 font-medium">{s.full_name}</td><td className="py-3 px-4">{s.class_name ?? "-"}</td></tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={2} className="py-12 text-center text-muted-foreground">No students yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}