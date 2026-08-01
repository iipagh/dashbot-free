import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef } from "react";
import { createConversation, listConversations } from "@/lib/app.functions";
import { AppShell } from "@/components/app-shell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: NewChatRedirect,
});

function NewChatRedirect() {
  const navigate = useNavigate();
  const create = useServerFn(createConversation);
  const list = useServerFn(listConversations);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      // Reuse the most recent conversation instead of always creating a new one.
      const rows = await list().catch(() => []);
      const existing = Array.isArray(rows) ? rows[0] : undefined;
      const target = existing ?? (await create({ data: {} }));
      navigate({ to: "/chat/$id", params: { id: target.id }, replace: true });
    })();
  }, [create, list, navigate]);

  return (
    <AppShell>
      <div className="grid h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </AppShell>
  );
}

