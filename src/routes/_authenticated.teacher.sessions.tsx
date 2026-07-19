import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/teacher/sessions")({
  head: () => ({ meta: [{ title: "My Sessions — TeachLearn AI" }] }),
  component: SessionsPage,
});

function SessionsPage() {
  const { data } = useQuery({
    queryKey: ["teacher-sessions"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const { data, error } = await supabase
        .from("sessions")
        .select("id,title,subject,session_date,start_time,end_time,class_name,status,materials(count)")
        .eq("teacher_id", uid)
        .order("session_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="My Sessions" breadcrumbs={["Home", "My Sessions"]}>
      <div className="flex justify-end mb-4">
        <Button asChild><Link to="/teacher/schedule"><Plus className="size-4 mr-1" /> Schedule New</Link></Button>
      </div>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-secondary">
            <tr>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Materials</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.id} className="border-t hover:bg-secondary/40">
                <td className="py-3 px-4 font-medium">{s.title}</td>
                <td className="py-3 px-4">{s.subject}</td>
                <td className="py-3 px-4">{s.session_date}</td>
                <td className="py-3 px-4">{s.start_time}–{s.end_time}</td>
                <td className="py-3 px-4">{s.class_name}</td>
                <td className="py-3 px-4">{Array.isArray(s.materials) ? s.materials[0]?.count ?? 0 : 0}</td>
                <td className="py-3 px-4"><Badge variant="secondary" className="capitalize">{s.status}</Badge></td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No sessions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}