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
  }
};

export const usageMutations = {

  //TODO：防止用户直接调接口(不止更新接口)更新各种字段，此处Partial只是ts的类型检查，不做运行时的筛选
  incrementUsage: async (
    user_id: string,
    type: "gen_image_usage" | "basic_usage" | "advanced_usage",
    amount: number = 1
  ) => {
    return supabase.rpc('increment_usage', {
      user_id: user_id,
      usage_type: type,
      increment_amount: amount
    });
  }
};