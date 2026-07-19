import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are TeachLearn AI, a friendly and precise tutor for students. Explain concepts clearly with short examples. Use markdown, keep answers concise, and break complex ideas into numbered steps. If the student's question is off-topic, redirect them gently back to their studies.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, subject } = (await request.json()) as { messages?: UIMessage[]; subject?: string };
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const system = subject ? `${SYSTEM_PROMPT}\n\nCurrent subject: ${subject}` : SYSTEM_PROMPT;
        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});