import { supabase } from "../client";
import { Database } from "../types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

export const conversationsQueries = {
  getConversationsByBotId: async (botId: string, userId: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("bot_id", botId)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
  },

  getConversationById: async (id: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();
  }
};

export const conversationsMutations = {
  insertConversation: async (conversation: ConversationInsert) => {
    return supabase
      .from("conversations")
      .insert(conversation)
      .select()
      .single();
  },

  updateConversation: async (id: string, updates: ConversationUpdate) => {
    return supabase
      .from("conversations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
  },

  deleteConversation: async (id: string) => {
    return supabase
      .from("conversations")
      .delete()
      .eq("id", id);
  },

  deleteConversationsByBotId: async (botId: string, userId: string) => {
    return supabase
      .from("conversations")
      .delete()
      .eq("bot_id", botId)
      .eq("user_id", userId);
  }
};
