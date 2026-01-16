import { usageQueries, usageMutations } from "../api";
import { toCamelCaseObject } from "../utils";
import { UsageModel } from "../../types/usage";


export class UsageService {
  async getUserUsage(userId: string): Promise<UsageModel> {
    const { data } = await usageQueries.getUserUsage(userId);
    return toCamelCaseObject<UsageModel>(data);
  }

  async incrementUsage(
    userId: string,
    type: "gen_image_usage" | "basic_usage" | "advanced_usage",
    amount: number = 1
  ): Promise<void> {
    await usageMutations.incrementUsage(userId, type, amount);
  }
}

export const usageService = new UsageService();
