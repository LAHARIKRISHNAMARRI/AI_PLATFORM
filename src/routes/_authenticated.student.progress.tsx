import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/student/progress")({
  head: () => ({ meta: [{ title: "My Progress — TeachLearn AI" }] }),
  component: Progress,
});

function Progress() {
  const { data } = useQuery({
    queryKey: ["student-progress"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data } = await supabase.from("exam_attempts").select("score,submitted_at,concept_scores").eq("student_id", userData.user!.id).order("submitted_at");
      return data ?? [];
    },
  });
  const chart = (data ?? []).map((a, i) => ({ name: `Attempt ${i + 1}`, score: Number(a.score) }));
  const concepts: Record<string, { sum: number; n: number }> = {};
  (data ?? []).forEach((a) => {
    for (const [k, v] of Object.entries((a.concept_scores ?? {}) as Record<string, number>)) {
      concepts[k] ??= { sum: 0, n: 0 };
      concepts[k].sum += v;
      concepts[k].n++;
    }
  });
  return (
    <PortalShell role="student" nav={studentNav} title="My Progress" breadcrumbs={["Home", "Progress"]}>
      <div className="rounded-2xl bg-card border p-5">
        <h2 className="font-display font-bold mb-4">Score Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="oklch(0.56 0.22 285)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(concepts).map(([k, v]) => {
          const pct = Math.round(v.sum / v.n);
          return (
            <div key={k} className="rounded-2xl bg-card border p-5">
              <div className="font-medium">{k}</div>
              <div className="h-2 mt-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-right text-sm text-muted-foreground mt-1">{pct}% mastery</div>
            </div>
          );
        })}
        {Object.keys(concepts).length === 0 && <div className="text-muted-foreground col-span-full">Take an assessment to see your concept mastery.</div>}
      </div>
    </PortalShell>
  );
}