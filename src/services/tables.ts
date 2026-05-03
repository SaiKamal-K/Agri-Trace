// Typed per-table services. RLS scopes queries to the signed-in user.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type ProfileRow = Tables["profiles"]["Row"];
export type ProductRow = Tables["products"]["Row"];
export type BatchRow = Tables["batches"]["Row"];
export type ComplianceRow = Tables["compliance_records"]["Row"];
export type LabelRow = Tables["labels"]["Row"];
export type ReportRow = Tables["reports"]["Row"];

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export const profilesService = {
  async getMine(): Promise<ProfileRow | null> {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async update(patch: Partial<Tables["profiles"]["Update"]>): Promise<ProfileRow> {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
};

export const productsService = {
  async list(): Promise<ProductRow[]> {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(input: { name: string; category: string; image_url?: string | null }): Promise<ProductRow> {
    const user_id = await uid();
    const { data, error } = await supabase.from("products").insert({ ...input, user_id }).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, patch: Partial<Tables["products"]["Update"]>) {
    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};

export const batchesService = {
  async list(): Promise<BatchRow[]> {
    const { data, error } = await supabase.from("batches").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(input: { product_id: string; harvest_date: string; quantity: string }): Promise<BatchRow> {
    const user_id = await uid();
    const code = "BATCH-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const { data, error } = await supabase.from("batches").insert({ ...input, code, user_id }).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) throw error;
  },
};

export const complianceService = {
  async list(): Promise<ComplianceRow[]> {
    const { data, error } = await supabase.from("compliance_records").select("*").order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(input: { type: ComplianceRow["type"]; name: string; date: string; notes: string }) {
    const user_id = await uid();
    const { data, error } = await supabase.from("compliance_records").insert({ ...input, user_id }).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase.from("compliance_records").delete().eq("id", id);
    if (error) throw error;
  },
};

export const labelsService = {
  async list(): Promise<LabelRow[]> {
    const { data, error } = await supabase.from("labels").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(input: { product_id: string; batch_id: string }): Promise<LabelRow> {
    const user_id = await uid();
    const { data, error } = await supabase.from("labels").insert({ ...input, user_id }).select().single();
    if (error) throw error;
    return data;
  },
};

export const reportsService = {
  async list(): Promise<ReportRow[]> {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async create(input: { batch_id: string }): Promise<ReportRow> {
    const user_id = await uid();
    const { data, error } = await supabase.from("reports").insert({ ...input, user_id }).select().single();
    if (error) throw error;
    return data;
  },
};
