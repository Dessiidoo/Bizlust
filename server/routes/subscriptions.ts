import type { Express } from "express";
import { squareService } from "../services/squareService";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { requireSubscription, checkUsageLimit, attachSubscriptionInfo } from "../middleware/subscription";

export function registerSubscriptionRoutes(app: Express) {
  // Get subscription plans
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json({ plans });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get user's current subscription info
  app.get("/api/subscription/current", isAuthenticated, attachSubscriptionInfo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const subscription = await storage.getUserSubscription(userId);

      res.json({
        tier: user?.subscriptionTier || "free",
        status: user?.subscriptionStatus || "inactive",
        expiresAt: user?.subscriptionExpiresAt,
        subscription: subscription,
        subscriptionInfo: req.user.subscriptionInfo
      });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription info" });
    }
  });

  // Create Square customer and subscription
  app.post("/api/subscription/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId, paymentToken } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      let squareCustomerId = user.squareCustomerId;

      // Create Square customer if not exists
      if (!squareCustomerId) {
        const squareCustomer = await squareService.createCustomer({
          givenName: user.firstName || undefined,
          familyName: user.lastName || undefined,
          emailAddress: user.email || undefined,
          companyName: user.companyName || undefined,
        });
        squareCustomerId = squareCustomer.id;

        // Update user with Square customer ID
        await storage.updateUserSubscription(userId, {
          squareCustomerId: squareCustomerId
        });
      }

      // For now, we'll simulate subscription creation
      // In a real implementation, you'd create the subscription with Square
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month from now

      // Create subscription record
      const subscription = await storage.createSubscription({
        userId: userId,
        planId: planId,
        status: "active",
        startDate: new Date(),
        endDate: subscriptionEndDate,
      });

      // Update user subscription info
      await storage.updateUserSubscription(userId, {
        subscriptionTier: plan.tier,
        subscriptionStatus: "active",
        subscriptionId: subscription.id,
        subscriptionExpiresAt: subscriptionEndDate,
      });

      res.json({
        success: true,
        subscription: subscription,
        message: "Subscription created successfully"
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.subscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Update subscription status
      await storage.updateSubscription(user.subscriptionId, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      // Update user subscription info
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: "cancelled",
      });

      res.json({
        success: true,
        message: "Subscription cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Subscription usage info
  app.get("/api/subscription/usage", isAuthenticated, attachSubscriptionInfo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptionInfo = req.user.subscriptionInfo;

      // Get current usage
      const leads = await storage.getLeadsByUser(userId);
      
      // Get AI credits used this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const analytics = await storage.getAnalyticsByUser(userId, startOfMonth, now);
      
      const aiCreditsUsed = analytics
        .filter(a => a.metric === 'ai_credits_used')
        .reduce((sum, a) => sum + parseFloat(a.value), 0);

      res.json({
        tier: subscriptionInfo?.tier || "free",
        limits: subscriptionInfo?.limits || { maxLeads: 10, aiCredits: 5 },
        usage: {
          leads: leads.length,
          aiCredits: aiCreditsUsed
        },
        features: subscriptionInfo?.features || []
      });
    } catch (error) {
      console.error("Error fetching usage info:", error);
      res.status(500).json({ message: "Failed to fetch usage info" });
    }
  });
}