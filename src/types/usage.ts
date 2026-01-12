export interface UsageModel {
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
