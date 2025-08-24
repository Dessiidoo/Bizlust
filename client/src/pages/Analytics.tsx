import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  Filter
} from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: leads, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/insights"],
    enabled: isAuthenticated,
  });

  // Generate analytics data from leads
  const generateAnalytics = () => {
    if (!leads || (leads as any[]).length === 0) return null;

    const totalLeads = (leads as any[]).length;
    const highScoreLeads = (leads as any[]).filter((l: any) => l.score >= 80).length;
    const conversionRate = ((highScoreLeads / totalLeads) * 100).toFixed(1);
    const avgScore = ((leads as any[]).reduce((sum: number, l: any) => sum + l.score, 0) / totalLeads).toFixed(1);

    // Industry distribution
    const industryCount: { [key: string]: number } = {};
    (leads as any[]).forEach((lead: any) => {
      const industry = lead.company.industry || "Unknown";
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    const industryData = Object.entries(industryCount).map(([industry, count]) => ({
      industry,
      count,
      percentage: ((count / totalLeads) * 100).toFixed(1)
    }));

    // Score distribution
    const scoreRanges = {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "0-59": 0
    };

    (leads as any[]).forEach((lead: any) => {
      const score = lead.score;
      if (score >= 90) scoreRanges["90-100"]++;
      else if (score >= 80) scoreRanges["80-89"]++;
      else if (score >= 70) scoreRanges["70-79"]++;
      else if (score >= 60) scoreRanges["60-69"]++;
      else scoreRanges["0-59"]++;
    });

    const scoreData = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
      fill: count > 0 ? (
        range === "90-100" || range === "80-89" ? "#10B981" :
        range === "70-79" ? "#F59E0B" : "#EF4444"
      ) : "#E5E7EB"
    }));

    // Monthly trends (mock data for demonstration)
    const monthlyData = [
      { month: "Jan", leads: Math.floor(totalLeads * 0.8), qualified: Math.floor(highScoreLeads * 0.8) },
      { month: "Feb", leads: Math.floor(totalLeads * 0.9), qualified: Math.floor(highScoreLeads * 0.9) },
      { month: "Mar", leads: totalLeads, qualified: highScoreLeads },
    ];

    return {
      totalLeads,
      highScoreLeads,
      conversionRate: `${conversionRate}%`,
      avgScore,
      industryData,
      scoreData,
      monthlyData,
      pipeline: `$${Math.round(totalLeads * parseFloat(avgScore) * 100).toLocaleString()}`
    };
  };

  const analytics = generateAnalytics();

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
    <div className="min-h-screen bg-background" data-testid="analytics-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
              <p className="text-muted-foreground">Performance metrics and business intelligence</p>
            </div>
            <div className="flex items-center space-x-3">
              <Card className="px-4 py-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 days
                </div>
              </Card>
            </div>
          </div>
        </div>

        {isLeadsLoading ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Leads"
                value={analytics.totalLeads}
                change={"+12% from last month"}
                icon={<Users className="h-5 w-5" />}
                trend="up"
              />
              <MetricCard
                title="High Score Leads"
                value={analytics.highScoreLeads}
                change={analytics.conversionRate + " conversion"}
                icon={<Target className="h-5 w-5" />}
                className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                trend="up"
              />
              <MetricCard
                title="Average Score"
                value={analytics.avgScore}
                change="+5.2 points"
                icon={<TrendingUp className="h-5 w-5" />}
                className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                trend="up"
              />
              <MetricCard
                title="Pipeline Value"
                value={analytics.pipeline}
                change="+28% growth"
                icon={<DollarSign className="h-5 w-5" />}
                className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800"
                trend="up"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Generation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        className="text-sm fill-muted-foreground"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        className="text-sm fill-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Total Leads"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="qualified" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Qualified Leads"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.scoreData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="range" 
                        axisLine={false}
                        tickLine={false}
                        className="text-sm fill-muted-foreground"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        className="text-sm fill-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Industry Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.industryData.map((item, index) => (
                    <div 
                      key={item.industry}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`industry-${item.industry.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div>
                        <p className="font-medium">{item.industry}</p>
                        <p className="text-sm text-muted-foreground">{item.count} leads</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.percentage}%</p>
                        <div className="w-16 bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground">
                Generate some leads to see your analytics and insights
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
