import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { UsageModel } from "../../types/usage";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export class UsageService {
  async getUserUsage(userId: string): Promise<UsageModel> {
    try {
      const { data } = await usageQueries.getUserUsage(userId);

      return toCamelCaseObject<UsageModel>(data);
    } catch (error) {
      throw new DataBaseError(
        `获取用户使用数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }

  async incrementUsage(
    userId: string,
    type: "gen_image_usage" | "basic_usage" | "advanced_usage",
    amount: number = 1
  ): Promise<void> {
    try {
      await usageMutations.incrementUsage(userId, type, amount);
    } catch (error) {
      throw new DataBaseError(
        `增加用户使用量失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
    }
  }
}

export const usageService = new UsageService();
