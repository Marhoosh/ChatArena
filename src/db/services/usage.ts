import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";

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

export class UsageService {
  async getUserUsage(userId: string): Promise<{ usage: UsageStats | null; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUserUsage(userId);

      return {
        usage: data ? toCamelCaseObject<UsageStats>(data) : null,
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
    type: "gen_image_usage" | "basic_usage" | "advanced_usage",
    amount: number = 1
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error: incrementError } = await usageMutations.incrementUsage(userId, type, amount);
      
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


}

export const usageService = new UsageService();