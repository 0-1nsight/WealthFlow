import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Integrations setup
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // App Routes - Protected by Auth
  
  // Expenses
  app.get(api.expenses.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
  });

  app.post(api.expenses.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.expenses.create.input.parse(req.body);
      // In a real app, validate splits sum to total
      const expense = await storage.createExpense({
        ...input,
        payerId: req.user.claims.sub,
        amount: String(input.amount) // Ensure string for decimal/numeric
      }, input.splits?.map(s => ({...s, expenseId: 0}))); // expenseId fixed in storage
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Assets
  app.get(api.assets.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const assets = await storage.getAssets(userId);
    res.json(assets);
  });

  app.post(api.assets.create.path, isAuthenticated, async (req: any, res) => {
    const input = api.assets.create.input.parse(req.body);
    const asset = await storage.createAsset({ ...input, userId: req.user.claims.sub });
    res.status(201).json(asset);
  });

  // User Profile
  app.get(api.userProfile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.put(api.userProfile.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.userProfile.update.input.parse(req.body);
    // Ensure userId is set
    const profile = await storage.upsertUserProfile({ ...input, userId });
    res.json(profile);
  });

  // Receipt Processing (Stub for now, or use OpenAI)
  app.post(api.receipts.process.path, isAuthenticated, async (req, res) => {
    // Call OpenAI here using the blueprint's client if needed
    // For now, mock response
    res.json({
      total: 123.45,
      date: new Date().toISOString(),
      items: [{ description: "Mock Item", amount: 123.45 }]
    });
  });

  return httpServer;
}
