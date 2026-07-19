import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuestions, saveGeneratedExam } from "@/lib/questions.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/question-generation")({
  head: () => ({ meta: [{ title: "AI Question Generation — TeachLearn AI" }] }),
  component: Page,
});

type Q = { prompt: string; options: { key: string; text: string }[]; correct_key: string; concept: string; explanation: string };

function Page() {
  const gen = useServerFn(generateQuestions);
  const save = useServerFn(saveGeneratedExam);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(6);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <PortalShell role="teacher" nav={teacherNav} title="AI Question Generation" breadcrumbs={["Home", "Question Generation"]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-card border p-6 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-display font-bold">Generate</h2>
          </div>
          <div className="space-y-4">
            <div><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Arrays and linked lists" /></div>
            <div><Label>Number of questions</Label><Input type="number" min={1} max={15} value={count} onChange={(e) => setCount(+e.target.value)} /></div>
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!topic || loading} onClick={async () => {
              setLoading(true);
              try {
                const { questions: qs } = await gen({ data: { topic, count, difficulty } });
                setQuestions(qs);
                toast.success(`Generated ${qs.length} questions`);
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "Generation failed");
              } finally { setLoading(false); }
            }}>{loading ? "Generating..." : "Generate Questions"}</Button>
          </div>
          {questions.length > 0 && (
            <div className="mt-6 pt-6 border-t space-y-3">
              <div><Label>Exam title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Midterm - Arrays" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Data Structures" /></div>
              <div><Label>Class / Batch</Label><Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="CS - 3rd Year - A" /></div>
              <Button className="w-full" disabled={saving || !title || !subject || !className} onClick={async () => {
                setSaving(true);
                try {
                  await save({ data: { title, subject, class_name: className, duration_minutes: 30, publish: true, questions } });
                  toast.success("Exam published to students");
                  setQuestions([]); setTitle("");
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Save failed");
                } finally { setSaving(false); }
              }}>{saving ? "Publishing..." : "Publish as Exam"}</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {questions.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground">
              Generate questions to preview them here.
            </div>
          )}
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl bg-card border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="font-medium">Q{i + 1}. {q.prompt}</div>
                <span className="stat-pill-violet text-[10px] px-2 py-1 rounded-md uppercase font-semibold shrink-0">{q.concept}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => (
                  <div key={o.key} className={`px-3 py-2 rounded-lg border text-sm ${o.key === q.correct_key ? "border-primary bg-primary-soft text-foreground" : ""}`}>
                    <span className="font-semibold mr-2">{o.key}.</span>{o.text}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{q.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}