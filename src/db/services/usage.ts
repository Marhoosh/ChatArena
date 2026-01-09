import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export interface UsageStats {
  id: string;
  userId: string;
  basicUsage: number;
  basicLimit: number;
  advancedUsage: number;
  advancedLimit: number;
  genImageUsage: number;
  genImageLimit: number;
  createdAt: string;
  updatedAt: string;
}

function convertToUsageStats(dbUsage: UsageRow): UsageStats {
  return {
    id: dbUsage.id,
    userId: dbUsage.user_id,
    basicUsage: dbUsage.basic_usage,
    basicLimit: dbUsage.basic_limit,
    advancedUsage: dbUsage.advanced_usage,
    advancedLimit: dbUsage.advanced_limit,
    genImageUsage: dbUsage.gen_image_usage,
    genImageLimit: dbUsage.gen_image_limit,
    createdAt: dbUsage.created_at,
    updatedAt: dbUsage.updated_at,
  };
}

export class UsageService {
  async getUserUsage(userId: string): Promise<{ usage: UsageStats | null; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUserUsage(userId);

      return {
        usage: data ? convertToUsageStats(data) : null,
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
  ): Promise<{ usage: UsageStats | null; error: Error | null }> {
    try {
      const { data, error } = await usageMutations.createUsage(userId, basic_usage, advanced_usage, gen_image_usage);

      return {
        usage: data ? convertToUsageStats(data) : null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      return {
        usage: null,
        error: error as Error,
      };
    }
  }

  async getOrCreateUsage(userId: string): Promise<{ usage: UsageStats | null; error: Error | null }> {
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
  ): Promise<{ usage: UsageStats | null; error: Error | null }> {
    try {
      const { data, error } = await usageMutations.updateUsage(id, updates);

      return {
        usage: data ? convertToUsageStats(data) : null,
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

  async resetUsage(userId: string): Promise<{ usage: UsageStats | null; error: Error | null }> {
    try {
      const { usage, error } = await this.getUserUsage(userId);
      
      if (error || !usage) {
        return { usage: null, error: error || new Error("Usage record not found") };
      }
      
      const { data, error: resetError } = await usageMutations.resetUsage(usage.id);
      
      return {
        usage: data ? convertToUsageStats(data) : null,
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
  ): Promise<{ history: UsageStats[]; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUsageByDateRange(userId, startDate, endDate);

      return {
        history: data ? data.map(convertToUsageStats) : [],
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
          currentUsage = usage.basicUsage || 0;
          break;
        case "advanced":
          currentUsage = usage.advancedUsage || 0;
          break;
        case "images":
          currentUsage = usage.genImageUsage || 0;
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