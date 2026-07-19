import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { teacherNav } from "@/lib/nav-items";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/teacher/")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — TeachLearn AI" }] }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { data } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const [{ count: sessionsCount }, { count: materialsCount }, { count: examsCount }, { data: upcoming }] = await Promise.all([
        supabase.from("sessions").select("*", { count: "exact", head: true }).eq("teacher_id", uid),
        supabase.from("materials").select("*", { count: "exact", head: true }).eq("uploaded_by", uid),
        supabase.from("exams").select("*", { count: "exact", head: true }).eq("teacher_id", uid),
        supabase
          .from("sessions")
          .select("id,title,subject,session_date,start_time,end_time,class_name,status")
          .eq("teacher_id", uid)
          .order("session_date", { ascending: true })
          .limit(5),
      ]);
      return {
        sessions: sessionsCount ?? 0,
        materials: materialsCount ?? 0,
        exams: examsCount ?? 0,
        upcoming: upcoming ?? [],
      };
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Dashboard" breadcrumbs={["Home", "Dashboard"]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={data?.sessions ?? 0} tone="violet" icon={<Calendar className="size-5" />} hint="All time" />
        <StatCard label="Materials Uploaded" value={data?.materials ?? 0} tone="emerald" icon={<ClipboardList className="size-5" />} />
        <StatCard label="Exams Created" value={data?.exams ?? 0} tone="amber" icon={<FileText className="size-5" />} />
        <StatCard label="Active Classes" value={new Set((data?.upcoming ?? []).map((s) => s.class_name)).size} tone="sky" icon={<Users className="size-5" />} />
      </div>

      <div className="mt-6 rounded-2xl bg-card border p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Upcoming Sessions</h2>
          <Badge variant="secondary">{data?.upcoming?.length ?? 0}</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-4">Topic</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.upcoming ?? []).map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{s.title}</td>
                  <td className="py-3 pr-4">{s.subject}</td>
                  <td className="py-3 pr-4">{s.session_date}</td>
                  <td className="py-3 pr-4">{s.start_time} – {s.end_time}</td>
                  <td className="py-3 pr-4">{s.class_name}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={s.status === "scheduled" ? "default" : "secondary"} className="capitalize">{s.status}</Badge>
                  </td>
                </tr>
              ))}
              {(data?.upcoming ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No sessions yet — schedule one from the sidebar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}