import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export class UsageService {
  async getUserUsage(userId: string): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUserUsage(userId);

      return {
        usage: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async createUsage(
    userId: string,
    basic_usage: number = 0,
    advanced_usage: number = 0,
    gen_image_usage: number = 0
  ): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { data, error } = await usageMutations.createUsage(userId, basic_usage, advanced_usage, gen_image_usage);

      return {
        usage: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async getOrCreateUsage(userId: string): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { usage, error } = await this.getUserUsage(userId);
      
      if (error) {
        return { usage: null, error };
      }
      
      if (usage) {
        return { usage, error: null };
      }
      
      return await this.createUsage(userId);
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async updateUsage(
    id: string,
    updates: Partial<Pick<UsageRow, "basic_usage" | "advanced_usage" | "gen_image_usage">>
  ): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { data, error } = await usageMutations.updateUsage(id, updates);

      return {
        usage: data,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async incrementUsage(
    userId: string,
    type: "basic" | "advanced" | "images",
    amount: number = 1
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { usage, error } = await this.getOrCreateUsage(userId);
      
      if (error || !usage) {
        return { success: false, error: error || new Error("Failed to get or create usage record") };
      }
      
      const { error: incrementError } = await usageMutations.incrementUsage(usage.id, type, amount);
      
      return {
        success: !incrementError,
        error: incrementError ? new Error(incrementError.message) : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async resetUsage(userId: string): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { usage, error } = await this.getUserUsage(userId);
      
      if (error || !usage) {
        return { usage: null, error: error || new Error("Usage record not found") };
      }
      
      const { data, error: resetError } = await usageMutations.resetUsage(usage.id);
      
      return {
        usage: data,
        error: resetError ? new Error(resetError.message) : null,
      };
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async getUsageByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ history: UsageRow[]; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUsageByDateRange(userId, startDate, endDate);

      return {
        history: data || [],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        history: [],
        error: error as Error,
      };
    }
  }

  async checkUsageLimit(
    userId: string,
    type: "basic" | "advanced" | "images",
    limit: number
  ): Promise<{ withinLimit: boolean; currentUsage: number; error: Error | null }> {
    try {
      const { usage, error } = await this.getUserUsage(userId);
      
      if (error || !usage) {
        return { 
          withinLimit: false, 
          currentUsage: 0, 
          error: error || new Error("Failed to get usage stats") 
        };
      }
      
      let currentUsage = 0;
      switch (type) {
        case "basic":
          currentUsage = usage.basic_usage || 0;
          break;
        case "advanced":
          currentUsage = usage.advanced_usage || 0;
          break;
        case "images":
          currentUsage = usage.gen_image_usage || 0;
          break;
      }
      
      return {
        withinLimit: currentUsage < limit,
        currentUsage,
        error: null,
      };
    } catch (error) {
      return {
        withinLimit: false,
        currentUsage: 0,
        error: error as Error,
      };
    }
  }
}

export const usageService = new UsageService();