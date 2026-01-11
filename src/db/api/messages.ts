import { supabase } from "../client";
import { Database } from "../types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export const messagesQueries = {
  getMessagesByConversationId: async (conversationId: string) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
  },

  getMessageById: async (id: string) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();
  }
};

export const messagesMutations = {
  insertMessage: async (message: MessageInsert) => {
    return supabase
      .from("messages")
      .insert(message)
      .select()
      .single();
  },

  insertMessages: async (messages: MessageInsert[]) => {
    return supabase
      .from("messages")
      .insert(messages)
      .select();
  },

  updateMessage: async (id: string, updates: MessageUpdate) => {
    return supabase
      .from("messages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
  },

  deleteMessage: async (id: string) => {
    return supabase
      .from("messages")
      .delete()
      .eq("id", id);
  },

  deleteMessagesByConversationId: async (conversationId: string) => {
    return supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);
  }
};
