import { userQueries, userMutations } from "../api";
import { UserProfile, UserSettings } from "../types";

export class UserService {
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await userQueries.getUserProfile(userId);

      return {
        profile: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        profile: null,
        error: error as Error,
      };
    }
  }

  async createUserProfile(
    userId: string,
    email: string,
    username?: string,
    avatarUrl?: string
  ): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await userMutations.createUserProfile(userId, email, username, avatarUrl);

      return {
        profile: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        profile: null,
        error: error as Error,
      };
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, "username" | "avatar_url">>
  ): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await userMutations.updateUserProfile(userId, updates);

      return {
        profile: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        profile: null,
        error: error as Error,
      };
    }
  }

  async getUserSettings(userId: string): Promise<{ settings: UserSettings | null; error: Error | null }> {
    try {
      const { data, error } = await userQueries.getUserSettings(userId);

      return {
        settings: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        settings: null,
        error: error as Error,
      };
    }
  }

  async createUserSettings(
    userId: string,
    theme: "light" | "dark" | "system" = "system",
    language: string = "en"
  ): Promise<{ settings: UserSettings | null; error: Error | null }> {
    try {
      const { data, error } = await userMutations.createUserSettings(userId, theme, language);

      return {
        settings: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        settings: null,
        error: error as Error,
      };
    }
  }

  async updateUserSettings(
    userId: string,
    updates: Partial<Pick<UserSettings, "theme" | "language">>
  ): Promise<{ settings: UserSettings | null; error: Error | null }> {
    try {
      const { data, error } = await userMutations.updateUserSettings(userId, updates);

      return {
        settings: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        settings: null,
        error: error as Error,
      };
    }
  }
}

export const userService = new UserService();