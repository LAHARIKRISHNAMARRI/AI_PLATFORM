import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { adminNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decideLeave } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/leaves")({
  head: () => ({ meta: [{ title: "All Leaves — TeachLearn AI" }] }),
  component: Leaves,
});

function Leaves() {
  const qc = useQueryClient();
  const decide = useServerFn(decideLeave);
  const { data } = useQuery({
    queryKey: ["admin-leaves"],
    queryFn: async () => {
      const { data } = await supabase.from("leaves").select("*").order("created_at", { ascending: false });
      if (!data) return [];
      const ids = [...new Set(data.map((l) => l.teacher_id))];
      const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      return data.map((l) => ({ ...l, teacher_name: profs?.find((p) => p.id === l.teacher_id)?.full_name ?? "Teacher" }));
    },
  });
  async function act(id: string, approve: boolean) {
    try {
      await decide({ data: { id, approve } });
      toast.success(approve ? "Approved" : "Rejected");
      qc.invalidateQueries({ queryKey: ["admin-leaves"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  return (
    <PortalShell role="admin" nav={adminNav} title="Leave Requests" breadcrumbs={["Home", "Leaves"]}>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left"><tr><th className="py-3 px-4">Teacher</th><th className="py-3 px-4">From</th><th className="py-3 px-4">To</th><th className="py-3 px-4">Reason</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Action</th></tr></thead>
          <tbody>
            {(data ?? []).map((l) => (
              <tr key={l.id} className="border-t">
                <td className="py-3 px-4 font-medium">{l.teacher_name}</td>
                <td className="py-3 px-4">{l.from_date}</td>
                <td className="py-3 px-4">{l.to_date}</td>
                <td className="py-3 px-4">{l.reason}</td>
                <td className="py-3 px-4"><Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{l.status}</Badge></td>
                <td className="py-3 px-4">
                  {l.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => act(l.id, true)}>Approve</Button>
                      <Button size="sm" variant="ghost" onClick={() => act(l.id, false)}>Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No leaves.</td></tr>}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}