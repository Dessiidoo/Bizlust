import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateLeadsForUser, getOutreachSuggestion } from "./services/leadService";
import { generateMarketInsight } from "./ai/openai";
import { insertLeadSchema, insertCompanySchema } from "@shared/schema";
import { registerSubscriptionRoutes } from "./routes/subscriptions";
import { requireSubscription, checkUsageLimit, attachSubscriptionInfo } from "./middleware/subscription";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lead routes
  app.get("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getLeadsByUser(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadData = insertLeadSchema.parse({ ...req.body, userId });
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const lead = await storage.updateLead(id, updates);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteLead(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Lead generation route (Premium feature)
  app.post("/api/leads/generate", isAuthenticated, attachSubscriptionInfo, checkUsageLimit('leads'), checkUsageLimit('aiCredits'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetIndustry, companySize } = req.body;
      
      const results = await generateLeadsForUser(userId, targetIndustry || "Technology", companySize || "Medium");
      res.json(results);
    } catch (error) {
      console.error("Error generating leads:", error);
      res.status(500).json({ message: "Failed to generate leads" });
    }
  });

  // Outreach suggestion route
  app.get("/api/leads/:id/outreach", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const suggestion = await getOutreachSuggestion(id, userId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error generating outreach suggestion:", error);
      res.status(500).json({ message: "Failed to generate outreach suggestion" });
    }
  });

  // Company routes
  app.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Market insights routes
  app.get("/api/insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getMarketInsightsByUser(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post("/api/insights/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { targetMarkets } = req.body;
      
      const insight = await generateMarketInsight(
        user?.industry || "Technology",
        user?.companySize || "Medium",
        targetMarkets || ["Technology"]
      );
      
      const savedInsight = await storage.createMarketInsight({
        userId,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        data: { recommendations: insight.recommendations, dataPoints: insight.dataPoints }
      });
      
      res.json(savedInsight);
    } catch (error) {
      console.error("Error generating insight:", error);
      res.status(500).json({ message: "Failed to generate insight" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const analytics = await storage.getAnalyticsByUser(
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Dashboard summary route
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [leads, insights, analytics] = await Promise.all([
        storage.getLeadsByUser(userId),
        storage.getMarketInsightsByUser(userId),
        storage.getAnalyticsByUser(userId)
      ]);

      const hotLeads = leads.filter(lead => lead.score >= 80);
      const conversionRate = leads.length > 0 ? (hotLeads.length / leads.length * 100).toFixed(1) : "0";
      const totalPipeline = leads.reduce((sum, lead) => sum + (lead.score * 1000), 0);

      const summary = {
        metrics: {
          hotLeads: hotLeads.length,
          totalLeads: leads.length,
          conversionRate: `${conversionRate}%`,
          pipeline: `$${Math.round(totalPipeline).toLocaleString()}`,
          opportunities: insights.filter(i => i.priority === 'high').length
        },
        recentLeads: leads.slice(0, 5),
        recentInsights: insights.slice(0, 3),
        chartData: {
          leads: generateLeadTrendData(leads),
          score: generateScoreDistribution(leads)
        }
      };

      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Admin route - to set yourself as admin (only use once!)
  app.post("/api/admin/make-admin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Update user to admin tier with no expiration
      const adminUser = await storage.updateUserSubscription(userId, {
        subscriptionTier: "admin",
        subscriptionStatus: "active",
        subscriptionExpiresAt: null // No expiration for admin
      });
      
      res.json({ 
        message: "Successfully upgraded to admin", 
        user: adminUser,
        features: ["Unlimited leads", "Unlimited AI credits", "All features unlocked"]
      });
    } catch (error) {
      console.error("Error setting admin:", error);
      res.status(500).json({ message: "Failed to set admin status" });
    }
  });

  // Register subscription routes
  registerSubscriptionRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}

function generateLeadTrendData(leads: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = months.map((month, index) => {
    const monthLeads = Math.floor(Math.random() * 50) + 100 + (index * 20);
    return { month, leads: monthLeads };
  });
  return data;
}

function generateScoreDistribution(leads: any[]) {
  const highQuality = leads.filter(l => l.score >= 80).length;
  const mediumQuality = leads.filter(l => l.score >= 60 && l.score < 80).length;
  const lowQuality = leads.filter(l => l.score < 60).length;
  
  return [
    { label: 'High Quality', value: highQuality, color: '#10B981' },
    { label: 'Medium Quality', value: mediumQuality, color: '#F59E0B' },
    { label: 'Low Quality', value: lowQuality, color: '#EF4444' }
  ];
}
