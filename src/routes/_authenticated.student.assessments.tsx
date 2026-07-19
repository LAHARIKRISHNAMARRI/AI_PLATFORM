import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/assessments")({
  head: () => ({ meta: [{ title: "Assessments — TeachLearn AI" }] }),
  component: Assessments,
});

type ExamOption = { key: string; text: string };
type ExamQuestion = { id: string; prompt: string; options: ExamOption[]; correct_key: string; concept: string | null };

function Assessments() {
  const qc = useQueryClient();
  const [activeExam, setActiveExam] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  const { data: exams } = useQuery({
    queryKey: ["student-exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("id,title,subject,class_name,duration_minutes,exam_questions(count),exam_attempts(id,score,student_id)").eq("published", true);
      return data ?? [];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["exam-questions", activeExam],
    enabled: !!activeExam,
    queryFn: async () => {
      const { data } = await supabase.from("exam_questions").select("id,prompt,options,correct_key,concept").eq("exam_id", activeExam!).order("position");
      return (data ?? []) as unknown as ExamQuestion[];
    },
  });

  async function submit() {
    if (!activeExam || !questions) return;
    let correct = 0;
    const conceptScores: Record<string, { c: number; t: number }> = {};
    for (const q of questions) {
      const c = answers[q.id] === q.correct_key;
      if (c) correct++;
      const k = q.concept ?? "General";
      conceptScores[k] ??= { c: 0, t: 0 };
      conceptScores[k].t++;
      if (c) conceptScores[k].c++;
    }
    const total = questions.length;
    const score = total === 0 ? 0 : Math.round((correct / total) * 100);
    const conceptPct: Record<string, number> = {};
    for (const [k, v] of Object.entries(conceptScores)) conceptPct[k] = Math.round((v.c / v.t) * 100);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("exam_attempts").insert({
      exam_id: activeExam,
      student_id: userData.user!.id,
      score,
      correct_count: correct,
      total_count: total,
      answers,
      concept_scores: conceptPct,
    });
    if (error) return toast.error(error.message);
    setResult({ score, correct, total });
    qc.invalidateQueries({ queryKey: ["student-exams"] });
  }

  if (activeExam && questions) {
    return (
      <PortalShell role="student" nav={studentNav} title="Assessment" breadcrumbs={["Home", "Assessments", "Attempt"]}>
        {result ? (
          <div className="rounded-2xl bg-card border p-8 text-center max-w-xl mx-auto">
            <div className="text-5xl font-display font-bold text-primary">{result.score}%</div>
            <div className="mt-2 text-muted-foreground">You got {result.correct} of {result.total} correct.</div>
            <Button className="mt-6" onClick={() => { setActiveExam(null); setAnswers({}); setResult(null); }}>Back to assessments</Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl bg-card border p-5">
                <div className="font-medium">Q{i + 1}. {q.prompt}</div>
                <div className="mt-3 space-y-2">
                  {q.options.map((o) => (
                    <label key={o.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${answers[q.id] === o.key ? "border-primary bg-primary-soft" : "hover:bg-secondary"}`}>
                      <input type="radio" name={q.id} value={o.key} checked={answers[q.id] === o.key} onChange={() => setAnswers({ ...answers, [q.id]: o.key })} />
                      <span className="font-semibold">{o.key}.</span> {o.text}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setActiveExam(null); setAnswers({}); }}>Cancel</Button>
              <Button onClick={submit}>Submit</Button>
            </div>
          </div>
        )}
      </PortalShell>
    );
  }

  return (
    <PortalShell role="student" nav={studentNav} title="Assessments" breadcrumbs={["Home", "Assessments"]}>
      <div className="grid gap-4 md:grid-cols-2">
        {(exams ?? []).map((e) => {
          const attempted = (e.exam_attempts ?? []).length > 0;
          const bestScore = attempted ? Math.max(...(e.exam_attempts ?? []).map((a) => Number(a.score))) : null;
          return (
            <div key={e.id} className="rounded-2xl bg-card border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{e.subject}</div>
                  <div className="font-display font-bold mt-1">{e.title}</div>
                </div>
                <Badge variant="secondary">{e.exam_questions?.[0]?.count ?? 0} Qs</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{e.duration_minutes} min · {e.class_name}</div>
              <div className="mt-4 flex items-center justify-between">
                {attempted ? <span className="text-sm">Best: <b>{bestScore}%</b></span> : <span className="text-sm text-muted-foreground">Not attempted</span>}
                <Button size="sm" onClick={() => { setActiveExam(e.id); setResult(null); setAnswers({}); }}>{attempted ? "Retake" : "Start"}</Button>
              </div>
            </div>
          );
        })}
        {(exams ?? []).length === 0 && <div className="text-muted-foreground col-span-full">No assessments available.</div>}
      </div>
    </PortalShell>
  );
}