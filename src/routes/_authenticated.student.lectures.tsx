import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/student/lectures")({
  head: () => ({ meta: [{ title: "My Lectures — TeachLearn AI" }] }),
  component: Lectures,
});

function Lectures() {
  const { data } = useQuery({
    queryKey: ["student-lectures"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("id,title,subject,session_date,start_time,end_time,class_name,status,teaching_method")
        .order("session_date", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="student" nav={studentNav} title="My Lectures" breadcrumbs={["Home", "My Lectures"]}>
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((s) => (
          <div key={s.id} className="rounded-2xl bg-card border p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{s.subject}</div>
                <div className="font-display font-bold mt-1">{s.title}</div>
              </div>
              <Badge variant="secondary" className="capitalize">{s.status}</Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{s.session_date} · {s.start_time}–{s.end_time}</div>
            {s.teaching_method && <div className="mt-2 text-xs stat-pill-violet inline-block px-2 py-1 rounded-md">{s.teaching_method}</div>}
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="text-muted-foreground">No lectures visible for your class yet.</div>}
      </div>
    </PortalShell>
  );
}