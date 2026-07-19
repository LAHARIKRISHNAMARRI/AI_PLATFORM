import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Brain, ClipboardCheck, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { studentNav } from "@/lib/nav-items";

export const Route = createFileRoute("/_authenticated/student/")({
  head: () => ({ meta: [{ title: "Student Dashboard — TeachLearn AI" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { data } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const [profile, sessions, attempts] = await Promise.all([
        supabase.from("profiles").select("full_name,class_name").eq("id", uid).maybeSingle(),
        supabase.from("sessions").select("id,title,subject,session_date,status", { count: "exact" }).eq("status", "completed"),
        supabase.from("exam_attempts").select("score,concept_scores").eq("student_id", uid),
      ]);
      const scores = (attempts.data ?? []).map((a) => Number(a.score));
      const avg = scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0;
      const concepts = new Set<string>();
      (attempts.data ?? []).forEach((a) => Object.keys((a.concept_scores ?? {}) as Record<string, number>).forEach((k) => concepts.add(k)));
      const recent = (sessions.data ?? []).slice(0, 4);
      return {
        profile: profile.data,
        completed: sessions.count ?? recent.length,
        assessments: (attempts.data ?? []).length,
        avg,
        conceptsMastered: [...concepts].length,
        recent,
        attempts: attempts.data ?? [],
      };
    },
  });
  const concepts = ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs"];
  const levels = ["Basic", "Intermediate", "Advanced"];
  return (
    <PortalShell role="student" nav={studentNav} title={`Welcome back, ${data?.profile?.full_name?.split(" ")[0] ?? ""}!`} breadcrumbs={["Track your learning", "attempt assessments", "improve your mastery."]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Completed Lectures" value={`${data?.completed ?? 0}`} hint="This term" tone="violet" icon={<BookOpen className="size-5" />} />
        <StatCard label="Assessments Taken" value={`${data?.assessments ?? 0}`} tone="emerald" icon={<ClipboardCheck className="size-5" />} />
        <StatCard label="Average Score" value={`${data?.avg ?? 0}%`} tone="amber" icon={<Award className="size-5" />} />
        <StatCard label="Concepts Mastered" value={`${data?.conceptsMastered ?? 0}`} tone="sky" icon={<Brain className="size-5" />} />
        <StatCard label="Current Streak" value="7 Days" tone="pink" icon={<Flame className="size-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-card border p-5">
          <h2 className="font-display font-bold">Recent Lectures</h2>
          <div className="mt-4 space-y-3">
            {(data?.recent ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.subject} · {s.session_date}</div>
                </div>
                <span className="stat-pill-emerald text-[10px] px-2 py-1 rounded-md font-semibold">Completed</span>
              </div>
            ))}
            {(data?.recent ?? []).length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No completed lectures yet.</div>}
          </div>
        </div>

        <div className="rounded-2xl bg-card border p-5 lg:col-span-1">
          <h2 className="font-display font-bold">Concept Mastery Heatmap</h2>
          <div className="mt-4 grid grid-cols-4 gap-1 text-[10px]">
            <div></div>
            {levels.map((l) => <div key={l} className="text-center text-muted-foreground py-1">{l}</div>)}
            {concepts.map((c) => (
              <>
                <div key={c + "-l"} className="text-muted-foreground py-2 pr-1 truncate">{c}</div>
                {levels.map((l, li) => {
                  const val = Math.min(100, Math.max(10, (data?.avg ?? 40) + (li - 1) * 20 - concepts.indexOf(c) * 3));
                  const tone = val > 70 ? "bg-[oklch(0.75_0.14_155)]" : val > 40 ? "bg-[oklch(0.82_0.13_75)]" : "bg-[oklch(0.75_0.16_20)]";
                  return <div key={c + l} className={`h-9 rounded-md ${tone}`} title={`${val}%`}></div>;
                })}
              </>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
            <span>Low Mastery</span><span>High Mastery</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card border p-5">
          <h2 className="font-display font-bold">Overall Progress</h2>
          <div className="mt-6 flex items-center justify-center">
            <Donut value={data?.avg ?? 0} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg stat-pill-emerald py-2"><div className="font-bold text-base">{data?.avg ?? 0}%</div>Mastered</div>
            <div className="rounded-lg stat-pill-amber py-2"><div className="font-bold text-base">{Math.max(0, 100 - (data?.avg ?? 0) - 12)}%</div>In Progress</div>
            <div className="rounded-lg stat-pill-sky py-2"><div className="font-bold text-base">12%</div>Not Started</div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

function Donut({ value }: { value: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg viewBox="0 0 120 120" className="size-40">
      <circle cx="60" cy="60" r={r} fill="none" stroke="oklch(0.94 0.02 260)" strokeWidth="12" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="oklch(0.6 0.22 285)" strokeWidth="12" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
      <text x="60" y="60" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">{value}%</text>
      <text x="60" y="78" textAnchor="middle" fontSize="10" fill="oklch(0.5 0.02 260)">Overall</text>
    </svg>
  );
}