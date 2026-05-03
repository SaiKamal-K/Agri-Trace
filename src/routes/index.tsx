import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Camera, FileCheck2, Leaf, ScanLine, Sparkles, Tag, Workflow, ShieldCheck, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-farm.png";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "AgriTrace — Farm compliance from a single photo" },
      { name: "description", content: "Generate compliance labels, traceability reports and organic docs from a photo. Built for small farms and farm-to-table sellers." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-soft" />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              New · Photo-to-label in under 60 seconds
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Automate farm <span className="italic text-primary">compliance</span> in minutes.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              Generate labels, traceability reports, and compliance docs from a simple photo — built for small-scale and organic farms.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition hover:opacity-90">
                Start free <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-6 py-3 text-sm text-foreground backdrop-blur hover:bg-card">
                See how it works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Organic-ready</span>
              <span className="inline-flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-primary" /> Built for farmers</span>
              <span className="inline-flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5 text-primary" /> Audit-friendly</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 shadow-elegant">
              <img src={heroImg} alt="Drone scanning organic crop fields" width={1376} height={768} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-soft backdrop-blur md:block">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live scan</div>
              <div className="mt-0.5 text-sm font-medium">Batch <span className="text-primary">#A-2041</span> verified</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16"
        >
          <div className="rounded-3xl border border-border/60 bg-card/80 p-2 shadow-soft backdrop-blur">
            <div className="rounded-2xl bg-gradient-soft p-8">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { k: "12,400+", v: "labels generated" },
                  { k: "98%", v: "audit pass rate" },
                  { k: "<60s", v: "from photo to PDF" },
                ].map((s) => (
                  <div key={s.v} className="text-center">
                    <div className="font-display text-3xl font-semibold text-primary">{s.k}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: Camera, title: "Photo-based labels", desc: "Snap a product, get a fully compliant downloadable PDF label in seconds." },
  { icon: Workflow, title: "Traceability reports", desc: "Farm-to-consumer history wired to every batch you produce." },
  { icon: ShieldCheck, title: "Compliance records", desc: "Track fertilizers, pesticides, and farm activities in one tidy ledger." },
  { icon: Tag, title: "Batch management", desc: "Create and track product batches with harvest dates and quantities." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Features</div>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Everything compliance, none of the paperwork.</h2>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="group rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:shadow-elegant"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Camera, title: "Upload a photo", desc: "Snap your product or harvest. We do the rest." },
    { icon: ScanLine, title: "We process it", desc: "AgriTrace extracts product details and links them to your batch." },
    { icon: FileCheck2, title: "Download docs", desc: "Get compliant labels, traceability and organic-ready PDFs." },
  ];
  return (
    <section id="how" className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">How it works</div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Three steps. That's it.</h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
              <div className="font-display text-6xl font-semibold text-primary/15">0{i + 1}</div>
              <div className="-mt-8 grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const tiers = [
  { name: "Starter", price: "Free", desc: "For getting started.", features: ["10 labels / month", "Basic traceability", "1 farm"], cta: "Start free" },
  { name: "Pro", price: "$19", suffix: "/mo", desc: "For active farms.", features: ["Unlimited labels", "Full traceability reports", "Compliance ledger", "Email support"], cta: "Go Pro", featured: true },
  { name: "Premium", price: "$49", suffix: "/mo", desc: "Co-ops & multi-farm.", features: ["Everything in Pro", "Multi-farm management", "Organic cert export", "Priority support"], cta: "Contact us" },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</div>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Simple plans that grow with your farm.</h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-3xl border p-7 ${
              t.featured
                ? "border-primary/30 bg-gradient-primary text-primary-foreground shadow-elegant"
                : "border-border/60 bg-card shadow-soft"
            }`}
          >
            {t.featured && (
              <div className="absolute -top-3 right-6 rounded-full bg-earth px-3 py-1 text-xs font-medium text-earth-foreground">
                Most loved
              </div>
            )}
            <div className="text-sm uppercase tracking-wider opacity-80">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold">{t.price}</span>
              {t.suffix && <span className="opacity-70">{t.suffix}</span>}
            </div>
            <p className={`mt-2 text-sm ${t.featured ? "opacity-90" : "text-muted-foreground"}`}>{t.desc}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${t.featured ? "" : "text-primary"}`} /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
                t.featured
                  ? "bg-background text-foreground hover:opacity-90"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
