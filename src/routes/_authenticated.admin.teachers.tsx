import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { adminNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createTeacher } from "@/lib/admin.functions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/teachers")({
  head: () => ({ meta: [{ title: "Manage Teachers — TeachLearn AI" }] }),
  component: Teachers,
});

function Teachers() {
  const qc = useQueryClient();
  const create = useServerFn(createTeacher);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ email: "", password: "", full_name: "", subject: "", department: "" });
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [];
      const [profiles, teachers] = await Promise.all([
        supabase.from("profiles").select("id,full_name,department").in("id", ids),
        supabase.from("teachers").select("*").in("user_id", ids),
      ]);
      return (profiles.data ?? []).map((p) => ({
        ...p,
        meta: (teachers.data ?? []).find((t) => t.user_id === p.id),
      }));
    },
  });
  return (
    <PortalShell role="admin" nav={adminNav} title="Manage Teachers" breadcrumbs={["Home", "Teachers"]}>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Add teacher</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a teacher</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await create({ data: f });
                  toast.success("Teacher created");
                  setOpen(false); setF({ email: "", password: "", full_name: "", subject: "", department: "" });
                  qc.invalidateQueries({ queryKey: ["admin-teachers"] });
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                } finally { setSaving(false); }
              }}
            >
              <div><Label>Full name</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required /></div>
              <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
              <div><Label>Password</Label><Input type="password" minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
              <div><Label>Subject</Label><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} required /></div>
              <div><Label>Department</Label><Input value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} required /></div>
              <Button type="submit" className="w-full" disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left"><tr><th className="py-3 px-4">Name</th><th className="py-3 px-4">Department</th><th className="py-3 px-4">Subject</th><th className="py-3 px-4">Joined</th></tr></thead>
          <tbody>
            {(data ?? []).map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-3 px-4 font-medium">{t.full_name}</td>
                <td className="py-3 px-4">{t.department ?? "-"}</td>
                <td className="py-3 px-4">{t.meta?.subject ?? "-"}</td>
                <td className="py-3 px-4">{t.meta?.joined_at ?? "-"}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No teachers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}