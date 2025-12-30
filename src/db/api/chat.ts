import { supabase } from "../client";
import { Conversation, Database, Message } from "../types";

export const chatQueries = {
  getConversations: async (userId: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });  
  },

  getConversation: async (id: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();
  },

  getMessages: async (conversationId: string) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
  },

  getConversationWithMessages: async (id: string) => {
    return supabase
      .from("conversations")
      .select(`
        *,
        messages (*)
      `)
      .eq("id", id)
      .single();
  },

  searchConversations: async (userId: string, searchTerm: string) => {
    return supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .ilike("title", `%${searchTerm}%`)
      .order("updated_at", { ascending: false });
  },

  searchMessages: async (conversationId: string, searchTerm: string) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .ilike("content", `%${searchTerm}%`)
      .order("created_at", { ascending: true });
  },
};

export const chatMutations = {
  createConversation: async (userId: string, title: string, botType: string) => {
    return supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: title,
        bot_type: botType
      })
      .select()
      .single();
  },

  updateConversation: async (id: string, updates: Partial<Pick<Conversation, "title" | "bot_type">>) => {
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

  deleteConversation: async (id: string) => {
    return supabase.from("conversations").delete().eq("id", id);
  },

  createMessage: async (
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string
  ) => {
    return supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();
  },

  updateMessage: async (id: string, content: string) => {
    return supabase
      .from("messages")
      .update({ content })
      .eq("id", id)
      .select()
      .single();
  },

  deleteMessage: async (id: string) => {
    return supabase.from("messages").delete().eq("id", id);
  },
};