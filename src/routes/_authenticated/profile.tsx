import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMyProfile, updateProfile, setPlan } from "@/lib/app.functions";
import { Loader2, Crown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — DashBot AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const getFn = useServerFn(getMyProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile"], queryFn: () => getFn() });

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data?.profile) {
      setName(q.data.profile.display_name ?? "");
      setAvatar(q.data.profile.avatar_url ?? "");
    }
  }, [q.data]);

  async function save() {
    setSaving(true);
    try {
      await updateFn({ data: { display_name: name, avatar_url: avatar } });
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const isPro = q.data?.subscription?.plan === "pro" && q.data.subscription.status === "active";
  const remaining = q.data?.profile?.remaining_free_messages ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        {q.isLoading && <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />}

        {q.data && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{(name || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{q.data.profile?.display_name}</h2>
                  <p className="text-sm text-muted-foreground">{q.data.profile?.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" className="mt-2" />
                </div>
                <Button onClick={save} disabled={saving} className="gradient-primary text-primary-foreground">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`rounded-2xl p-6 ${isPro ? "gradient-primary text-primary-foreground shadow-glow" : "glass"}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Current plan
                </div>
                <div className="mt-1 text-2xl font-bold">{isPro ? "Pro" : "Free"}</div>
                {isPro && q.data.subscription?.current_period_end && (
                  <p className={`mt-1 text-xs ${isPro ? "opacity-90" : "text-muted-foreground"}`}>
                    Renews {new Date(q.data.subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" /> Free messages left
                </div>
                <div className="mt-1 text-2xl font-bold">{isPro ? "∞" : remaining}</div>
                <p className="mt-1 text-xs text-muted-foreground">Total sent: {q.data.messageCount}</p>
              </div>

              <div className="glass rounded-2xl p-4 text-sm">
                <Link to="/pricing" className="text-primary hover:underline">Compare all plans →</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
