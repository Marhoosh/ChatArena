import { supabase } from "../client";
import { Database } from "../types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

export const conversationQueries = {
  getConversationById: async (id: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();
  },

  getConversationsByUserId: async (userId: string, limit: number = 20) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
  },

  getConversationsByBotId: async (botId: string, limit: number = 20) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("bot_id", botId)
      .order("updated_at", { ascending: false })
      .limit(limit);
  },

  getConversationsByUserAndBot: async (userId: string, botId: string, limit: number = 20) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("bot_id", botId)
      .order("updated_at", { ascending: false })
      .limit(limit);
  },

  getConversationsByDateRange: async (startDate: string, endDate: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });
  },

  searchConversationsByTitle: async (userId: string, searchTerm: string, limit: number = 20) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .ilike("title", `%${searchTerm}%`)
      .order("updated_at", { ascending: false })
      .limit(limit);
  },
};

export const conversationMutations = {
  createConversation: async (
    botId: string,
    userId?: string,
    title?: string | null
  ) => {
    return supabase
      .from("conversations")
      .insert({
        bot_id: botId,
        user_id: userId || null,
        title: title || null,
      })
      .select()
      .single();
  },

  updateConversation: async (
    id: string,
    updates: Partial<ConversationUpdate>
  ) => {
    return supabase
      .from("conversations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  updateConversationTitle: async (id: string, title: string) => {
    return supabase
      .from("conversations")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteConversation: async (id: string) => {
    return supabase.from("conversations").delete().eq("id", id);
  },

  deleteConversationsByUser: async (userId: string) => {
    return supabase.from("conversations").delete().eq("user_id", userId);
  },

  deleteConversationsByBot: async (botId: string) => {
    return supabase.from("conversations").delete().eq("bot_id", botId),
  },
};
