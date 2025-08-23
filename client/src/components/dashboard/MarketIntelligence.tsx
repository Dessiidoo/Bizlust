import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Lightbulb, Target, BarChart } from "lucide-react";

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  priority: string;
  data?: {
    recommendations?: string[];
    dataPoints?: Array<{
      metric: string;
      value: string;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  createdAt: string;
}

interface MarketIntelligenceProps {
  insights: MarketInsight[];
  onGenerateInsight?: () => void;
}

export function MarketIntelligence({ insights, onGenerateInsight }: MarketIntelligenceProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card data-testid="market-intelligence">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Market Intelligence
          </CardTitle>
          <Button onClick={onGenerateInsight} data-testid="button-generate-insight">
            <BarChart className="h-4 w-4 mr-2" />
            Generate Insight
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No market insights available</p>
            <p className="text-sm text-muted-foreground">Generate AI-powered insights to discover market opportunities</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="border border-border rounded-lg p-4" data-testid={`insight-${insight.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority} priority
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(insight.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
              
              {insight.data?.dataPoints && insight.data.dataPoints.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Key Metrics</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {insight.data.dataPoints.map((point, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{point.metric}</span>
                          {getTrendIcon(point.trend)}
                        </div>
                        <span className="text-lg font-bold">{point.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {insight.data?.recommendations && insight.data.recommendations.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Recommendations</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {insight.data.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
