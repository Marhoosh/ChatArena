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
      .eq("userId", userId)
      .single();
  },

  getUsageHistory: async (userId: string, limit: number = 10) => {
    return supabase
      .from("usage")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(limit);
  },

  getUsageByDateRange: async (userId: string, startDate: string, endDate: string) => {
    return supabase
      .from("usage")
      .select("*")
      .eq("userId", userId)
      .gte("createdAt", startDate)
      .lte("createdAt", endDate)
      .order("createdAt", { ascending: false });
  },

  getTotalUsageByUser: async (userId: string) => {
    return supabase
      .from("usage")
      .select("basic, advanced, images")
      .eq("userId", userId);
  },
};

export const usageMutations = {
  createUsage: async (
    userId: string,
    basic: number = 0,
    advanced: number = 0,
    images: number = 0
  ) => {
    return supabase
      .from("usage")
      .insert({
        userId,
        basic,
        advanced,
        images,
      })
      .select()
      .single();
  },

  updateUsage: async (
    id: string,
    updates: Partial<Pick<UsageRow, "basic" | "advanced" | "images">>
  ) => {
    return supabase
      .from("usage")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
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
    updateField[type] = amount;
    
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
        basic: 0,
        advanced: 0,
        images: 0,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteUsage: async (id: string) => {
    return supabase.from("usage").delete().eq("id", id);
  },
};