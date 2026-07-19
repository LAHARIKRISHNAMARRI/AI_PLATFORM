import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/ai-hub")({
  head: () => ({ meta: [{ title: "AI Learning Hub — TeachLearn AI" }] }),
  component: Hub,
});

function Hub() {
  const { data } = useQuery({
    queryKey: ["ai-hub"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase.from("exam_attempts").select("concept_scores").eq("student_id", userData.user!.id);
      const concepts: Record<string, { sum: number; n: number }> = {};
      (data ?? []).forEach((a) => {
        for (const [k, v] of Object.entries((a.concept_scores ?? {}) as Record<string, number>)) {
          concepts[k] ??= { sum: 0, n: 0 };
          concepts[k].sum += v; concepts[k].n++;
        }
      });
      return Object.entries(concepts).map(([k, v]) => ({ concept: k, mastery: Math.round(v.sum / v.n) })).sort((a, b) => a.mastery - b.mastery);
    },
  });
  const weak = (data ?? []).filter((c) => c.mastery < 70).slice(0, 6);
  return (
    <PortalShell role="student" nav={studentNav} title="AI Learning Hub" breadcrumbs={["Home", "AI Hub"]}>
      <div className="rounded-2xl bg-card border p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl stat-pill-violet flex items-center justify-center"><Brain className="size-5" /></div>
          <div>
            <h2 className="font-display font-bold">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">Concepts where a little practice will lift your score fastest.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {weak.map((c) => (
            <div key={c.concept} className="border rounded-xl p-4">
              <div className="flex justify-between"><div className="font-medium">{c.concept}</div><span className="text-sm text-muted-foreground">{c.mastery}%</span></div>
              <div className="h-2 mt-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${c.mastery}%` }} />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Head to Ask Doubt for a guided explanation, or attempt another assessment to reinforce this concept.</div>
            </div>
          ))}
          {weak.length === 0 && <div className="text-muted-foreground">Great job — no weak concepts detected. Keep it up!</div>}
        </div>
      </div>
    </PortalShell>
  );
}