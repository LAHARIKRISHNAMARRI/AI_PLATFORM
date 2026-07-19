import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/teacher/exams")({
  head: () => ({ meta: [{ title: "Exams — TeachLearn AI" }] }),
  component: Exams,
});

function Exams() {
  const { data } = useQuery({
    queryKey: ["teacher-exams"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const { data } = await supabase
        .from("exams")
        .select("id,title,subject,class_name,published,duration_minutes,exam_questions(count),exam_attempts(count)")
        .eq("teacher_id", uid)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Exams" breadcrumbs={["Home", "Exams"]}>
      <div className="flex justify-end mb-4">
        <Button asChild><Link to="/teacher/question-generation">Create with AI</Link></Button>
      </div>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left"><tr><th className="py-3 px-4">Title</th><th className="py-3 px-4">Subject</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">Questions</th><th className="py-3 px-4">Attempts</th><th className="py-3 px-4">Duration</th><th className="py-3 px-4">Status</th></tr></thead>
          <tbody>
            {(data ?? []).map((e) => (
              <tr key={e.id} className="border-t">
                <td className="py-3 px-4 font-medium">{e.title}</td>
                <td className="py-3 px-4">{e.subject}</td>
                <td className="py-3 px-4">{e.class_name}</td>
                <td className="py-3 px-4">{e.exam_questions?.[0]?.count ?? 0}</td>
                <td className="py-3 px-4">{e.exam_attempts?.[0]?.count ?? 0}</td>
                <td className="py-3 px-4">{e.duration_minutes} min</td>
                <td className="py-3 px-4"><Badge variant={e.published ? "default" : "secondary"}>{e.published ? "Published" : "Draft"}</Badge></td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No exams yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}