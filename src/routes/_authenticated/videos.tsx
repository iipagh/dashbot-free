import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { listVideos } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Film, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "AI Videos — DashBot AI" }] }),
  component: VideosPage,
});

const STYLES = [
  { v: "cinematic", l: "Cinematic" },
  { v: "realistic", l: "Realistic" },
  { v: "anime", l: "Anime" },
  { v: "cartoon", l: "Cartoon" },
  { v: "3d", l: "3D Render" },
  { v: "fantasy", l: "Fantasy" },
];

const DURATIONS = [
  { v: "5", l: "5 seconds" },
  { v: "10", l: "10 seconds" },
];

const QUALITIES = [
  { v: "low", l: "Draft (480p)" },
  { v: "medium", l: "Standard (720p)" },
  { v: "high", l: "High (1080p)" },
];

function VideosPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const qc = useQueryClient();
  const listFn = useServerFn(listVideos);
  const historyQ = useQuery({ queryKey: ["videos"], queryFn: () => listFn() });

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setCurrent(null);
    const toastId = toast.loading("Generating video… this can take 1–5 minutes");
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          style,
          duration: Number(duration),
          quality,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { url: string };
      setCurrent(json.url);
      qc.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video ready", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">AI Video Generation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe a scene. Choose the vibe. Get a short cinematic clip.
          </p>
        </header>

        <div className="glass rounded-2xl p-5">
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A drone shot over a misty forest at dawn, sun rays through pine trees…"
            className="mt-2 min-h-[100px]"
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUALITIES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-5 gradient-primary text-primary-foreground shadow-glow"
            disabled={loading || !prompt.trim()}
            onClick={generate}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </div>

        {(loading || current) && (
          <div className="mt-6 glass rounded-2xl p-4">
            {loading && !current && (
              <div className="grid aspect-video place-items-center rounded-xl bg-muted/40 text-center">
                <div>
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Rendering your clip… hang tight.</p>
                </div>
              </div>
            )}
            {current && (
              <div className="animate-fade-up">
                <video src={current} controls className="w-full rounded-xl" />
                <div className="mt-3 flex justify-end gap-2">
                  <Button asChild className="gradient-primary text-primary-foreground">
                    <a href={current} download target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Your videos</h2>
          {historyQ.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (historyQ.data ?? []).length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              <Film className="mx-auto mb-2 h-6 w-6" />
              No videos yet. Create your first!
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(historyQ.data ?? []).map((v) => (
                <div key={v.id} className="glass overflow-hidden rounded-xl">
                  {v.video_url ? (
                    <video src={v.video_url} controls className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="grid aspect-video place-items-center bg-muted/40 text-sm text-muted-foreground">
                      {v.status}
                    </div>
                  )}
                  <p className="line-clamp-2 p-3 text-xs text-muted-foreground">{v.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
