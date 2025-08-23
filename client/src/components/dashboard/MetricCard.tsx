import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  className,
  trend = "neutral" 
}: MetricCardProps) {
  return (
    <Card className={cn("", className)} data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            {change && (
              <p className={cn(
                "text-sm",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className="text-2xl text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
