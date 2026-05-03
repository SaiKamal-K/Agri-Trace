// Supabase-backed store. Keeps the same shape used across the dashboard
// (camelCase fields, store.addX(), useStore selector) but persists to Supabase.
import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  productsService, batchesService, complianceService, labelsService, reportsService, profilesService,
  type ProductRow, type BatchRow, type ComplianceRow, type LabelRow, type ReportRow, type ProfileRow,
} from "@/services/tables";

export type User = { id: string; fullName: string; email: string; farmName: string; location: string };
export type Product = { id: string; name: string; category: string; createdAt: string; image?: string };
export type Batch = { id: string; productId: string; code: string; harvestDate: string; quantity: string; createdAt: string };
export type LabelDoc = { id: string; productId: string; batchId: string; createdAt: string };
export type Report = { id: string; batchId: string; createdAt: string };
export type ComplianceRecord = { id: string; type: "fertilizer" | "pesticide" | "activity"; name: string; date: string; notes: string };

type State = {
  user: User | null;
  loading: boolean;
  products: Product[];
  batches: Batch[];
  labels: LabelDoc[];
  reports: Report[];
  records: ComplianceRecord[];
};

const initial: State = { user: null, loading: true, products: [], batches: [], labels: [], reports: [], records: [] };
let state: State = initial;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const set = (u: (s: State) => State) => { state = u(state); notify(); };

// ----- mappers (db row -> ui shape) -----
const mapProduct = (r: ProductRow): Product => ({ id: r.id, name: r.name, category: r.category, createdAt: r.created_at, image: r.image_url ?? undefined });
const mapBatch = (r: BatchRow): Batch => ({ id: r.id, productId: r.product_id, code: r.code, harvestDate: r.harvest_date, quantity: r.quantity, createdAt: r.created_at });
const mapLabel = (r: LabelRow): LabelDoc => ({ id: r.id, productId: r.product_id, batchId: r.batch_id, createdAt: r.created_at });
const mapReport = (r: ReportRow): Report => ({ id: r.id, batchId: r.batch_id, createdAt: r.created_at });
const mapRecord = (r: ComplianceRow): ComplianceRecord => ({ id: r.id, type: r.type, name: r.name, date: r.date, notes: r.notes });

async function loadAll() {
  try {
    const [products, batches, labels, reports, records] = await Promise.all([
      productsService.list(), batchesService.list(), labelsService.list(), reportsService.list(), complianceService.list(),
    ]);
    set((s) => ({
      ...s,
      products: products.map(mapProduct),
      batches: batches.map(mapBatch),
      labels: labels.map(mapLabel),
      reports: reports.map(mapReport),
      records: records.map(mapRecord),
    }));
  } catch (e) {
    console.error("[store:loadAll]", e);
  }
}

async function loadUser(authUserId: string, email: string) {
  let profile: ProfileRow | null = null;
  try { profile = await profilesService.getMine(); } catch (e) { console.error("[store:loadUser]", e); }
  set((s) => ({
    ...s,
    user: {
      id: authUserId,
      email,
      fullName: profile?.full_name || email.split("@")[0],
      farmName: profile?.farm_name || "My Farm",
      location: profile?.location || "—",
    },
  }));
}

let initialized = false;
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // listener first (per Supabase guidance)
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // defer DB calls to avoid deadlock inside the callback
      setTimeout(() => {
        loadUser(session.user.id, session.user.email ?? "");
        loadAll();
      }, 0);
    } else {
      set((s) => ({ ...s, user: null, products: [], batches: [], labels: [], reports: [], records: [] }));
    }
  });

  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      loadUser(data.session.user.id, data.session.user.email ?? "");
      loadAll().finally(() => set((s) => ({ ...s, loading: false })));
    } else {
      set((s) => ({ ...s, loading: false }));
    }
  });
}

export const store = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get() { return state; },

  async signup(input: { fullName: string; email: string; password: string; farmName: string; location: string }) {
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: input.fullName, farm_name: input.farmName, location: input.location },
      },
    });
    if (error) throw error;
  },
  async login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async logout() {
    await supabase.auth.signOut();
  },

  async addProduct(p: { name: string; category: string; image?: string }) {
    const row = await productsService.create({ name: p.name, category: p.category, image_url: p.image ?? null });
    set((s) => ({ ...s, products: [mapProduct(row), ...s.products] }));
  },
  async addBatch(b: { productId: string; harvestDate: string; quantity: string }) {
    const row = await batchesService.create({ product_id: b.productId, harvest_date: b.harvestDate, quantity: b.quantity });
    set((s) => ({ ...s, batches: [mapBatch(row), ...s.batches] }));
  },
  async addLabel(l: { productId: string; batchId: string }) {
    const row = await labelsService.create({ product_id: l.productId, batch_id: l.batchId });
    set((s) => ({ ...s, labels: [mapLabel(row), ...s.labels] }));
  },
  async addReport(r: { batchId: string }) {
    const row = await reportsService.create({ batch_id: r.batchId });
    set((s) => ({ ...s, reports: [mapReport(row), ...s.reports] }));
  },
  async addRecord(r: { type: ComplianceRecord["type"]; name: string; date: string; notes: string }) {
    const row = await complianceService.create(r);
    set((s) => ({ ...s, records: [mapRecord(row), ...s.records] }));
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { init(); setHydrated(true); notify(); }, []);
  const snap = useSyncExternalStore(store.subscribe, () => selector(state), () => selector(initial));
  return hydrated ? snap : selector(initial);
}
