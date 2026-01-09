import { supabase } from "../client";
import { Database } from "../types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export const messageQueries = {
  getMessageById: async (id: string) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();
  },

  getMessagesByConversationId: async (conversationId: string, limit: number = 100) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);
  },

  getMessagesByAuthor: async (conversationId: string, author: string, limit: number = 100) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("author", author)
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  getMessagesWithImages: async (conversationId: string, limit: number = 100) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .not("image_data", "is", null)
      .order("created_at", { ascending: true })
      .limit(limit);
  },

  getMessagesWithErrors: async (conversationId: string, limit: number = 100) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .not("error_code", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  getMessagesByDateRange: async (
    conversationId: string,
    startDate: string,
    endDate: string
  ) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });
  },

  searchMessagesByText: async (
    conversationId: string,
    searchTerm: string,
    limit: number = 100
  ) => {
    return supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .ilike("text", `%${searchTerm}%`)
      .order("created_at", { ascending: true })
      .limit(limit);
  },

  getConversationMessageCount: async (conversationId: string) => {
    return supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId);
  },
};

export const messageMutations = {
  createMessage: async (
    conversationId: string,
    author: string,
    text: string,
    imageData?: string | null,
    imageType?: string | null
  ) => {
    return supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        author,
        text,
        image_data: imageData || null,
        image_type: imageType || null,
      })
      .select()
      .single();
  },

  updateMessage: async (id: string, updates: Partial<MessageUpdate>) => {
    return supabase
      .from("messages")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  updateMessageText: async (id: string, text: string) => {
    return supabase
      .from("messages")
      .update({
        text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  updateMessageError: async (
    id: string,
    errorCode: string | null,
    errorMessage: string | null
  ) => {
    return supabase
      .from("messages")
      .update({
        error_code: errorCode,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteMessage: async (id: string) => {
    return supabase.from("messages").delete().eq("id", id);
  },

  deleteMessagesByConversation: async (conversationId: string) => {
    return supabase.from("messages").delete().eq("conversation_id", conversationId);
  },

  deleteMessagesByAuthor: async (conversationId: string, author: string) => {
    return supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("author", author);
  },
};
