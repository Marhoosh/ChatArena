import { supabase } from "../client";
import { UserProfile, UserSettings } from "../types";

export const userQueries = {
  getUserProfile: async (userId: string) => {
    return supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
  },

  getUserSettings: async (userId: string) => {
    return supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();
  },

  getUserWithSettings: async (userId: string) => {
    return supabase
      .from("users")
      .select(`
        *,
        user_settings (*)
      `)
      .eq("id", userId)
      .single();
  },
};

export const userMutations = {
  createUserProfile: async (
    userId: string,
    email: string,
    username?: string,
    avatarUrl?: string
  ) => {
    return supabase
      .from("users")
      .insert({
        id: userId,
        email,
        username: username || null,
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();
  },

  updateUserProfile: async (
    userId: string,
    updates: Partial<Pick<UserProfile, "username" | "avatar_url">>
  ) => {
    return supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();
  },

  createUserSettings: async (
    userId: string,
    theme: "light" | "dark" | "system" = "system",
    language: string = "en"
  ) => {
    return supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        theme,
        language,
      })
      .select()
      .single();
  },

  updateUserSettings: async (
    userId: string,
    updates: Partial<Pick<UserSettings, "theme" | "language">>
  ) => {
    return supabase
      .from("user_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();
  },
};