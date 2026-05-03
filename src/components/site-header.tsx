import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Leaf, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "./theme-provider";
import { store, useStore } from "@/lib/store";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const onDashboard = path.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">AgriTrace</span>
        </Link>

        {!onDashboard && (
          <nav className="hidden items-center gap-8 md:flex">
            <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="/#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <>
              {!onDashboard && (
                <Link to="/dashboard" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => { store.logout(); navigate({ to: "/" }); }}
                className="hidden rounded-full border border-border/60 px-3 py-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex">
                Sign in
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant hover:opacity-90">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
