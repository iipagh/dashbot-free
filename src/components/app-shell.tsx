import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageSquare, Image as ImageIcon, Film, User, Settings, LogOut, Sparkles, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const nav = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/images", label: "Images", icon: ImageIcon },
  { to: "/videos", label: "Videos", icon: Film },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          DashBot AI
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? "gradient-primary text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-2">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link to="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b bg-sidebar/90 px-4 py-2 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg gradient-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          DashBot
        </Link>
        <div className="flex gap-1">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.to} to={n.to} className="rounded-lg p-2 hover:bg-accent">
              <n.icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
