import { createFileRoute } from "@tanstack/react-router";
import { requireAuthFromRequest } from "@/lib/api-auth.server";

type Attachment = { name: string; mime: string; dataUrl: string };
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

function toGatewayMessage(m: ChatMessage) {
  if (!m.attachments?.length) return { role: m.role, content: m.content };
  const parts: unknown[] = [];
  if (m.content) parts.push({ type: "text", text: m.content });
  for (const a of m.attachments) {
    if (a.mime.startsWith("image/")) {
      parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
    } else {
      parts.push({
        type: "file",
        file: { filename: a.name, file_data: a.dataUrl },
      });
    }
  }
  return { role: m.role, content: parts };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = await requireAuthFromRequest(request);
        if (authResult instanceof Response) return authResult;

        const openaiKey = process.env.OPENAI_API_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;
        const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
        const customModel = process.env.AI_MODEL || "gpt-4o-mini";
        if (!openaiKey && !lovableKey)
          return new Response("Missing OPENAI_API_KEY", { status: 500 });


        const { messages } = (await request.json()) as { messages: ChatMessage[] };
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const system: ChatMessage = {
          role: "system",
          content:
            "You are DashBot, a helpful, friendly, and creative AI assistant. Respond in clean markdown. Use fenced code blocks with language tags, tables when useful, and be concise but thorough.",
        };

        // Prefer the user's own OpenAI key (no Lovable credits used).
        const useOpenAI = Boolean(openaiKey);
        const upstream = await fetch(
          useOpenAI
            ? `${baseUrl}/chat/completions`
            : "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: useOpenAI
              ? { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" }
              : { "Lovable-API-Key": lovableKey!, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: useOpenAI ? customModel : "google/gemini-3.6-flash",

              stream: true,
              messages: [system, ...messages].map(toGatewayMessage),
            }),
          },
        );


        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text();
          return new Response(text, { status: upstream.status });
        }

        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (payload === "[DONE]") { controller.close(); return; }
                  try {
                    const json = JSON.parse(payload);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(new TextEncoder().encode(delta));
                  } catch { /* ignore */ }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
