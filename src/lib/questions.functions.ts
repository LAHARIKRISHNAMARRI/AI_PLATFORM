import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const Input = z.object({
  topic: z.string().min(2),
  count: z.number().int().min(1).max(15).default(6),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

const QuestionSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string(),
      options: z.array(z.object({ key: z.string(), text: z.string() })),
      correct_key: z.string(),
      concept: z.string(),
      explanation: z.string(),
    }),
  ),
});

export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");
    const prompt = `Generate ${data.count} multiple-choice questions on: "${data.topic}". Difficulty: ${data.difficulty}. Each question must have exactly 4 options with keys A, B, C, D. correct_key must be one of A/B/C/D. Include a short concept tag (e.g. "Arrays", "Time Complexity") and one-sentence explanation.`;
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: QuestionSchema }),
        prompt,
      });
      return output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) {
        throw new Error("AI could not produce valid questions. Try again with a clearer topic.");
      }
      throw e;
    }
  });

const SaveInput = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  class_name: z.string().min(1),
  duration_minutes: z.number().int().min(5).max(300).default(30),
  publish: z.boolean().default(true),
  questions: QuestionSchema.shape.questions,
});

export const saveGeneratedExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => SaveInput.parse(raw))
  .handler(async ({ context, data }) => {
    const { data: exam, error } = await context.supabase
      .from("exams")
      .insert({
        teacher_id: context.userId,
        title: data.title,
        subject: data.subject,
        class_name: data.class_name,
        duration_minutes: data.duration_minutes,
        published: data.publish,
      })
      .select("id")
      .single();
    if (error || !exam) throw new Error(error?.message ?? "Failed to create exam");
    const rows = data.questions.map((q, i) => ({
      exam_id: exam.id,
      position: i,
      prompt: q.prompt,
      options: q.options,
      correct_key: q.correct_key,
      concept: q.concept,
      explanation: q.explanation,
    }));
    const { error: qErr } = await context.supabase.from("exam_questions").insert(rows);
    if (qErr) throw new Error(qErr.message);
    return { ok: true, exam_id: exam.id };
  });