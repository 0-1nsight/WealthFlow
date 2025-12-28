import { db } from "./db";
import { 
  expenses, 
  expenseSplits, 
  assets, 
  userProfiles, 
  netWorthEntries, 
  receipts,
  type InsertExpense,
  type InsertExpenseSplit,
  type InsertAsset,
  type InsertUserProfile,
  type InsertReceipt,
  type Expense
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Expenses
  getExpenses(userId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense, splits?: InsertExpenseSplit[]): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Assets
  getAssets(userId: string): Promise<typeof assets.$inferSelect[]>;
  createAsset(asset: InsertAsset): Promise<typeof assets.$inferSelect>;
  updateAsset(id: number, updates: Partial<InsertAsset>): Promise<typeof assets.$inferSelect>;
  
  // User Profile
  getUserProfile(userId: string): Promise<typeof userProfiles.$inferSelect | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<typeof userProfiles.$inferSelect>;
  
  // Net Worth
  getNetWorthHistory(userId: string): Promise<typeof netWorthEntries.$inferSelect[]>;
  logNetWorth(userId: string, totalValue: string): Promise<typeof netWorthEntries.$inferSelect>;

  // Receipts
  createReceipt(receipt: InsertReceipt): Promise<typeof receipts.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  async getExpenses(userId: string): Promise<Expense[]> {
    // In a real app, complex join to get expenses where user is payer OR split participant
    // For now, just payer
    return await db.select().from(expenses)
      .where(eq(expenses.payerId, userId))
      .orderBy(desc(expenses.date));
  }

  async createExpense(expense: InsertExpense, splits?: InsertExpenseSplit[]): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    
    if (splits && splits.length > 0) {
      const splitsWithId = splits.map(s => ({ ...s, expenseId: newExpense.id }));
      await db.insert(expenseSplits).values(splitsWithId);
    }
    
    return newExpense;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, id));
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getAssets(userId: string): Promise<typeof assets.$inferSelect[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async createAsset(asset: InsertAsset): Promise<typeof assets.$inferSelect> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: number, updates: Partial<InsertAsset>): Promise<typeof assets.$inferSelect> {
    const [updated] = await db.update(assets)
      .set(updates)
      .where(eq(assets.id, id))
      .returning();
    return updated;
  }

  async getUserProfile(userId: string): Promise<typeof userProfiles.$inferSelect | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<typeof userProfiles.$inferSelect> {
    const [upserted] = await db.insert(userProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: profile
      })
      .returning();
    return upserted;
  }

  async getNetWorthHistory(userId: string): Promise<typeof netWorthEntries.$inferSelect[]> {
    return await db.select().from(netWorthEntries)
      .where(eq(netWorthEntries.userId, userId))
      .orderBy(desc(netWorthEntries.date));
  }

  async logNetWorth(userId: string, totalValue: string): Promise<typeof netWorthEntries.$inferSelect> {
    const [entry] = await db.insert(netWorthEntries)
      .values({ userId, totalValue })
      .returning();
    return entry;
  }

  async createReceipt(receipt: InsertReceipt): Promise<typeof receipts.$inferSelect> {
    const [newReceipt] = await db.insert(receipts).values(receipt).returning();
    return newReceipt;
  }
}

export const storage = new DatabaseStorage();
