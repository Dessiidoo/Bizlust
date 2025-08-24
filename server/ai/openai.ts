import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface LeadScoringResult {
  score: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface MarketInsightResult {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  dataPoints: Array<{
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface OutreachSuggestion {
  subject: string;
  message: string;
  channel: 'email' | 'linkedin' | 'phone';
  timing: string;
  followUpSchedule: string[];
}

export async function scoreLeadWithAI(
  companyName: string,
  industry: string,
  contactTitle: string,
  marketSignal: string,
  userIndustry: string
): Promise<LeadScoringResult> {
  try {
    const prompt = `Analyze this lead and provide a comprehensive scoring assessment. Company: ${companyName}, Industry: ${industry}, Contact: ${contactTitle}, Market Signal: ${marketSignal}, User's Industry: ${userIndustry}. 
    
    Consider factors like:
    - Company size and growth potential
    - Decision maker authority level
    - Market signal strength and relevance
    - Industry alignment
    - Timing indicators
    
    Respond with JSON in this format:
    {
      "score": number (0-100),
      "reasoning": "detailed explanation",
      "priority": "high|medium|low",
      "recommendations": ["action1", "action2", "action3"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert sales and lead qualification specialist with deep knowledge of B2B sales processes and lead scoring methodologies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      reasoning: result.reasoning || "Unable to generate reasoning",
      priority: ['high', 'medium', 'low'].includes(result.priority) ? result.priority : 'medium',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  } catch (error) {
    console.error("AI lead scoring error:", error);
    return {
      score: 50,
      reasoning: "Unable to generate AI scoring due to service error",
      priority: 'medium',
      recommendations: ["Manual review recommended", "Verify contact information", "Research company background"]
    };
  }
}

export async function generateMarketInsight(
  userIndustry: string,
  companySize: string,
  targetMarkets: string[]
): Promise<MarketInsightResult> {
  try {
    const prompt = `Generate a market intelligence insight for a ${companySize} company in ${userIndustry} industry targeting these markets: ${targetMarkets.join(', ')}.
    
    Focus on:
    - Current market trends and opportunities
    - Competitive landscape analysis
    - Customer behavior patterns
    - Growth opportunities
    - Risk factors and challenges
    
    Respond with JSON in this format:
    {
      "title": "insight title",
      "description": "detailed analysis",
      "priority": "high|medium|low",
      "recommendations": ["action1", "action2", "action3"],
      "dataPoints": [
        {
          "metric": "metric name",
          "value": "metric value",
          "trend": "up|down|stable"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a market research analyst and business intelligence expert with extensive knowledge of industry trends, competitive analysis, and market dynamics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      title: result.title || "Market Analysis",
      description: result.description || "Market insight analysis unavailable",
      priority: ['high', 'medium', 'low'].includes(result.priority) ? result.priority : 'medium',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      dataPoints: Array.isArray(result.dataPoints) ? result.dataPoints : []
    };
  } catch (error) {
    console.error("AI market insight error:", error);
    return {
      title: "Market Analysis Unavailable",
      description: "Unable to generate market insights due to service error",
      priority: 'medium',
      recommendations: ["Manual market research recommended"],
      dataPoints: []
    };
  }
}

export async function generateOutreachSuggestion(
  companyName: string,
  contactName: string,
  contactTitle: string,
  industry: string,
  marketSignal: string,
  userCompany: string,
  userIndustry: string
): Promise<OutreachSuggestion> {
  try {
    const prompt = `Create a personalized outreach suggestion for ${contactName} (${contactTitle}) at ${companyName} in ${industry}. Market signal: ${marketSignal}. 
    We are ${userCompany} in ${userIndustry}. 
    
    Create compelling outreach that:
    - References their specific market signal
    - Shows clear value proposition
    - Uses professional but engaging tone
    - Includes specific next steps
    
    Respond with JSON in this format:
    {
      "subject": "email subject line",
      "message": "personalized message",
      "channel": "email|linkedin|phone",
      "timing": "best time to reach out",
      "followUpSchedule": ["follow up 1", "follow up 2"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert sales outreach specialist with deep knowledge of B2B communication, personalization strategies, and conversion optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      subject: result.subject || "Partnership Opportunity",
      message: result.message || "Unable to generate personalized message",
      channel: ['email', 'linkedin', 'phone'].includes(result.channel) ? result.channel : 'email',
      timing: result.timing || "Business hours on weekdays",
      followUpSchedule: Array.isArray(result.followUpSchedule) ? result.followUpSchedule : []
    };
  } catch (error) {
    console.error("AI outreach suggestion error:", error);
    return {
      subject: "Partnership Opportunity",
      message: "Unable to generate personalized outreach due to service error. Please create custom message.",
      channel: 'email',
      timing: "Business hours on weekdays",
      followUpSchedule: ["Follow up in 1 week if no response", "Final follow up after 2 weeks"]
    };
  }
}

export async function generateLeadRecommendations(
  userIndustry: string,
  targetCustomerProfile: string,
  currentLeads: Array<{ company: string; industry: string; signal: string }>
): Promise<Array<{ company: string; reasoning: string; score: number }>> {
  try {
    const prompt = `Based on this user profile (Industry: ${userIndustry}, Target Customer: ${targetCustomerProfile}) and their current leads: ${JSON.stringify(currentLeads)}, 
    recommend 5 new potential companies they should target.
    
    Consider:
    - Similar industry patterns from successful leads
    - Market expansion opportunities
    - Competitive positioning
    - Growth stage companies
    
    Respond with JSON in this format:
    {
      "recommendations": [
        {
          "company": "company name",
          "reasoning": "why this company is a good fit",
          "score": number (0-100)
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business development expert specializing in lead generation, market analysis, and customer targeting strategies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return Array.isArray(result.recommendations) ? result.recommendations : [];
  } catch (error) {
    console.error("AI lead recommendations error:", error);
    return [];
  }
}
