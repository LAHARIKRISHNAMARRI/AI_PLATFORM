import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, UserRound, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/ask-doubt")({
  head: () => ({ meta: [{ title: "Ask Doubt — TeachLearn AI" }] }),
  component: AskDoubt,
});

function AskDoubt() {
  const [subject, setSubject] = useState("General");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: () => ({ subject }) }),
  });
  const busy = status === "submitted" || status === "streaming";

  async function escalate() {
    const lastStudent = [...messages].reverse().find((m) => m.role === "user");
    const lastAI = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastStudent) return toast.error("Ask a question first");
    const questionText = lastStudent.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    const aiText = lastAI?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("doubts").insert({
      student_id: userData.user!.id,
      subject,
      question: questionText,
      ai_answer: aiText,
      status: "escalated",
    });
    if (error) return toast.error(error.message);
    toast.success("Sent to teacher");
  }

  return (
    <PortalShell role="student" nav={studentNav} title="Ask Doubt" breadcrumbs={["Home", "Ask Doubt"]}>
      <div className="grid gap-4 lg:grid-cols-4">
        <aside className="rounded-2xl bg-card border p-5 h-fit space-y-3">
          <div className="text-sm font-medium">Subject</div>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          <p className="text-xs text-muted-foreground">The AI tutor answers first. If it doesn't fully resolve your doubt, escalate to your teacher.</p>
          <Button variant="secondary" className="w-full" onClick={escalate} disabled={messages.length === 0}>Escalate to teacher</Button>
        </aside>
        <div className="lg:col-span-3 rounded-2xl bg-card border flex flex-col h-[calc(100vh-14rem)]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                <Sparkles className="size-6 mx-auto text-primary" />
                <div className="mt-2 text-sm">Ask anything about your subject — the AI tutor will explain it step by step.</div>
              </div>
            )}
            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                  {!isUser && <div className="size-8 rounded-lg stat-pill-violet flex items-center justify-center shrink-0"><Sparkles className="size-4" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2"><ReactMarkdown>{text}</ReactMarkdown></div>
                  </div>
                  {isUser && <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><UserRound className="size-4" /></div>}
                </div>
              );
            })}
          </div>
          <form
            className="border-t p-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || busy) return;
              sendMessage({ text: input.trim() });
              setInput("");
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={busy} />
            <Button type="submit" disabled={busy || !input.trim()}><Send className="size-4" /></Button>
          </form>
        </div>
      </div>
    </PortalShell>
  );
}