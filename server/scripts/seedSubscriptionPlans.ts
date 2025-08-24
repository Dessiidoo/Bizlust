import { storage } from "../storage";

async function seedSubscriptionPlans() {
  try {
    console.log("Seeding subscription plans...");

    // Free plan
    await storage.createSubscriptionPlan({
      name: "Free Plan",
      tier: "free",
      price: "0",
      features: JSON.stringify([
        "10 lead searches per month",
        "5 AI insights per month", 
        "Basic lead scoring",
        "Email support"
      ]),
      maxLeads: 10,
      aiCredits: 5,
      priority: 1,
      isActive: true
    });

    // Basic plan
    await storage.createSubscriptionPlan({
      name: "Basic Plan",
      tier: "basic", 
      price: "29.00",
      features: JSON.stringify([
        "100 lead searches per month",
        "50 AI insights per month",
        "Advanced lead scoring",
        "AI market analysis",
        "Email templates",
        "Export capabilities",
        "Email support"
      ]),
      maxLeads: 100,
      aiCredits: 50,
      priority: 2,
      isActive: true
    });

    // Premium plan
    await storage.createSubscriptionPlan({
      name: "Premium Plan",
      tier: "premium",
      price: "79.00", 
      features: JSON.stringify([
        "1000 lead searches per month",
        "200 AI insights per month",
        "Advanced AI lead scoring",
        "Custom market insights",
        "Personalized outreach campaigns",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations"
      ]),
      maxLeads: 1000,
      aiCredits: 200,
      priority: 3,
      isActive: true
    });

    console.log("Subscription plans seeded successfully!");
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  seedSubscriptionPlans().then(() => process.exit(0));
}

export { seedSubscriptionPlans };