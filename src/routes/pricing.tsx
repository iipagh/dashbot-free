import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — DashBot AI" },
      { name: "description", content: "Simple, transparent pricing. Start free with 100 messages or unlock unlimited AI with Pro." },
      { property: "og:title", content: "Pricing — DashBot AI" },
      { property: "og:description", content: "Free forever. Pro Monthly and Pro Yearly with unlimited everything." },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["100 AI messages", "Standard AI chat", "Basic image generation", "Community support"],
    cta: "Get Started",
    href: "/auth",
    highlight: false,
  },
  {
    name: "Pro Monthly",
    price: "$19",
    period: "/month",
    features: ["Unlimited AI chat", "Unlimited image generation", "AI video generation", "Priority AI responses", "Chat history & search"],
    cta: "Upgrade to Pro",
    href: "/profile",
    highlight: false,
    badge: null as string | null,
  },
  {
    name: "Pro Yearly",
    price: "$149",
    period: "/year",
    features: ["Everything in Pro Monthly", "Save 35% vs monthly", "Early access to new features", "Premium support"],
    cta: "Go Yearly",
    href: "/profile",
    highlight: true,
    badge: "Most Popular",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto mt-10 w-[min(1200px,calc(100%-2rem))] rounded-3xl gradient-hero px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start free. Upgrade when you need more. Cancel anytime.
        </p>
      </section>

      <section className="mx-auto mt-10 grid w-[min(1200px,calc(100%-2rem))] gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl p-8 transition hover:-translate-y-1 ${
              p.highlight
                ? "gradient-primary text-primary-foreground shadow-glow"
                : "glass"
            }`}
          >
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow">
                <Sparkles className="mr-1 inline h-3 w-3" />{p.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className={p.highlight ? "opacity-80" : "text-muted-foreground"}>{p.period}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={`mt-0.5 h-4 w-4 flex-none ${p.highlight ? "" : "text-primary"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`mt-8 w-full ${p.highlight ? "bg-white text-primary hover:bg-white/90" : "gradient-primary text-primary-foreground"}`}
            >
              <Link to={p.href}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
}
