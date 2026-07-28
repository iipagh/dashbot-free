import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MessageSquare, Image as ImageIcon, Film, Zap, Shield, Sparkles, Code2, Layers } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — DashBot AI" },
      { name: "description", content: "Explore DashBot AI features: streaming chat, image generation, video creation, and more." },
      { property: "og:title", content: "Features — DashBot AI" },
      { property: "og:description", content: "Streaming chat, image generation, AI video, and productivity superpowers." },
    ],
  }),
  component: Page,
});

const items = [
  { icon: MessageSquare, title: "Streaming AI Chat", desc: "Responses appear as they're generated with markdown, code blocks, tables, and math." },
  { icon: ImageIcon, title: "Image Generation", desc: "Realistic, anime, cartoon, digital art, fantasy, painting. Square, portrait or landscape." },
  { icon: Film, title: "AI Video", desc: "Choose duration, style, and quality. Preview, download, and organize creations." },
  { icon: Layers, title: "Threaded History", desc: "Every conversation is saved, searchable, and organized in a familiar sidebar." },
  { icon: Code2, title: "Developer Friendly", desc: "First-class code blocks with syntax highlighting and one-click copy." },
  { icon: Zap, title: "Priority Speed", desc: "Pro users get faster responses and no usage limits." },
  { icon: Shield, title: "Private by Default", desc: "Row-level security and encrypted storage keep everything scoped to your account." },
  { icon: Sparkles, title: "Beautiful UI", desc: "Glassmorphism, soft shadows, smooth animations. A pleasure to use daily." },
];

function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto mt-10 w-[min(1100px,calc(100%-2rem))] rounded-3xl gradient-hero px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Everything DashBot can do</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          A single assistant that chats, draws, and creates — beautifully.
        </p>
      </section>
      <section className="mx-auto mt-10 grid w-[min(1100px,calc(100%-2rem))] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
}
