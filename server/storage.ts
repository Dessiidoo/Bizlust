import {
  users,
  companies,
  leads,
  marketInsights,
  campaigns,
  analytics,
  subscriptionPlans,
  subscriptions,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Lead,
  type InsertLead,
  type MarketInsight,
  type InsertMarketInsight,
  type Campaign,
  type InsertCampaign,
  type Analytics,
  type InsertAnalytics,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser & { id: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: Partial<Pick<User, 'companyName' | 'industry' | 'companySize'>>): Promise<User | undefined>;
  updateUserSubscription(userId: string, subscriptionData: Partial<Pick<User, 'squareCustomerId' | 'subscriptionTier' | 'subscriptionStatus' | 'subscriptionId' | 'subscriptionExpiresAt'>>): Promise<User | undefined>;
  
  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Lead operations
  getLeadsByUser(userId: string): Promise<(Lead & { company: Company })[]>;
  getLead(id: string): Promise<(Lead & { company: Company }) | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  
  // Market insights
  getMarketInsightsByUser(userId: string): Promise<MarketInsight[]>;
  createMarketInsight(insight: InsertMarketInsight): Promise<MarketInsight>;
  
  // Campaigns
  getCampaignsByUser(userId: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  
  // Analytics
  getAnalyticsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Subscription plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  
  // Subscriptions
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // Admin methods
  getUserCount(): Promise<number>;
  getLeadCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  getRecentActivity(): Promise<Array<{type: string, description: string, timestamp: string}>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser & { id: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser & { id: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profile: Partial<Pick<User, 'companyName' | 'industry' | 'companySize'>>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(companyData).returning();
    return company;
  }

  // Lead operations
  async getLeadsByUser(userId: string): Promise<(Lead & { company: Company })[]> {
    return await db
      .select({
        id: leads.id,
        userId: leads.userId,
        companyId: leads.companyId,
        contactName: leads.contactName,
        contactEmail: leads.contactEmail,
        contactTitle: leads.contactTitle,
        contactPhone: leads.contactPhone,
        score: leads.score,
        status: leads.status,
        marketSignal: leads.marketSignal,
        notes: leads.notes,
        source: leads.source,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        company: companies,
      })
      .from(leads)
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.score), desc(leads.createdAt));
  }

  async getLead(id: string): Promise<(Lead & { company: Company }) | undefined> {
    const [lead] = await db
      .select({
        id: leads.id,
        userId: leads.userId,
        companyId: leads.companyId,
        contactName: leads.contactName,
        contactEmail: leads.contactEmail,
        contactTitle: leads.contactTitle,
        contactPhone: leads.contactPhone,
        score: leads.score,
        status: leads.status,
        marketSignal: leads.marketSignal,
        notes: leads.notes,
        source: leads.source,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        company: companies,
      })
      .from(leads)
      .innerJoin(companies, eq(leads.companyId, companies.id))
      .where(eq(leads.id, id));
    return lead;
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(leadData).returning();
    return lead;
  }

  async updateLead(id: string, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Market insights
  async getMarketInsightsByUser(userId: string): Promise<MarketInsight[]> {
    return await db
      .select()
      .from(marketInsights)
      .where(eq(marketInsights.userId, userId))
      .orderBy(desc(marketInsights.createdAt));
  }

  async createMarketInsight(insightData: InsertMarketInsight): Promise<MarketInsight> {
    const [insight] = await db.insert(marketInsights).values(insightData).returning();
    return insight;
  }

  // Campaigns
  async getCampaignsByUser(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  // Analytics
  async getAnalyticsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(analytics)
        .where(
          and(
            eq(analytics.userId, userId),
            gte(analytics.date, startDate),
            lte(analytics.date, endDate)
          )
        )
        .orderBy(desc(analytics.date));
    }
    
    return await db
      .select()
      .from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db.insert(analytics).values(analyticsData).returning();
    return analytic;
  }

  // Subscription methods
  async updateUserSubscription(userId: string, subscriptionData: Partial<Pick<User, 'squareCustomerId' | 'subscriptionTier' | 'subscriptionStatus' | 'subscriptionId' | 'subscriptionExpiresAt'>>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.priority);
  }

  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values(planData).returning();
    return plan;
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async updateSubscription(id: string, subscriptionData: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // Admin methods
  async getUserCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  async getLeadCount(): Promise<number> {
    const result = await db.select().from(leads);
    return result.length;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getRecentActivity(): Promise<Array<{type: string, description: string, timestamp: string}>> {
    try {
      // Get recent users, leads, and market insights for activity feed
      const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(3);
      const recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(3);
      const recentInsights = await db.select().from(marketInsights).orderBy(desc(marketInsights.createdAt)).limit(3);

      const activities = [
        ...recentUsers.map(user => ({
          type: 'User Registration',
          description: `New user ${user.firstName} ${user.lastName} joined`,
          timestamp: user.createdAt.toISOString()
        })),
        ...recentLeads.map(lead => ({
          type: 'Lead Created',
          description: `New lead: ${lead.contactName} at ${lead.contactRole}`,
          timestamp: lead.createdAt.toISOString()
        })),
        ...recentInsights.map(insight => ({
          type: 'Market Insight',
          description: `Market insight generated: ${insight.title}`,
          timestamp: insight.createdAt.toISOString()
        }))
      ];

      // Sort by timestamp and limit to 10 most recent
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
