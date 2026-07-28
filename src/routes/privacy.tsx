import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — DashBot AI" }, { name: "description", content: "How DashBot AI handles your data." }] }),
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <article className="mx-auto mt-10 w-[min(800px,calc(100%-2rem))] glass rounded-3xl p-8 prose-chat">
        <h1>Privacy Policy</h1>
        <p>Your conversations, images, and profile data are stored securely and are only accessible to you. We use industry-standard row-level security to enforce this at the database level.</p>
        <h2>Data we collect</h2>
        <p>Account information (email, name, avatar), your chat history and generated media, and subscription status.</p>
        <h2>Third parties</h2>
        <p>We use OpenAI to generate AI responses and images, Supabase for storage and authentication, and RevenueCat for billing.</p>
        <h2>Contact</h2>
        <p>Questions? Reach us at support@dashbot.ai.</p>
      </article>
      <Footer />
    </div>
  ),
});
