import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teacher/schedule")({
  head: () => ({ meta: [{ title: "Schedule Session — TeachLearn AI" }] }),
  component: SchedulePage,
});

const MATERIAL_TYPES = [
  { key: "lecture_slides", label: "Lecture Slides", color: "stat-pill-amber" },
  { key: "notes", label: "Notes", color: "stat-pill-sky" },
  { key: "ppt", label: "PPT / Presentation", color: "stat-pill-pink" },
  { key: "pdf", label: "PDF Document", color: "stat-pill-emerald" },
  { key: "reference", label: "Reference Material", color: "stat-pill-violet" },
  { key: "lesson_plan", label: "Lesson Plan", color: "stat-pill-amber" },
  { key: "outcomes", label: "Learning Outcomes", color: "stat-pill-emerald" },
] as const;

function SchedulePage() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    title: "",
    subject: "",
    session_date: "",
    start_time: "",
    end_time: "",
    class_name: "",
    lesson_topics: "",
    lesson_plan: "",
    learning_outcomes: "",
    teaching_method: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [types, setTypes] = useState<Set<string>>(new Set(["notes"]));
  const [saving, setSaving] = useState(false);

  const toggleType = (k: string) => {
    setTypes((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({ ...f, teacher_id: uid })
        .select("id")
        .single();
      if (error) throw error;

      if (file) {
        const path = `${uid}/${session!.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
        if (upErr) throw upErr;
        const primaryType = (Array.from(types)[0] ?? "notes") as "lecture_slides" | "notes" | "ppt" | "pdf" | "reference" | "lesson_plan" | "outcomes";
        await supabase.from("materials").insert({
          session_id: session!.id,
          uploaded_by: uid,
          title: file.name,
          material_type: primaryType,
          storage_path: path,
          file_size: file.size,
          mime_type: file.type,
          class_name: f.class_name,
          subject: f.subject,
        });
      }
      toast.success("Session scheduled");
      navigate({ to: "/teacher/sessions" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PortalShell role="teacher" nav={teacherNav} title="Schedule a New Session" breadcrumbs={["Home", "My Sessions", "Schedule New Session"]}>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        {/* Session details */}
        <div className="lg:col-span-2 rounded-2xl bg-card border p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <CalendarDays className="size-4 text-primary" />
            <h2 className="font-display font-bold">Session Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Session Title / Topic" required>
              <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Enter topic or session title" required />
            </Field>
            <Field label="Subject / Course" required>
              <Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Data Structures" required />
            </Field>
            <Field label="Date" required>
              <Input type="date" value={f.session_date} onChange={(e) => setF({ ...f, session_date: e.target.value })} required />
            </Field>
            <Field label="Start Time" required>
              <Input type="time" value={f.start_time} onChange={(e) => setF({ ...f, start_time: e.target.value })} required />
            </Field>
            <Field label="End Time" required>
              <Input type="time" value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} required />
            </Field>
            <Field label="Class / Batch" required>
              <Input value={f.class_name} onChange={(e) => setF({ ...f, class_name: e.target.value })} placeholder="CS - 3rd Year - A" required />
            </Field>
            <Field label="Lesson / Subtopics" span={2}>
              <Input value={f.lesson_topics} onChange={(e) => setF({ ...f, lesson_topics: e.target.value })} placeholder="Enter topics or subtopics to be taught" />
            </Field>
            <Field label="Lesson Plan (Brief)" span={2}>
              <Textarea rows={2} value={f.lesson_plan} onChange={(e) => setF({ ...f, lesson_plan: e.target.value })} placeholder="Enter lesson plan or description" />
            </Field>
            <Field label="Learning Outcomes">
              <Textarea rows={2} value={f.learning_outcomes} onChange={(e) => setF({ ...f, learning_outcomes: e.target.value })} placeholder="Enter expected learning outcomes" />
            </Field>
            <Field label="Teaching Method (Optional)">
              <Select value={f.teaching_method} onValueChange={(v) => setF({ ...f, teaching_method: v })}>
                <SelectTrigger><SelectValue placeholder="Lecture, Discussion, Case Study..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lecture">Lecture</SelectItem>
                  <SelectItem value="Discussion">Discussion</SelectItem>
                  <SelectItem value="Case Study">Case Study</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Flipped">Flipped Classroom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/teacher" })}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save & Schedule"}</Button>
          </div>
        </div>

        {/* Upload materials */}
        <div className="rounded-2xl bg-card border p-6 h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Upload className="size-4 text-primary" />
            <h2 className="font-display font-bold">Upload Materials</h2>
          </div>
          <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-accent/40 transition-colors">
            {file ? (
              <div className="flex items-center justify-between">
                <span className="truncate text-sm">{file.name}</span>
                <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="size-8 mx-auto text-primary" />
                <div className="mt-2 text-sm">Drag & drop files here<br /><span className="text-muted-foreground">or</span></div>
                <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md">Browse Files</div>
                <div className="text-[11px] text-muted-foreground mt-3">Supports: PDF, PPT, PPTX, DOCX, TXT (max 50MB)</div>
              </>
            )}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.ppt,.pptx,.docx,.doc,.txt" />
          </label>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">Material Type</div>
            <div className="space-y-2">
              {MATERIAL_TYPES.map((t) => (
                <label key={t.key} className="flex items-center gap-3 text-sm cursor-pointer">
                  <Checkbox checked={types.has(t.key)} onCheckedChange={() => toggleType(t.key)} />
                  <span className={`inline-flex items-center justify-center size-6 rounded-md ${t.color}`}>
                    <FileIcon />
                  </span>
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
    </PortalShell>
  );
}

function Field({ label, required, children, span = 1 }: { label: string; required?: boolean; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <Label className="text-xs font-medium mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}