import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { MarketIntelligence } from "@/components/dashboard/MarketIntelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Flame, 
  Percent, 
  Lightbulb, 
  DollarSign,
  RefreshCw,
  Download,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DashboardData {
  metrics: {
    hotLeads: number;
    totalLeads: number;
    conversionRate: string;
    pipeline: string;
    opportunities: number;
  };
  recentLeads: any[];
  recentInsights: any[];
  chartData: {
    leads: Array<{ month: string; leads: number }>;
    score: Array<{ label: string; value: number; color: string }>;
  };
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  const generateLeadsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/leads/generate", {
        targetIndustry: "Technology",
        companySize: "Medium"
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New leads have been generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/insights/generate", {
        targetMarkets: ["Technology", "Healthcare", "Finance"]
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New market insight generated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate market insight. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContactLead = async (leadId: string) => {
    try {
      const response = await apiRequest("GET", `/api/leads/${leadId}/outreach`);
      const suggestion = await response.json();
      
      toast({
        title: "Outreach Suggestion Ready",
        description: `Subject: ${suggestion.subject}`,
      });
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate outreach suggestion.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lead Intelligence Dashboard</h1>
              <p className="text-muted-foreground">AI-powered insights for your business growth</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] })}
                data-testid="button-refresh-data"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Data
              </Button>
              <Button variant="outline" data-testid="button-export-data">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {isDashboardLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Hot Leads"
                value={dashboardData?.metrics.hotLeads || 0}
                change="+23% this week"
                icon={<Flame className="h-5 w-5" />}
                className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                trend="up"
              />
              <MetricCard
                title="Conversion Rate"
                value={dashboardData?.metrics.conversionRate || "0%"}
                change="+8.1% vs industry"
                icon={<Percent className="h-5 w-5" />}
                className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                trend="up"
              />
              <MetricCard
                title="Market Opportunities"
                value={dashboardData?.metrics.opportunities || 0}
                change="+15 new today"
                icon={<Lightbulb className="h-5 w-5" />}
                className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
                trend="up"
              />
              <MetricCard
                title="Revenue Pipeline"
                value={dashboardData?.metrics.pipeline || "$0"}
                change="+47% projected"
                icon={<DollarSign className="h-5 w-5" />}
                className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800"
                trend="up"
              />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <LeadsChart data={dashboardData?.chartData.leads || []} />
              <MarketIntelligence 
                insights={dashboardData?.recentInsights || []}
                onGenerateInsight={() => generateInsightMutation.mutate()}
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={() => generateLeadsMutation.mutate()}
                      disabled={generateLeadsMutation.isPending}
                      data-testid="button-generate-leads"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {generateLeadsMutation.isPending ? "Generating..." : "Generate New Leads"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => generateInsightMutation.mutate()}
                      disabled={generateInsightMutation.isPending}
                      data-testid="button-generate-insights"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {generateInsightMutation.isPending ? "Generating..." : "Generate Market Insight"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lead Management Table */}
            <LeadsTable 
              leads={dashboardData?.recentLeads || []}
              onContactLead={handleContactLead}
            />
          </>
        )}
      </div>
    </div>
  );
}
