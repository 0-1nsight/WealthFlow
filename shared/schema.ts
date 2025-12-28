import { pgTable, text, serial, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";

// Export auth models so they are available in schema
export * from "./models/auth";
export * from "./models/chat";

// === TABLE DEFINITIONS ===

// Extend the auth users table with app-specific fields
// Note: We can't strictly "extend" the table definition easily in Drizzle without 
// modifying the auth module, so we'll create a profile table linked to auth users.
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Links to auth.users.id
  monthlyIncome: numeric("monthly_income").notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  themePreference: text("theme_preference").default("system"),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  payerId: text("payer_id").notNull(), // Links to auth.users.id
  categoryId: integer("category_id"),
  receiptId: integer("receipt_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id),
  userId: text("user_id").notNull(), // Links to auth.users.id
  amountOwed: numeric("amount_owed").notNull(),
  percentage: numeric("percentage").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  scanData: jsonb("scan_data"),
  uploadedBy: text("uploaded_by").notNull(), // Links to auth.users.id
  expenseId: integer("expense_id"), // Can be linked after creation
  date: timestamp("date").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  value: numeric("value").notNull(),
  type: text("type").notNull(), // 'cash', 'investment', 'property', etc.
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const netWorthEntries = pgTable("net_worth_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  totalValue: numeric("total_value").notNull(),
  date: timestamp("date").defaultNow(),
});

// === RELATIONS ===
export const expensesRelations = relations(expenses, ({ one, many }) => ({
  splits: many(expenseSplits),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  receipt: one(receipts, {
    fields: [expenses.receiptId],
    references: [receipts.id],
  }),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertReceiptSchema = createInsertSchema(receipts).omit({ id: true, date: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, lastUpdated: true });
export const insertNetWorthEntrySchema = createInsertSchema(netWorthEntries).omit({ id: true, date: true });

// === TYPES ===
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type NetWorthEntry = typeof netWorthEntries.$inferSelect;
export type InsertNetWorthEntry = z.infer<typeof insertNetWorthEntrySchema>;

// API Types
export type CreateExpenseRequest = InsertExpense & {
  splits?: Omit<InsertExpenseSplit, "expenseId">[];
};

export type ExpenseResponse = Expense & {
  splits?: ExpenseSplit[];
  category?: Category | null;
  receipt?: Receipt | null;
};
