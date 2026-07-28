import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — DashBot AI" }, { name: "description", content: "The rules for using DashBot AI." }] }),
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <article className="mx-auto mt-10 w-[min(800px,calc(100%-2rem))] glass rounded-3xl p-8 prose-chat">
        <h1>Terms of Service</h1>
        <p>By using DashBot AI you agree to our fair-use guidelines: no illegal content, no attempts to abuse the service, and respect for other users.</p>
        <h2>Subscriptions</h2>
        <p>Pro plans are billed monthly or yearly. You can cancel at any time from your profile.</p>
        <h2>Liability</h2>
        <p>DashBot is provided "as is." AI-generated content should be reviewed before publication.</p>
      </article>
      <Footer />
    </div>
  ),
});
