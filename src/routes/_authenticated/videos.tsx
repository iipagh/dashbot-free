import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "AI Videos — DashBot AI" }] }),
  component: VideosPage,
});

function VideosPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">AI Video Generation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Turn ideas into short videos.</p>

        <div className="mt-8 glass rounded-3xl p-10 text-center animate-fade-up">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Film className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold">Video generation coming soon</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We're waiting on public access to Sora. Pro subscribers will get first access when it launches. In the meantime, generate stunning stills in the Images tab.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild className="gradient-primary text-primary-foreground shadow-glow">
              <Link to="/images"><Sparkles className="mr-2 h-4 w-4" /> Try Images</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
