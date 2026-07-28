import { createFileRoute } from "@tanstack/react-router";
import { requireAuthFromRequest } from "@/lib/api-auth.server";

const GATEWAY = "https://connector-gateway.lovable.dev/replicate/v1";

const styleSuffix: Record<string, string> = {
  cinematic: ", cinematic, dramatic lighting, film grain",
  realistic: ", photorealistic, natural lighting, high detail",
  anime: ", anime style, cel shaded, vibrant colors",
  cartoon: ", cartoon animation, colorful, playful",
  "3d": ", 3d render, octane, physically based rendering",
  fantasy: ", epic fantasy, magical atmosphere, painterly",
};

const qualityToResolution: Record<string, string> = {
  low: "480p",
  medium: "720p",
  high: "1080p",
};

export const Route = createFileRoute("/api/video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireAuthFromRequest(request);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const lovableKey = process.env.LOVABLE_API_KEY;
        const replicateKey = process.env.REPLICATE_API_KEY;
        if (!lovableKey || !replicateKey) {
          return new Response("Video service not configured", { status: 500 });
        }

        const { prompt, style, duration, quality } = (await request.json()) as {
          prompt: string; style?: string; duration?: number; quality?: string;
        };
        if (!prompt) return new Response("prompt required", { status: 400 });

        const enhanced = prompt + (style ? styleSuffix[style] ?? "" : "");
        const dur = duration === 10 ? 10 : 5;
        const resolution = qualityToResolution[quality ?? "medium"] ?? "720p";

        const headers = {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": replicateKey,
          "Content-Type": "application/json",
        };

        // Create prediction with bytedance/seedance-1-lite (text-to-video)
        const createRes = await fetch(
          `${GATEWAY}/models/bytedance/seedance-1-lite/predictions`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              input: {
                prompt: enhanced,
                duration: dur,
                resolution,
                aspect_ratio: "16:9",
              },
            }),
          },
        );

        if (createRes.status === 402) {
          return new Response(
            "Video generation account has no credit. Please enable billing at replicate.com/account/billing.",
            { status: 402 },
          );
        }
        if (!createRes.ok) {
          const text = await createRes.text();
          return new Response(`Failed to start video: ${text}`, { status: createRes.status });
        }

        const pred = (await createRes.json()) as { id: string };
        const predId = pred.id;

        // Poll up to ~8 minutes
        let videoUrl: string | null = null;
        let lastError: string | null = null;
        for (let i = 0; i < 100; i++) {
          await new Promise((r) => setTimeout(r, i < 5 ? 3000 : 6000));
          const pollRes = await fetch(`${GATEWAY}/predictions/${predId}`, {
            headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": replicateKey },
          });
          if (!pollRes.ok) continue;
          const status = (await pollRes.json()) as {
            status: string; output?: string | string[]; error?: string;
          };
          if (status.status === "succeeded") {
            videoUrl = Array.isArray(status.output) ? status.output[0] : status.output ?? null;
            break;
          }
          if (status.status === "failed" || status.status === "canceled") {
            lastError = status.error ?? status.status;
            break;
          }
        }

        if (!videoUrl) {
          return new Response(lastError ?? "Video generation timed out", { status: 504 });
        }

        // Download and persist to Supabase storage (Replicate URLs expire ~1h)
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const fileRes = await fetch(videoUrl);
        if (!fileRes.ok) {
          return new Response("Failed to download generated video", { status: 502 });
        }
        const bytes = new Uint8Array(await fileRes.arrayBuffer());
        const path = `${userId}/${crypto.randomUUID()}.mp4`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("videos")
          .upload(path, bytes, { contentType: "video/mp4", upsert: false });
        if (upErr) return new Response(`Upload failed: ${upErr.message}`, { status: 500 });

        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("videos")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (sErr || !signed) return new Response("Failed to sign url", { status: 500 });

        const { data: row, error: dbErr } = await supabaseAdmin
          .from("generated_videos")
          .insert({
            user_id: userId,
            prompt,
            style: style ?? null,
            duration: dur,
            quality: quality ?? "medium",
            video_url: signed.signedUrl,
            status: "completed",
          })
          .select()
          .single();
        if (dbErr) return new Response(`DB error: ${dbErr.message}`, { status: 500 });

        return Response.json({ url: signed.signedUrl, id: row.id });
      },
    },
  },
});
