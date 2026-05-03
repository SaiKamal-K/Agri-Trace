import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera, FileText, Tag, Boxes, Leaf, Plus, Download, ScanLine, Sparkles, ClipboardList, Trash2, ImageIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { store, useStore, type ComplianceRecord } from "@/lib/store";
import { generatePdf, downloadPdf } from "@/lib/pdf";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — AgriTrace" }] }),
});

type Tab = "overview" | "products" | "batches" | "labels" | "reports" | "records";

function Dashboard() {
  const user = useStore((s) => s.user);
  const state = useStore((s) => s);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    // Redirect after hydration if no user
    if (typeof window !== "undefined") {
      const t = setTimeout(() => {
        if (!store.get().user) navigate({ to: "/auth" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Dashboard</div>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">
              Hello, {user.fullName.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.farmName} · {user.location}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat icon={Tag} label="Products" value={state.products.length} />
          <Stat icon={Boxes} label="Batches" value={state.batches.length} />
          <Stat icon={FileText} label="Labels" value={state.labels.length} />
          <Stat icon={ClipboardList} label="Reports" value={state.reports.length} />
        </div>

        <nav className="mt-10 flex flex-wrap gap-1 rounded-full border border-border/60 bg-card p-1 shadow-soft">
          {([
            ["overview", "Overview"],
            ["products", "Products"],
            ["batches", "Batches"],
            ["labels", "Labels"],
            ["reports", "Reports"],
            ["records", "Compliance"],
          ] as [Tab, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === k ? "bg-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </nav>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-8">
          {tab === "overview" && <Overview />}
          {tab === "products" && <ProductsPanel />}
          {tab === "batches" && <BatchesPanel />}
          {tab === "labels" && <LabelsPanel />}
          {tab === "reports" && <ReportsPanel />}
          {tab === "records" && <RecordsPanel />}
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ icon: Icon, msg }: { icon: React.ComponentType<{ className?: string }>; msg: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border/80 bg-background/50 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview() {
  const state = useStore((s) => s);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <UploadCard />
      </div>
      <Section title="Recent activity">
        {state.labels.length + state.reports.length === 0 ? (
          <Empty icon={Sparkles} msg="Generate your first label to see activity here." />
        ) : (
          <ul className="space-y-3">
            {[...state.labels.map((l) => ({ ...l, kind: "Label" as const })), ...state.reports.map((r) => ({ ...r, kind: "Report" as const }))]
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .slice(0, 6)
              .map((it) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    {it.kind === "Label" ? <FileText className="h-4 w-4 text-primary" /> : <ClipboardList className="h-4 w-4 text-primary" />}
                    {it.kind} created
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function UploadCard() {
  const products = useStore((s) => s.products);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Produce");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setName((n) => n || guessName(file.name));
      }, 1400);
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    if (!name.trim() || !preview) return;
    store.addProduct({ name: name.trim(), category, image: preview });
    setPreview(null); setName(""); setCategory("Produce");
  };

  return (
    <Section title="Upload product photo" action={<span className="text-xs text-muted-foreground">{products.length} products</span>}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        className="relative grid overflow-hidden rounded-2xl border border-dashed border-border bg-background"
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="max-h-72 w-full object-cover" />
            {scanning && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 animate-[scan_1.4s_ease-in-out_infinite] bg-gradient-to-b from-primary/80 to-transparent" />
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-xs">
                  <ScanLine className="h-3.5 w-3.5 animate-pulse text-primary" /> Analyzing image…
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="grid place-items-center gap-3 px-6 py-14 text-center"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="font-medium">Drop a photo or click to upload</div>
              <div className="mt-1 text-xs text-muted-foreground">PNG, JPG up to ~5MB · we'll detect product details</div>
            </div>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>

      {preview && !scanning && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {["Produce", "Dairy", "Honey", "Grains", "Preserves", "Meat", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={onSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Save product
          </button>
        </div>
      )}

      <style>{`@keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(2800%)} }`}</style>
    </Section>
  );
}

function guessName(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40);
}

/* ---------------- Products ---------------- */

function ProductsPanel() {
  const products = useStore((s) => s.products);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2"><UploadCard /></div>
      <Section title="Your products">
        {products.length === 0 ? (
          <Empty icon={ImageIcon} msg="Upload your first product photo to begin." />
        ) : (
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-2">
                {p.image ? (
                  <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent"><Leaf className="h-5 w-5 text-primary" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ---------------- Batches ---------------- */

function BatchesPanel() {
  const products = useStore((s) => s.products);
  const batches = useStore((s) => s.batches);
  const [productId, setProductId] = useState("");
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState("");

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const onCreate = () => {
    if (!productId || !quantity.trim()) return;
    store.addBatch({ productId, harvestDate, quantity: quantity.trim() });
    setQuantity("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Create a batch">
        {products.length === 0 ? (
          <Empty icon={Boxes} msg="Add a product first to create batches." />
        ) : (
          <div className="space-y-3">
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty (e.g. 120 kg)" className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={onCreate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Create batch
            </button>
          </div>
        )}
      </Section>

      <Section title="Recent batches">
        {batches.length === 0 ? (
          <Empty icon={Boxes} msg="No batches yet." />
        ) : (
          <ul className="space-y-3">
            {batches.map((b) => (
              <li key={b.id} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{productMap[b.productId]?.name ?? "—"}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{b.code}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Harvested {b.harvestDate} · {b.quantity}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ---------------- Labels ---------------- */

function LabelsPanel() {
  const products = useStore((s) => s.products);
  const batches = useStore((s) => s.batches);
  const labels = useStore((s) => s.labels);
  const user = useStore((s) => s.user);
  const [productId, setProductId] = useState("");
  const [batchId, setBatchId] = useState("");

  const onGenerate = () => {
    if (!productId || !batchId || !user) return;
    const p = products.find((x) => x.id === productId)!;
    const b = batches.find((x) => x.id === batchId)!;
    const pdf = generatePdf(`${p.name} — Compliance Label`, [
      `Producer: ${user.farmName}`,
      `Origin: ${user.location}`,
      `Category: ${p.category}`,
      `Batch code: ${b.code}`,
      `Harvest date: ${b.harvestDate}`,
      `Net quantity: ${b.quantity}`,
      `Standard: AgriTrace organic-ready`,
      `Issued: ${new Date().toLocaleString()}`,
    ]);
    downloadPdf(`label-${b.code}.pdf`, pdf);
    store.addLabel({ productId, batchId });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Generate label">
        {batches.length === 0 ? (
          <Empty icon={Tag} msg="Create a batch first to generate labels." />
        ) : (
          <div className="space-y-3">
            <select value={productId} onChange={(e) => { setProductId(e.target.value); setBatchId(""); }} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select batch…</option>
              {batches.filter((b) => b.productId === productId).map((b) => <option key={b.id} value={b.id}>{b.code} — {b.harvestDate}</option>)}
            </select>
            <button onClick={onGenerate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4" /> Generate & download PDF
            </button>
          </div>
        )}
      </Section>

      <Section title="Generated labels">
        {labels.length === 0 ? (
          <Empty icon={FileText} msg="No labels yet." />
        ) : (
          <ul className="space-y-2">
            {labels.map((l) => {
              const b = batches.find((x) => x.id === l.batchId);
              const p = products.find((x) => x.id === l.productId);
              return (
                <li key={l.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                  <span className="truncate">{p?.name ?? "—"} · {b?.code ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ---------------- Reports ---------------- */

function ReportsPanel() {
  const batches = useStore((s) => s.batches);
  const products = useStore((s) => s.products);
  const reports = useStore((s) => s.reports);
  const records = useStore((s) => s.records);
  const user = useStore((s) => s.user);
  const [batchId, setBatchId] = useState("");

  const onGenerate = () => {
    if (!batchId || !user) return;
    const b = batches.find((x) => x.id === batchId)!;
    const p = products.find((x) => x.id === b.productId)!;
    const recordLines = records.length
      ? records.slice(0, 10).map((r) => `• ${r.date} — ${r.type}: ${r.name}`)
      : ["• No compliance inputs recorded for this period."];
    const pdf = generatePdf(`Traceability Report — ${b.code}`, [
      `Farm: ${user.farmName} (${user.location})`,
      `Product: ${p.name} (${p.category})`,
      `Harvest: ${b.harvestDate} · Quantity: ${b.quantity}`,
      `Batch issued: ${new Date(b.createdAt).toLocaleString()}`,
      "",
      "Inputs & activities:",
      ...recordLines,
      "",
      "This report tracks the journey from field to consumer.",
    ]);
    downloadPdf(`traceability-${b.code}.pdf`, pdf);
    store.addReport({ batchId });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Generate traceability report">
        {batches.length === 0 ? (
          <Empty icon={ClipboardList} msg="Create a batch first." />
        ) : (
          <div className="space-y-3">
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select batch…</option>
              {batches.map((b) => {
                const p = products.find((x) => x.id === b.productId);
                return <option key={b.id} value={b.id}>{b.code} — {p?.name}</option>;
              })}
            </select>
            <button onClick={onGenerate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4" /> Generate report
            </button>
          </div>
        )}
      </Section>
      <Section title="Recent reports">
        {reports.length === 0 ? (
          <Empty icon={ClipboardList} msg="No reports generated yet." />
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => {
              const b = batches.find((x) => x.id === r.batchId);
              return (
                <li key={r.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                  <span>Traceability · {b?.code ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ---------------- Compliance Records ---------------- */

function RecordsPanel() {
  const records = useStore((s) => s.records);
  const [type, setType] = useState<ComplianceRecord["type"]>("fertilizer");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const onAdd = () => {
    if (!name.trim()) return;
    store.addRecord({ type, name: name.trim(), date, notes: notes.trim() });
    setName(""); setNotes("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Log a compliance entry">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["fertilizer", "pesticide", "activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >{t}</button>
            ))}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Compost application" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes (optional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={onAdd} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add entry
          </button>
        </div>
      </Section>

      <Section title="Compliance ledger">
        {records.length === 0 ? (
          <Empty icon={ClipboardList} msg="Your inputs and activities will live here." />
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{r.type}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{r.date}{r.notes && ` · ${r.notes}`}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
