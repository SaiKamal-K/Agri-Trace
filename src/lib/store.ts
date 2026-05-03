import { useEffect, useState, useSyncExternalStore } from "react";

export type User = { fullName: string; email: string; farmName: string; location: string };
export type Product = { id: string; name: string; category: string; createdAt: string; image?: string };
export type Batch = { id: string; productId: string; code: string; harvestDate: string; quantity: string; createdAt: string };
export type LabelDoc = { id: string; productId: string; batchId: string; createdAt: string };
export type Report = { id: string; batchId: string; createdAt: string };
export type ComplianceRecord = { id: string; type: "fertilizer" | "pesticide" | "activity"; name: string; date: string; notes: string };

type State = {
  user: User | null;
  products: Product[];
  batches: Batch[];
  labels: LabelDoc[];
  reports: Report[];
  records: ComplianceRecord[];
};

const KEY = "agritrace-state-v1";
const initial: State = { user: null, products: [], batches: [], labels: [], reports: [], records: [] };

let state: State = initial;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {}
}
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export const store = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get() { return state; },
  signup(u: User) { set((s) => ({ ...s, user: u })); },
  login(email: string) {
    if (state.user && state.user.email === email) return true;
    // demo login: synthesize user
    set((s) => ({ ...s, user: s.user ?? { fullName: email.split("@")[0], email, farmName: "My Farm", location: "—" } }));
    return true;
  },
  logout() { set((s) => ({ ...s, user: null })); },
  addProduct(p: Omit<Product, "id" | "createdAt">) {
    set((s) => ({ ...s, products: [{ ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.products] }));
  },
  addBatch(b: Omit<Batch, "id" | "createdAt" | "code">) {
    const code = "BATCH-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    set((s) => ({ ...s, batches: [{ ...b, id: crypto.randomUUID(), code, createdAt: new Date().toISOString() }, ...s.batches] }));
  },
  addLabel(l: Omit<LabelDoc, "id" | "createdAt">) {
    set((s) => ({ ...s, labels: [{ ...l, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.labels] }));
  },
  addReport(r: Omit<Report, "id" | "createdAt">) {
    set((s) => ({ ...s, reports: [{ ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.reports] }));
  },
  addRecord(r: Omit<ComplianceRecord, "id">) {
    set((s) => ({ ...s, records: [{ ...r, id: crypto.randomUUID() }, ...s.records] }));
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  // Lazy load on first client render
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { load(); setHydrated(true); listeners.forEach((l) => l()); }, []);
  const snap = useSyncExternalStore(store.subscribe, () => selector(state), () => selector(initial));
  return hydrated ? snap : selector(initial);
}
