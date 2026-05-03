import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { store } from "@/lib/store";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "login" | "signup" } => ({
    mode: s.mode === "signup" ? "signup" : s.mode === "login" ? "login" : undefined,
  }),
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — AgriTrace" }] }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(100),
  farmName: z.string().trim().min(1, "Farm name required").max(120),
  location: z.string().trim().min(1, "Location required").max(120),
});
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      if (mode === "signup") {
        const v = signupSchema.parse(data);
        store.signup({ fullName: v.fullName, email: v.email, farmName: v.farmName, location: v.location });
      } else {
        const v = loginSchema.parse(data);
        store.login(v.email);
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-primary md:block">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <span className="font-display text-xl font-semibold">AgriTrace</span>
          </Link>
          <div>
            <p className="font-display text-3xl leading-tight">"It used to take me a week to prep a labelling audit. Now it's an afternoon."</p>
            <div className="mt-4 text-sm opacity-80">— Marta R., organic strawberry grower</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold">{mode === "signup" ? "Create your farm account" : "Welcome back"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup" ? "Free forever for small farms." : "Sign in to manage your batches."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${mode === m ? "bg-background shadow-soft" : "text-muted-foreground"}`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field name="fullName" label="Full name" placeholder="Marta Rodriguez" />
            )}
            <Field name="email" label="Email" type="email" placeholder="you@farm.com" />
            <Field name="password" label="Password" type="password" placeholder="••••••••" />
            {mode === "signup" && (
              <>
                <Field name="farmName" label="Farm name" placeholder="Sunfield Organics" />
                <Field name="location" label="Location" placeholder="Asturias, Spain" />
              </>
            )}

            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-90">
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
      />
    </label>
  );
}
