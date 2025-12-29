import { integer, pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";


export const usageTable = pgTable("usage", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  basic: integer().notNull().default(0),
  advanced: integer().notNull().default(0),
  images: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export type Usage = typeof usageTable.$inferSelect
