import { createFileRoute } from "@tanstack/react-router";
import { requireAuthFromRequest } from "@/lib/api-auth.server";

const sizeMap: Record<string, string> = {
  square: "1024x1024",
  portrait: "1024x1792",
  landscape: "1792x1024",
};

const styleSuffix: Record<string, string> = {
  realistic: ", photorealistic, high detail, DSLR photo",
  anime: ", anime style, cel shaded, vibrant colors",
  cartoon: ", cartoon illustration, clean lines, playful",
  "digital-art": ", digital art, concept art, trending on artstation",
  fantasy: ", epic fantasy art, dramatic lighting, painterly",
  painting: ", oil painting, expressive brushwork, classical",
};

export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = await requireAuthFromRequest(request);
        if (authResult instanceof Response) return authResult;

        const key = process.env.OPENAI_API_KEY;
        if (!key) return new Response("Missing OPENAI_API_KEY", { status: 500 });

        const { prompt, style, size } = (await request.json()) as {
          prompt: string; style: string; size: string;
        };
        if (!prompt) return new Response("prompt required", { status: 400 });

        const enhanced = prompt + (styleSuffix[style] ?? "");
        const resolvedSize = sizeMap[size] ?? "1024x1024";

        const upstream = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: enhanced,
            size: resolvedSize,
            n: 1,
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return new Response(text, { status: upstream.status });
        }
        const json = (await upstream.json()) as { data: { url?: string; b64_json?: string }[] };
        const item = json.data[0];
        const url = item?.url ?? (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
        return Response.json({ url });
      },
    },
  },
});
