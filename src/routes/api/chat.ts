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

        const body = (useLovable: boolean) =>
          JSON.stringify({
            model: useLovable ? "google/gemini-3.6-flash" : customModel,
            stream: true,
            messages: [system, ...messages].map(toGatewayMessage),
          });

        const callUpstream = (useLovable: boolean) =>
          fetch(
            useLovable
              ? "https://ai.gateway.lovable.dev/v1/chat/completions"
              : `${baseUrl}/chat/completions`,
            {
              method: "POST",
              headers: useLovable
                ? { "Lovable-API-Key": lovableKey!, "Content-Type": "application/json" }
                : { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
              body: body(useLovable),
            },
          );

        // Prefer the user's own key; fall back to Lovable AI if it is
        // out of credits / unauthorized / rate limited.
        let upstream = await callUpstream(!openaiKey);
        if (openaiKey && lovableKey && [401, 402, 403, 429].includes(upstream.status)) {
          upstream = await callUpstream(true);
        }

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
