import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  companyName: varchar("company_name"),
  industry: varchar("industry"),
  companySize: varchar("company_size"),
  squareCustomerId: varchar("square_customer_id"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  subscriptionStatus: varchar("subscription_status").default("inactive"),
  subscriptionId: varchar("subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  size: varchar("size"),
  website: varchar("website"),
  description: text("description"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email"),
  contactTitle: varchar("contact_title"),
  contactPhone: varchar("contact_phone"),
  score: integer("score").notNull().default(0),
  status: varchar("status").notNull().default("new"),
  marketSignal: text("market_signal"),
  notes: text("notes"),
  source: varchar("source").notNull().default("ai_generated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketInsights = pgTable("market_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  industry: varchar("industry"),
  priority: varchar("priority").notNull().default("medium"),
  aiGenerated: boolean("ai_generated").default(true),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  targetAudience: text("target_audience"),
  aiSuggestions: jsonb("ai_suggestions"),
  status: varchar("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  metric: varchar("metric").notNull(),
  value: decimal("value").notNull(),
  date: timestamp("date").notNull(),
  metadata: jsonb("metadata"),
});

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  tier: varchar("tier").notNull(), // free, basic, premium
  price: decimal("price").notNull().default("0"),
  features: jsonb("features").notNull(),
  maxLeads: integer("max_leads").default(0),
  aiCredits: integer("ai_credits").default(0),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscription history
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  squareSubscriptionId: varchar("square_subscription_id"),
  status: varchar("status").notNull().default("pending"), // pending, active, cancelled, expired
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  marketInsights: many(marketInsights),
  campaigns: many(campaigns),
  analytics: many(analytics),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [leads.companyId],
    references: [companies.id],
  }),
}));

export const marketInsightsRelations = relations(marketInsights, ({ one }) => ({
  user: one(users, {
    fields: [marketInsights.userId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketInsightSchema = createInsertSchema(marketInsights).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type MarketInsight = typeof marketInsights.$inferSelect;
export type InsertMarketInsight = z.infer<typeof insertMarketInsightSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
