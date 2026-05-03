// Generic CRUD helper. Use for admin / dev / one-off scripts.
// For app code, prefer the typed services in ./tables.ts (RLS-aware, type-safe).
import { supabase } from "@/integrations/supabase/client";

export type QueryOpts = {
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  search?: { column: string; query: string };
};

function applyOpts(q: any, opts: QueryOpts = {}) {
  if (opts.filters) {
    for (const [k, v] of Object.entries(opts.filters)) q = q.eq(k, v as any);
  }
  if (opts.search) q = q.ilike(opts.search.column, `%${opts.search.query}%`);
  if (opts.orderBy) q = q.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? true });
  if (typeof opts.limit === "number") {
    const from = opts.offset ?? 0;
    q = q.range(from, from + opts.limit - 1);
  }
  return q;
}

export async function getAll<T = any>(table: string, opts: QueryOpts = {}): Promise<T[]> {
  let q: any = (supabase as any).from(table).select("*");
  q = applyOpts(q, opts);
  const { data, error } = await q;
  if (error) { console.error(`[crud:getAll ${table}]`, error); throw error; }
  return (data ?? []) as T[];
}

export async function getById<T = any>(table: string, id: string): Promise<T | null> {
  const { data, error } = await (supabase as any).from(table).select("*").eq("id", id).maybeSingle();
  if (error) { console.error(`[crud:getById ${table}]`, error); throw error; }
  return data as T | null;
}

export async function createRecord<T = any>(table: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await (supabase as any).from(table).insert(payload).select().single();
  if (error) { console.error(`[crud:create ${table}]`, error); throw error; }
  return data as T;
}

export async function updateRecord<T = any>(table: string, id: string, patch: Record<string, unknown>): Promise<T> {
  const { data, error } = await (supabase as any).from(table).update(patch).eq("id", id).select().single();
  if (error) { console.error(`[crud:update ${table}]`, error); throw error; }
  return data as T;
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) { console.error(`[crud:delete ${table}]`, error); throw error; }
}
