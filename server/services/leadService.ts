import { storage } from "../storage";
import {
  scoreLeadWithAI,
  generateMarketInsight,
  generateOutreachSuggestion,
} from "../ai/openai";
import type { InsertLead, InsertCompany } from "@shared/schema";

interface ExternalLead {
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  description?: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  contactPhone?: string;
  marketSignal?: string;
}

export interface LeadGenerationResult {
  leads: Array<{
    company: InsertCompany;
    lead: InsertLead;
    aiScore: number;
    reasoning: string;
  }>;
  insights: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
}

export async function generateLeadsForUser(userId: string, targetIndustry: string, companySize: string): Promise<LeadGenerationResult> {
  // Get user info for context
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Fetch potential leads from external data source
  let apiLeadData: ExternalLead[] = [];
  try {
    apiLeadData = await fetchLeadsFromDataSource(targetIndustry, companySize);
    console.log(`Fetched ${apiLeadData.length} leads from data source`);
  } catch (err) {
    console.error("Failed to fetch leads from external source", err);
    throw new Error("Lead source unavailable");
  }
  
  const results: LeadGenerationResult = {
    leads: [],
    insights: []
  };

  // Process each potential lead with AI scoring
  for (const apiLead of apiLeadData) {
    try {
      const adapted = await adaptLeadFromApi(apiLead, userId, user.industry || "");
      results.leads.push(adapted);
    } catch (err) {
      console.error("Error processing lead from API", err);
    }
  }

  // Generate market insights
  const marketInsight = await generateMarketInsight(
    user.industry || "Technology",
    user.companySize || "Small",
    [targetIndustry]
  );

  await storage.createMarketInsight({
    userId,
    title: marketInsight.title,
    description: marketInsight.description,
    industry: targetIndustry,
    priority: marketInsight.priority,
    data: { recommendations: marketInsight.recommendations, dataPoints: marketInsight.dataPoints }
  });

  results.insights.push({
    title: marketInsight.title,
    description: marketInsight.description,
    priority: marketInsight.priority
  });

  return results;
}

// Fetch leads from a real data source
async function fetchLeadsFromDataSource(
  industry: string,
  companySize: string,
): Promise<ExternalLead[]> {
  const baseUrl = process.env.LEAD_SOURCE_URL;
  if (!baseUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("LEAD_SOURCE_URL not configured, using stub data");
      return getStubLeads(industry, companySize);
    }
    throw new Error("LEAD_SOURCE_URL not configured");
  }

  const url = `${baseUrl}?industry=${encodeURIComponent(industry)}&size=${encodeURIComponent(companySize)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Lead source responded with ${response.status}`);
    }

    const data = await response.json();
    return (data.leads || []) as ExternalLead[];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Lead source request failed, using stub data", err);
      return getStubLeads(industry, companySize);
    }
    throw err;
  }
}

function getStubLeads(industry: string, companySize: string): ExternalLead[] {
  return [
    {
      companyName: "Example Corp",
      industry,
      companySize,
      website: "https://example.com",
      location: "Remote",
      description: `Sample lead for ${industry}`,
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactTitle: "CTO",
      marketSignal: "Demo interest",
    },
  ];
}

// Adapter: map raw API lead to internal representation and persist
async function adaptLeadFromApi(
  apiLead: ExternalLead,
  userId: string,
  userIndustry: string,
): Promise<{ company: InsertCompany; lead: InsertLead; aiScore: number; reasoning: string }> {
  const company = await storage.createCompany({
    name: apiLead.companyName,
    industry: apiLead.industry,
    size: apiLead.companySize,
    website: apiLead.website,
    location: apiLead.location,
    description: apiLead.description,
  });

  const aiResult = await scoreLeadWithAI(
    company.name,
    company.industry || "",
    apiLead.contactTitle,
    apiLead.marketSignal || "",
    userIndustry,
  );

  const lead = await storage.createLead({
    userId,
    companyId: company.id,
    contactName: apiLead.contactName,
    contactEmail: apiLead.contactEmail,
    contactTitle: apiLead.contactTitle,
    contactPhone: apiLead.contactPhone,
    score: aiResult.score,
    marketSignal: apiLead.marketSignal,
    source: "external_api",
  });

  return { company, lead, aiScore: aiResult.score, reasoning: aiResult.reasoning };
}

export async function getOutreachSuggestion(leadId: string, userId: string) {
  const lead = await storage.getLead(leadId);
  const user = await storage.getUser(userId);
  
  if (!lead || !user) {
    throw new Error("Lead or user not found");
  }

  return await generateOutreachSuggestion(
    lead.company.name,
    lead.contactName,
    lead.contactTitle || "",
    lead.company.industry || "",
    lead.marketSignal || "",
    user.companyName || "Your Company",
    user.industry || ""
  );
}
