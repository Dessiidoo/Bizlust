import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface LeadsChartProps {
  data: Array<{ month: string; leads: number }>;
}

export function LeadsChart({ data }: LeadsChartProps) {
  return (
    <Card data-testid="leads-chart">
      <CardHeader>
        <CardTitle>Lead Generation Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              className="text-sm text-muted-foreground"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-sm text-muted-foreground"
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
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
