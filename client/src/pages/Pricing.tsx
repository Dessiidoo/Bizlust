import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Star, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useLocation } from "wouter";

export default function Pricing() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription/plans"],
  });

  // Fetch current user subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscription/current"],
    enabled: isAuthenticated,
  });

  // Fetch usage info
  const { data: usageData } = useQuery({
    queryKey: ["/api/subscription/usage"],
    enabled: isAuthenticated,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("POST", "/api/subscription/create", { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/usage"] });
      toast({
        title: "Subscription Created!",
        description: "Welcome to your new plan. Start generating leads now!",
      });
      setLocation("/leads");
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const plans = plansData?.plans || [];
  const currentTier = currentSubscription?.tier || "free";
  const usage = usageData?.usage || { leads: 0, aiCredits: 0 };
  const limits = usageData?.limits || { maxLeads: 10, aiCredits: 5 };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case "free": return <Users className="h-8 w-8 text-gray-600" />;
      case "basic": return <Zap className="h-8 w-8 text-blue-600" />;
      case "premium": return <Crown className="h-8 w-8 text-purple-600" />;
      default: return <Star className="h-8 w-8" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case "free": return "border-gray-200";
      case "basic": return "border-blue-200 shadow-lg";
      case "premium": return "border-purple-200 shadow-xl";
      default: return "border-gray-200";
    }
  };

  const isCurrentPlan = (tier: string) => currentTier === tier;
  const canUpgrade = (tier: string) => {
    const tierPriority = { free: 1, basic: 2, premium: 3 };
    return tierPriority[currentTier as keyof typeof tierPriority] < tierPriority[tier as keyof typeof tierPriority];
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pricing Plans
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Scale your lead generation with AI-powered intelligence. Choose the plan that fits your business needs.
          </p>
        </div>

        {/* Current Usage (if authenticated) */}
        {isAuthenticated && (
          <div className="mb-12">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Current Usage</CardTitle>
                <CardDescription className="text-center">
                  Your {currentTier} plan usage this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Leads Generated</span>
                  <span className="font-medium">{usage.leads} / {limits.maxLeads}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usage.leads / limits.maxLeads) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>AI Credits</span>
                  <span className="font-medium">{usage.aiCredits} / {limits.aiCredits}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usage.aiCredits / limits.aiCredits) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan: any) => {
            const features = JSON.parse(plan.features);
            const isPopular = plan.tier === "basic";
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${getPlanColor(plan.tier)} ${isPopular ? 'transform scale-105' : ''}`}
                data-testid={`card-plan-${plan.tier}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.tier)}
                  </div>
                  <CardTitle className="text-2xl font-bold capitalize">{plan.tier} Plan</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${parseFloat(plan.price).toFixed(0)}
                    </span>
                    {plan.tier !== "free" && (
                      <span className="text-gray-600 dark:text-gray-400">/month</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.tier === "free" && "Perfect for getting started"}
                    {plan.tier === "basic" && "Great for growing businesses"}
                    {plan.tier === "premium" && "For scaling enterprises"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Leads per month:</span>
                      <span className="font-medium">{plan.maxLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Credits:</span>
                      <span className="font-medium">{plan.aiCredits}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  {!isAuthenticated ? (
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => setLocation("/api/login")}
                      data-testid={`button-login-${plan.tier}`}
                    >
                      Get Started
                    </Button>
                  ) : isCurrentPlan(plan.tier) ? (
                    <Button className="w-full" disabled data-testid={`button-current-${plan.tier}`}>
                      Current Plan
                    </Button>
                  ) : plan.tier === "free" ? (
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      disabled
                      data-testid={`button-downgrade-${plan.tier}`}
                    >
                      Downgrade Available
                    </Button>
                  ) : canUpgrade(plan.tier) ? (
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => createSubscriptionMutation.mutate(plan.id)}
                      disabled={createSubscriptionMutation.isPending}
                      data-testid={`button-upgrade-${plan.tier}`}
                    >
                      {createSubscriptionMutation.isPending ? "Processing..." : "Upgrade Now"}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled data-testid={`button-downgrade-${plan.tier}`}>
                      Contact Sales
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or refunded on a pro-rated basis.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are AI Credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  AI Credits are used for AI-powered features like lead scoring, market insights, and personalized outreach suggestions. Each AI operation consumes one credit.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! Start with our Free plan to explore LeadVault AI. No credit card required. Upgrade when you're ready to scale your lead generation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}