import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/teacher/students")({
  head: () => ({ meta: [{ title: "Students & Class — TeachLearn AI" }] }),
  component: Students,
});

function Students() {
  const { data } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id,full_name,class_name").in("id", ids);
      return data ?? [];
    },
  });
  type Student = { id: string; full_name: string; class_name: string | null };
  const byClass = new Map<string, Student[]>();
  (data ?? []).forEach((s) => {
    const k = s.class_name ?? "Unassigned";
    if (!byClass.has(k)) byClass.set(k, []);
    byClass.get(k)!.push(s as Student);
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Students & Class" breadcrumbs={["Home", "Students"]}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...byClass.entries()].map(([cls, list]) => (
          <div key={cls} className="rounded-2xl bg-card border p-5">
            <div className="font-display font-bold">{cls}</div>
            <div className="text-xs text-muted-foreground mb-3">{list.length} students</div>
            <div className="space-y-2">
              {list.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <Avatar className="size-7"><AvatarFallback className="text-[10px]">{(s.full_name || "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  {s.full_name}
                </div>
              ))}
            </div>
          </div>
        ))}
        {byClass.size === 0 && <div className="text-muted-foreground">No students yet.</div>}
      </div>
    </PortalShell>
  );
}