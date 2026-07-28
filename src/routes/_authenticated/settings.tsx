import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Trash2, Download, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — DashBot AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  function toggleDark(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    try { localStorage.setItem("theme", v ? "dark" : "light"); } catch {}
  }

  async function exportChats() {
    const { data } = await supabase.from("messages").select("*").order("created_at");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "dashbot-chats.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function deleteAccount() {
    if (!confirm("This will permanently delete your account and all data. Continue?")) return;
    // Clean user data; auth user deletion requires admin — inform user.
    if (!user) return;
    await Promise.all([
      supabase.from("messages").delete().eq("user_id", user.id),
      supabase.from("conversations").delete().eq("user_id", user.id),
      supabase.from("generated_images").delete().eq("user_id", user.id),
      supabase.from("generated_videos").delete().eq("user_id", user.id),
    ]);
    await signOut();
    toast.success("Your data has been deleted. Contact support to fully remove your login.");
    navigate({ to: "/", replace: true });
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <section className="mt-6 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Appearance</Label>
                <p className="text-sm text-muted-foreground">Choose light or dark mode.</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={dark} onCheckedChange={toggleDark} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label className="text-base">Export chat history</Label>
                <p className="text-sm text-muted-foreground">Download all your messages as JSON.</p>
              </div>
              <Button variant="outline" onClick={exportChats}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label className="text-base">Sign out</Label>
                <p className="text-sm text-muted-foreground">Sign out of DashBot on this device.</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border-destructive/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label className="text-base text-destructive">Delete account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your data. This can't be undone.</p>
              </div>
              <Button variant="destructive" onClick={deleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
