import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { createConversation } from "@/lib/app.functions";
import { AppShell } from "@/components/app-shell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: NewChatRedirect,
});

function NewChatRedirect() {
  const navigate = useNavigate();
  const create = useServerFn(createConversation);
  useEffect(() => {
    create({ data: {} }).then((row) => {
      navigate({ to: "/chat/$id", params: { id: row.id }, replace: true });
    });
  }, [create, navigate]);
  return (
    <AppShell>
      <div className="grid h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </AppShell>
  );
}
