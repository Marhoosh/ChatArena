import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import { usageTable } from './schema';

export const db = drizzle(process.env.DATABASE_URL!);

// 创建usage记录
export const createUsage = async (userId: string, basic: number = 0, advanced: number = 0, images: number = 0) => {
  const [result] = await db.insert(usageTable).values({
    userId,
    basic,
    advanced,
    images,
  }).returning();
  return result;
};

// 根据ID获取usage记录
export const getUsageById = async (id: string) => {
  const [result] = await db.select().from(usageTable).where(eq(usageTable.id, id));
  return result || null;
};

// 根据用户ID获取usage记录
export const getUsageByUserId = async (userId: string) => {
  const [result] = await db.select().from(usageTable).where(eq(usageTable.userId, userId));
  return result || null;
};

// 更新usage记录
export const updateUsage = async (id: string, data: { basic?: number; advanced?: number; images?: number }) => {
  const [result] = await db.update(usageTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(usageTable.id, id))
    .returning();
  return result || null;
};

// 根据用户ID更新usage记录
export const updateUsageByUserId = async (userId: string, data: { basic?: number; advanced?: number; images?: number }) => {
  const [result] = await db.update(usageTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(usageTable.userId, userId))
    .returning();
  return result || null;
};

// 增加使用量
export const incrementUsage = async (userId: string, type: 'basic' | 'advanced' | 'images', amount: number = 1) => {
  // 首先检查用户是否已有usage记录
  let usage = await getUsageByUserId(userId);
  
  if (!usage) {
    // 如果没有记录，创建新记录
    const initialData = { basic: 0, advanced: 0, images: 0 };
    initialData[type] = amount;
    return await createUsage(userId, initialData.basic, initialData.advanced, initialData.images);
  } else {
    // 如果有记录，更新对应类型的使用量
    const updateData: any = {};
    updateData[type] = usage[type] + amount;
    return await updateUsageByUserId(userId, updateData);
  }
};

// 删除usage记录
export const deleteUsage = async (id: string) => {
  const [result] = await db.delete(usageTable).where(eq(usageTable.id, id)).returning();
  return result || null;
};

// 根据用户ID删除usage记录
export const deleteUsageByUserId = async (userId: string) => {
  const [result] = await db.delete(usageTable).where(eq(usageTable.userId, userId)).returning();
  return result || null;
};

// 获取所有usage记录
export const getAllUsage = async () => {
  return await db.select().from(usageTable);
};