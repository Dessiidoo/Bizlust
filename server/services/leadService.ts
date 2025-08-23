import { storage } from "../storage";
import { scoreLeadWithAI, generateMarketInsight, generateOutreachSuggestion } from "../ai/openai";
import type { InsertLead, InsertCompany } from "@shared/schema";

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

  // This would typically integrate with external APIs like LinkedIn Sales Navigator, ZoomInfo, etc.
  // For now, we'll generate AI-powered leads based on user profile
  const mockLeadData = await generateMockLeadData(targetIndustry, companySize);
  
  const results: LeadGenerationResult = {
    leads: [],
    insights: []
  };

  // Process each potential lead with AI scoring
  for (const mockLead of mockLeadData) {
    // Create company first
    const company = await storage.createCompany({
      name: mockLead.companyName,
      industry: mockLead.industry,
      size: mockLead.companySize,
      website: mockLead.website,
      location: mockLead.location,
      description: mockLead.description
    });

    // Score the lead with AI
    const aiResult = await scoreLeadWithAI(
      company.name,
      company.industry || "",
      mockLead.contactTitle,
      mockLead.marketSignal,
      user.industry || ""
    );

    // Create the lead
    const lead = await storage.createLead({
      userId,
      companyId: company.id,
      contactName: mockLead.contactName,
      contactEmail: mockLead.contactEmail,
      contactTitle: mockLead.contactTitle,
      contactPhone: mockLead.contactPhone,
      score: aiResult.score,
      marketSignal: mockLead.marketSignal,
      source: "ai_generated"
    });

    results.leads.push({
      company,
      lead,
      aiScore: aiResult.score,
      reasoning: aiResult.reasoning
    });
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

// Mock lead data generator - in production this would integrate with real APIs
async function generateMockLeadData(industry: string, companySize: string) {
  const industries = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education"];
  const companySizes = ["Startup", "Small", "Medium", "Large", "Enterprise"];
  const titles = ["CEO", "CTO", "VP of Sales", "Marketing Director", "Operations Manager", "Head of Product"];
  const signals = [
    "Hiring marketing team",
    "New facility opening", 
    "Scaling infrastructure",
    "Digital transformation initiative",
    "Expanding to new markets",
    "Recently raised funding",
    "Leadership changes",
    "New product launch"
  ];

  const mockCompanies = [
    "Acme Corp", "Global Innovations", "FutureSoft", "TechFlow Solutions", "Innovation Labs",
    "NextGen Systems", "Digital Dynamics", "Smart Solutions", "Advanced Analytics", "CloudTech"
  ];

  const names = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Jessica Adams"];
  const locations = ["New York, NY", "San Francisco, CA", "Chicago, IL", "Austin, TX", "Boston, MA"];

  return mockCompanies.slice(0, 5).map((company, index) => ({
    companyName: company,
    industry: industries[Math.floor(Math.random() * industries.length)],
    companySize: companySizes[Math.floor(Math.random() * companySizes.length)],
    website: `https://www.${company.toLowerCase().replace(/\s+/g, '')}.com`,
    location: locations[index % locations.length],
    description: `Leading ${industry.toLowerCase()} company focused on innovation and growth`,
    contactName: names[index % names.length],
    contactEmail: `${names[index % names.length].toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
    contactTitle: titles[Math.floor(Math.random() * titles.length)],
    contactPhone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    marketSignal: signals[Math.floor(Math.random() * signals.length)]
  }));
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
