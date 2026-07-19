import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/leaves")({
  head: () => ({ meta: [{ title: "Leaves — TeachLearn AI" }] }),
  component: Leaves,
});

function Leaves() {
  const qc = useQueryClient();
  const [f, setF] = useState({ from_date: "", to_date: "", reason: "" });
  const { data } = useQuery({
    queryKey: ["teacher-leaves"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("leaves")
        .select("*")
        .eq("teacher_id", userData.user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Leaves" breadcrumbs={["Home", "Leaves"]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <form
          className="rounded-2xl bg-card border p-6 space-y-4 h-fit"
          onSubmit={async (e) => {
            e.preventDefault();
            const { data: userData } = await supabase.auth.getUser();
            const { error } = await supabase.from("leaves").insert({ ...f, teacher_id: userData.user!.id });
            if (error) return toast.error(error.message);
            toast.success("Leave requested");
            setF({ from_date: "", to_date: "", reason: "" });
            qc.invalidateQueries({ queryKey: ["teacher-leaves"] });
          }}
        >
          <h2 className="font-display font-bold">Request leave</h2>
          <div><Label>From</Label><Input type="date" value={f.from_date} onChange={(e) => setF({ ...f, from_date: e.target.value })} required /></div>
          <div><Label>To</Label><Input type="date" value={f.to_date} onChange={(e) => setF({ ...f, to_date: e.target.value })} required /></div>
          <div><Label>Reason</Label><Textarea value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} required /></div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
        <div className="lg:col-span-2 rounded-2xl bg-card border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left"><tr><th className="py-3 px-4">From</th><th className="py-3 px-4">To</th><th className="py-3 px-4">Reason</th><th className="py-3 px-4">Status</th></tr></thead>
            <tbody>
              {(data ?? []).map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="py-3 px-4">{l.from_date}</td>
                  <td className="py-3 px-4">{l.to_date}</td>
                  <td className="py-3 px-4">{l.reason}</td>
                  <td className="py-3 px-4">
                    <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{l.status}</Badge>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No requests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}