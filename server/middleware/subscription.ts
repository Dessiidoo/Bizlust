import type { RequestHandler } from "express";
import { storage } from "../storage";

export interface SubscriptionTier {
  tier: string;
  maxLeads: number;
  aiCredits: number;
  features: string[];
}

// Define subscription tiers
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    tier: "free",
    maxLeads: 10,
    aiCredits: 5,
    features: ["Basic lead search", "Limited AI insights"]
  },
  basic: {
    tier: "basic",
    maxLeads: 100,
    aiCredits: 50,
    features: ["Advanced lead search", "AI lead scoring", "Basic market insights", "Email templates"]
  },
  premium: {
    tier: "premium",
    maxLeads: 1000,
    aiCredits: 200,
    features: ["Unlimited lead search", "Advanced AI insights", "Custom outreach", "Priority support", "Export capabilities"]
  },
  admin: {
    tier: "admin",
    maxLeads: 999999,
    aiCredits: 999999,
    features: ["All features", "Unlimited everything", "Admin access", "No restrictions"]
  }
};

// Check if user has required subscription tier
export const requireSubscription = (requiredTier?: string): RequestHandler => {
  return async (req: any, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userTier = user.subscriptionTier || "free";
      const tierInfo = SUBSCRIPTION_TIERS[userTier];

      if (!tierInfo) {
        return res.status(403).json({ message: "Invalid subscription tier" });
      }

      // Admin users bypass all restrictions
      if (userTier === "admin") {
        req.user.subscriptionTier = tierInfo;
        return next();
      }

      // Check if subscription is active (for paid tiers)
      if (userTier !== "free") {
        const now = new Date();
        const expiresAt = user.subscriptionExpiresAt;
        
        if (!expiresAt || now > expiresAt) {
          // Downgrade to free tier if subscription expired
          await storage.updateUserSubscription(userId, {
            subscriptionTier: "free",
            subscriptionStatus: "expired"
          });
          
          // Update tier info for this request
          req.user.subscriptionTier = SUBSCRIPTION_TIERS.free;
        } else {
          req.user.subscriptionTier = tierInfo;
        }
      } else {
        req.user.subscriptionTier = tierInfo;
      }

      // Check if user meets required tier
      if (requiredTier) {
        const requiredTierInfo = SUBSCRIPTION_TIERS[requiredTier];
        const currentTierPriority = getTierPriority(userTier);
        const requiredTierPriority = getTierPriority(requiredTier);

        if (currentTierPriority < requiredTierPriority) {
          return res.status(403).json({ 
            message: `${requiredTierInfo.tier} subscription required`,
            requiredTier: requiredTier,
            currentTier: userTier,
            upgradeRequired: true
          });
        }
      }

      next();
    } catch (error) {
      console.error("Subscription check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

// Check usage limits
export const checkUsageLimit = (resource: 'leads' | 'aiCredits'): RequestHandler => {
  return async (req: any, res, next) => {
    try {
      const userId = req.user.claims.sub;
      const tierInfo = req.user.subscriptionTier as SubscriptionTier;

      if (!tierInfo) {
        return res.status(403).json({ message: "Subscription tier not found" });
      }

      // Admin users bypass all limits
      if (tierInfo.tier === "admin") {
        return next();
      }

      if (resource === 'leads') {
        const userLeads = await storage.getLeadsByUser(userId);
        if (userLeads.length >= tierInfo.maxLeads) {
          return res.status(403).json({
            message: `Lead limit reached (${tierInfo.maxLeads})`,
            limit: tierInfo.maxLeads,
            current: userLeads.length,
            upgradeRequired: true
          });
        }
      }

      if (resource === 'aiCredits') {
        // Get AI credits used this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const analytics = await storage.getAnalyticsByUser(userId, startOfMonth, now);
        
        const aiCreditsUsed = analytics
          .filter(a => a.metric === 'ai_credits_used')
          .reduce((sum, a) => sum + parseFloat(a.value), 0);

        if (aiCreditsUsed >= tierInfo.aiCredits) {
          return res.status(403).json({
            message: `AI credits limit reached (${tierInfo.aiCredits})`,
            limit: tierInfo.aiCredits,
            used: aiCreditsUsed,
            upgradeRequired: true
          });
        }
      }

      next();
    } catch (error) {
      console.error("Usage limit check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

// Helper function to get tier priority
function getTierPriority(tier: string): number {
  switch (tier) {
    case 'free': return 1;
    case 'basic': return 2;
    case 'premium': return 3;
    case 'admin': return 999; // Admin always has highest priority
    default: return 0;
  }
}

// Middleware to add subscription info to user object
export const attachSubscriptionInfo: RequestHandler = async (req: any, res, next) => {
  if (req.isAuthenticated() && req.user?.claims?.sub) {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user) {
        const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier || "free"];
        req.user.subscriptionInfo = {
          tier: user.subscriptionTier || "free",
          status: user.subscriptionStatus || "inactive",
          expiresAt: user.subscriptionExpiresAt,
          features: tierInfo.features,
          limits: {
            maxLeads: tierInfo.maxLeads,
            aiCredits: tierInfo.aiCredits
          }
        };
      }
    } catch (error) {
      console.error("Error attaching subscription info:", error);
    }
  }
  next();
};