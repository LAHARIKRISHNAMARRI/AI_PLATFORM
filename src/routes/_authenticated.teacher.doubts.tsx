import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/doubts")({
  head: () => ({ meta: [{ title: "Doubts — TeachLearn AI" }] }),
  component: Doubts,
});

function Doubts() {
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { data } = useQuery({
    queryKey: ["teacher-doubts"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const { data } = await supabase
        .from("doubts")
        .select("*")
        .or(`teacher_id.eq.${uid},status.eq.escalated`)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Student Doubts" breadcrumbs={["Home", "Doubts"]}>
      <div className="space-y-4">
        {(data ?? []).map((d) => (
          <div key={d.id} className="rounded-2xl bg-card border p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-muted-foreground">{d.subject}</div>
                <div className="font-medium mt-1">{d.question}</div>
              </div>
              <Badge variant="secondary" className="capitalize">{d.status.replace("_", " ")}</Badge>
            </div>
            {d.ai_answer && <div className="mt-3 text-sm text-muted-foreground p-3 rounded-lg bg-secondary"><b className="text-foreground">AI:</b> {d.ai_answer}</div>}
            {d.teacher_answer && <div className="mt-3 text-sm p-3 rounded-lg bg-primary-soft"><b>Your answer:</b> {d.teacher_answer}</div>}
            {!d.teacher_answer && (
              <div className="mt-3 space-y-2">
                <Textarea placeholder="Write your answer..." value={answers[d.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [d.id]: e.target.value })} />
                <Button onClick={async () => {
                  const { data: userData } = await supabase.auth.getUser();
                  const { error } = await supabase.from("doubts").update({
                    teacher_id: userData.user!.id,
                    teacher_answer: answers[d.id],
                    status: "teacher_answered",
                    answered_at: new Date().toISOString(),
                  }).eq("id", d.id);
                  if (error) return toast.error(error.message);
                  toast.success("Answer sent");
                  qc.invalidateQueries({ queryKey: ["teacher-doubts"] });
                }}>Send answer</Button>
              </div>
            )}
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="text-center text-muted-foreground py-12">No doubts yet.</div>}
      </div>
    </PortalShell>
  );
}