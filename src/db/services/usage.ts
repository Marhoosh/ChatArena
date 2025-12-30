import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export interface UsageStats {
  totalBasic: number;
  totalAdvanced: number;
  totalImages: number;
}

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
    basic: number = 0,
    advanced: number = 0,
    images: number = 0
  ): Promise<{ usage: UsageRow | null; error: Error | null }> {
    try {
      const { data, error } = await usageMutations.createUsage(userId, basic, advanced, images);

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
    updates: Partial<Pick<UsageRow, "basic" | "advanced" | "images">>
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

  async getUsageHistory(userId: string, limit: number = 10): Promise<{ history: UsageRow[]; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUsageHistory(userId, limit);

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

  async getTotalUsageByUser(userId: string): Promise<{ stats: UsageStats | null; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getTotalUsageByUser(userId);

      if (error) {
        return { stats: null, error: new Error(error.message) };
      }

      const stats: UsageStats = {
        totalBasic: 0,
        totalAdvanced: 0,
        totalImages: 0,
      };

      if (data && data.length > 0) {
        data.forEach((record) => {
          stats.totalBasic += record.basic || 0;
          stats.totalAdvanced += record.advanced || 0;
          stats.totalImages += record.images || 0;
        });
      }

      return { stats, error: null };
    } catch (error) {
      return {
        stats: null,
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
      const { stats, error } = await this.getTotalUsageByUser(userId);
      
      if (error || !stats) {
        return { 
          withinLimit: false, 
          currentUsage: 0, 
          error: error || new Error("Failed to get usage stats") 
        };
      }
      
      let currentUsage = 0;
      switch (type) {
        case "basic":
          currentUsage = stats.totalBasic;
          break;
        case "advanced":
          currentUsage = stats.totalAdvanced;
          break;
        case "images":
          currentUsage = stats.totalImages;
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