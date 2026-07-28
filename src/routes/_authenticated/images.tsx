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
import { listImages, saveImage } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/images")({
  head: () => ({ meta: [{ title: "Images — DashBot AI" }] }),
  component: ImagesPage,
});

const STYLES = [
  { v: "realistic", l: "Realistic" },
  { v: "anime", l: "Anime" },
  { v: "cartoon", l: "Cartoon" },
  { v: "digital-art", l: "Digital Art" },
  { v: "fantasy", l: "Fantasy" },
  { v: "painting", l: "Painting" },
];

const SIZES = [
  { v: "square", l: "Square 1:1" },
  { v: "portrait", l: "Portrait 9:16" },
  { v: "landscape", l: "Landscape 16:9" },
];

function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("square");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const qc = useQueryClient();
  const listFn = useServerFn(listImages);
  const saveFn = useServerFn(saveImage);
  const historyQ = useQuery({ queryKey: ["images"], queryFn: () => listFn() });

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setCurrent(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt, style, size }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { url: string };
      setCurrent(json.url);
      await saveFn({ data: { prompt, style, size, image_url: json.url } });
      qc.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">AI Image Generation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Describe anything. Pick a style. Get an image.</p>
        </header>

        <div className="glass rounded-2xl p-5">
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain lake at sunset with a wooden dock…"
            className="mt-2 min-h-[100px]"
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              <Label>Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
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
              <div className="grid aspect-square place-items-center rounded-xl bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {current && (
              <div className="animate-fade-up">
                <img src={current} alt={prompt} className="w-full rounded-xl" />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" onClick={generate}>
                    <Sparkles className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
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
          <h2 className="mb-3 text-xl font-semibold">Your creations</h2>
          {historyQ.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (historyQ.data ?? []).length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              <ImageIcon className="mx-auto mb-2 h-6 w-6" />
              No images yet. Create your first!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(historyQ.data ?? []).map((img) => (
                <a
                  key={img.id}
                  href={img.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-xl glass"
                >
                  <img src={img.image_url} alt={img.prompt} className="aspect-square w-full object-cover transition group-hover:scale-105" />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
