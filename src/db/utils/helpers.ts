import { supabase } from "../client";
import { User } from "@supabase/supabase-js";

export const isUserAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user || null;

};

export const generateConversationTitle = (firstMessage: string): string => {
  const maxLength = 50;
  const title = firstMessage.trim();
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const createRealtimeSubscription = (
  table: string,
  filter: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      callback
    )
    .subscribe();
};

export const subscribeToConversationChanges = (
  conversationId: string,
  callback: (payload: any) => void
) => {
  return createRealtimeSubscription(
    "messages",
    `conversation_id=eq.${conversationId}`,
    callback
  );
};

export const subscribeToUserConversations = (
  userId: string,
  callback: (payload: any) => void
) => {
  return createRealtimeSubscription(
    "conversations",
    `user_id=eq.${userId}`,
    callback
  );
};

export const unsubscribeFromChannel = (channel: any) => {
  supabase.removeChannel(channel);
};