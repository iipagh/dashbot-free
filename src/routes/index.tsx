import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MessageSquare, Image as ImageIcon, Film, Zap, Shield, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DashBot AI — Your Personal AI Assistant" },
      { name: "description", content: "Chat with AI, generate stunning images, create AI videos, and boost productivity. Start with 100 free messages." },
      { property: "og:title", content: "DashBot AI — Your Personal AI Assistant" },
      { property: "og:description", content: "One intelligent assistant for chat, images, and video." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <PricingPreview />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto mt-10 w-[min(1200px,calc(100%-2rem))] overflow-hidden rounded-3xl gradient-hero px-6 py-20 sm:py-28">
      <div className="floating-blob animate-float left-[-80px] top-[-40px] h-64 w-64 bg-primary-glow/60" />
      <div className="floating-blob animate-float right-[-60px] top-40 h-72 w-72 bg-primary/40" style={{ animationDelay: "1.5s" }} />
      <div className="floating-blob animate-float bottom-[-80px] left-1/3 h-56 w-56 bg-accent/70" style={{ animationDelay: "3s" }} />

      <div className="relative mx-auto max-w-3xl text-center animate-fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Powered by GPT + DALL·E</span>
        </div>
        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-6xl">
          <span className="text-gradient">DashBot</span>,<br />
          Your Personal AI Assistant
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
          Chat with AI, generate stunning images, create AI videos, and boost productivity
          with one intelligent assistant.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-glow">
            <Link to="/chat">
              Start Chatting <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass border-white/60">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">100 free messages · No credit card required</p>
      </div>
    </section>
  );
}

const features = [
  { icon: MessageSquare, title: "AI Chat", desc: "Streaming, context-aware conversations with markdown, code blocks, and history." },
  { icon: ImageIcon, title: "Image Generation", desc: "Realistic, anime, cartoon and more — any style, any size, in seconds." },
  { icon: Film, title: "AI Video", desc: "Turn ideas into short videos with adjustable duration, style, and quality." },
  { icon: Zap, title: "Lightning Fast", desc: "Priority responses for Pro users. No queue, no waiting." },
  { icon: Shield, title: "Secure & Private", desc: "Row-level security keeps your chats, images, and profile private to you." },
  { icon: Sparkles, title: "One Subscription", desc: "Unlimited everything with Pro. Cancel anytime." },
];

function Features() {
  return (
    <section id="features" className="mx-auto mt-24 w-[min(1200px,calc(100%-2rem))]">
      <div className="text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Everything you need, in one place</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          DashBot brings the best of AI together — chat, images, and video — in a single, beautifully designed workspace.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glow animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="mx-auto mt-24 w-[min(1200px,calc(100%-2rem))]">
      <div className="glass overflow-hidden rounded-3xl px-6 py-14 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to unlock everything?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start free with 100 messages. Upgrade any time for unlimited chat, images, and videos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-glow">
            <Link to="/pricing">See Pricing</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass">
            <Link to="/chat">Try DashBot Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
