import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — DashBot AI" }, { name: "description", content: "Get in touch with the DashBot AI team." }] }),
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto mt-10 w-[min(700px,calc(100%-2rem))] glass rounded-3xl p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">Get in touch</h1>
        <p className="mt-2 text-muted-foreground">We usually respond within one business day.</p>
        <a className="mt-6 inline-block text-lg font-semibold text-primary hover:underline" href="mailto:support@dashbot.ai">
          support@dashbot.ai
        </a>
      </section>
      <Footer />
    </div>
  ),
});
