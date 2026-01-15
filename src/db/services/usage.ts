import { usageQueries, usageMutations } from "../api";
import { Database } from "../types";
import { toCamelCaseObject, toSnakeCaseObject } from "../utils";
import { ErrorCode, DataBaseError } from "~utils/errors";
import { Sentry } from "~services/sentry";
import { UsageModel } from "../../types/usage";

type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export class UsageService {
  async getUserUsage(userId: string): Promise<UsageModel> {
    try {
      const { data, error } = await usageQueries.getUserUsage(userId);

      if (error) {
        throw new DataBaseError(
          `获取用户使用数据失败: ${error.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          error
        );
      }

      if (!data) {
        throw new DataBaseError(
          '用户使用数据不存在',
          ErrorCode.DATABASE_RECORD_NOT_FOUND
        );
      }

      return toCamelCaseObject<UsageModel>(data);
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `获取用户使用数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }

  async incrementUsage(
    userId: string,
    type: "gen_image_usage" | "basic_usage" | "advanced_usage",
    amount: number = 1
  ): Promise<void> {
    try {
      const { error: incrementError } = await usageMutations.incrementUsage(userId, type, amount);
      
      if (incrementError) {
        throw new DataBaseError(
          `增加用户使用量失败: ${incrementError.message || '未知错误'}`,
          ErrorCode.DATABASE_QUERY_FAILED,
          incrementError
        );
      }
    } catch (error) {
      if (error instanceof DataBaseError) {
        Sentry.captureException(error);
        throw error;
      }
      const dbError = new DataBaseError(
        `增加用户使用量失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ErrorCode.DATABASE_QUERY_FAILED,
        error
      );
      Sentry.captureException(dbError);
      throw dbError;
    }
  }
}

export const usageService = new UsageService();
