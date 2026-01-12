import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";
import { handleDatabaseError } from "../utils/helpers";
import { UsageModel } from "../../types/usage";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export class UsageService {
  async getUserUsage(userId: string): Promise<{ usage: UsageModel | null; error: Error | null }> {
    try {
      const { data, error } = await usageQueries.getUserUsage(userId);

      return {
        usage: data ? toCamelCaseObject<UsageModel>(data) : null,
        error: error ? handleDatabaseError(error) : null,
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
        error: incrementError ? handleDatabaseError(incrementError) : null,
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