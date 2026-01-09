import { User } from "@supabase/supabase-js";
import { supabase } from "../client";
import { AuthState } from "~types";

export class AuthService {
  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      return {
        user: data.user,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return {
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        error: error as Error,
      };
    }
  }

  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return {
        user: data.user,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return {
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        error: error as Error,
      };
    }
  }

  onAuthStateChange(callback: (authState: AuthState) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });
  }
}

export const authService = new AuthService();