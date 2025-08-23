import {
  users,
  companies,
  leads,
  marketInsights,
  campaigns,
  analytics,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
