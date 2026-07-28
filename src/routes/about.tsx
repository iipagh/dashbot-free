import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DashBot AI" },
      { name: "description", content: "DashBot AI is on a mission to make advanced AI accessible, delightful, and private for everyone." },
      { property: "og:title", content: "About — DashBot AI" },
      { property: "og:description", content: "Our mission is to bring AI superpowers to every person." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto mt-10 w-[min(900px,calc(100%-2rem))] rounded-3xl gradient-hero px-6 py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">About DashBot AI</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          DashBot AI is a modern productivity assistant built for people who want the best of AI without juggling five different tools. We combine top-tier language models, image generation, and short-form video into a single, secure workspace with a delightful interface.
        </p>
      </section>
      <section className="mx-auto mt-6 grid w-[min(900px,calc(100%-2rem))] gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Our mission</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Make advanced AI accessible, private, and genuinely delightful for everyone.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Our approach</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast, clean, thoughtful design paired with best-in-class AI — no compromises.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
