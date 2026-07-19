import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { adminNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { claimAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";
import { GraduationCap, Users, FileText, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — TeachLearn AI" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const qc = useQueryClient();
  const claim = useServerFn(claimAdmin);
  const { data: myRoles } = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user!.id);
      return (data ?? []).map((r) => r.role);
    },
  });
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [teachers, students, pending, sessions] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("leaves").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("sessions").select("*", { count: "exact", head: true }),
      ]);
      return { teachers: teachers.count ?? 0, students: students.count ?? 0, pending: pending.count ?? 0, sessions: sessions.count ?? 0 };
    },
  });
  const isAdmin = (myRoles ?? []).includes("admin");
  return (
    <PortalShell role="admin" nav={adminNav} title="Admin Dashboard" breadcrumbs={["Home", "Admin"]}>
      {!isAdmin && (
        <div className="mb-6 rounded-2xl border-2 border-primary bg-primary-soft p-5 flex items-center justify-between">
          <div>
            <div className="font-display font-bold">Claim admin access</div>
            <div className="text-sm text-muted-foreground mt-1">You aren't an admin yet. If no admin exists, you can claim it now (first-admin-wins).</div>
          </div>
          <Button onClick={async () => {
            try {
              await claim({});
              toast.success("You're now an admin");
              qc.invalidateQueries({ queryKey: ["my-roles"] });
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          }}>Claim admin</Button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Teachers" value={data?.teachers ?? 0} tone="violet" icon={<GraduationCap className="size-5" />} />
        <StatCard label="Students" value={data?.students ?? 0} tone="emerald" icon={<Users className="size-5" />} />
        <StatCard label="Pending Leaves" value={data?.pending ?? 0} tone="amber" icon={<FileText className="size-5" />} />
        <StatCard label="Sessions" value={data?.sessions ?? 0} tone="sky" icon={<ClipboardCheck className="size-5" />} />
      </div>
    </PortalShell>
  );
}