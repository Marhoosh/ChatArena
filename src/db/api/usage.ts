import { supabase } from "../client";
import { Database } from "../types";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];
type UsageInsert = Database["public"]["Tables"]["usage"]["Insert"];
type UsageUpdate = Database["public"]["Tables"]["usage"]["Update"];

export const usageQueries = {
  getUserUsage: async (userId: string) => {
    return supabase
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .single();
  },

  getUsageHistory: async (userId: string, limit: number = 10) => {
    return supabase
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  getUsageByDateRange: async (userId: string, startDate: string, endDate: string) => {
    return supabase
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });
  },

  getTotalUsageByUser: async (userId: string) => {
    return supabase
      .from("usage")
      .select("basic_usage, advanced_usage, gen_image_usage, basic_limit, advanced_limit, gen_image_limit")
      .eq("user_id", userId);
  },
};

export const usageMutations = {
  createUsage: async (
    userId: string,
    basic_usage: number = 0,
    advanced_usage: number = 0,
    gen_image_usage: number = 0
  ) => {
    return supabase
      .from("usage")
      .insert({
        user_id: userId,
        basic_usage,
        advanced_usage,
        gen_image_usage,
      })
      .select()
      .single();
  },

  updateUsage: async (
    id: string,
    updates: Partial<Pick<UsageRow, "basic_usage" | "advanced_usage" | "gen_image_usage">>
  ) => {
    return supabase
      .from("usage")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  incrementUsage: async (
    id: string,
    type: "basic" | "advanced" | "images",
    amount: number = 1
  ) => {
    const updateField: Record<string, number> = {};
    const usageType = type === "images" ? "gen_image_usage" : `${type}_usage`;
    updateField[usageType] = amount;
    
    return supabase.rpc('increment_usage', {
      usage_id: id,
      usage_type: type,
      increment_amount: amount
    });
  },

  resetUsage: async (id: string) => {
    return supabase
      .from("usage")
      .update({
        basic_usage: 0,
        advanced_usage: 0,
        gen_image_usage: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteUsage: async (id: string) => {
    return supabase.from("usage").delete().eq("id", id);
  },
};