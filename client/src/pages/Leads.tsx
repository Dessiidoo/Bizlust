import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/context/AuthProvider";
import { Navigation } from "@/components/layout/Navigation";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Filter, 
  Download,
  Users,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { OutreachModal } from "@/components/outreach/OutreachModal";
import { apiRequest } from "@/lib/queryClient";

export default function Leads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: leads, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const generateLeadsMutation = useMutation({
    mutationFn: async (params: { targetIndustry: string; companySize: string }) => {
      return await apiRequest("POST", "/api/leads/generate", params);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New leads have been generated successfully!",
      });
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
          window.location.href = "/api/login";
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

  const handleGenerateOutreach = (lead: any) => {
    setSelectedLead(lead);
    setOutreachModalOpen(true);
  };

  const handleContactLead = async (leadId: string) => {
    try {
      const response = await apiRequest("GET", `/api/leads/${leadId}/outreach`);
      const suggestion = await response.json();
      
      // In a real app, this would open a modal or navigate to an outreach page
      toast({
        title: "Outreach Suggestion Generated",
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
          window.location.href = "/api/login";
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

  // Filter leads based on status and score
  const filteredLeads = (leads as any[])?.filter((lead: any) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (scoreFilter === "high" && lead.score < 80) return false;
    if (scoreFilter === "medium" && (lead.score < 60 || lead.score >= 80)) return false;
    if (scoreFilter === "low" && lead.score >= 60) return false;
    return true;
  }) || [];

  const stats = {
    total: (leads as any[])?.length || 0,
    high: (leads as any[])?.filter((l: any) => l.score >= 80).length || 0,
    medium: (leads as any[])?.filter((l: any) => l.score >= 60 && l.score < 80).length || 0,
    low: (leads as any[])?.filter((l: any) => l.score < 60).length || 0,
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
    <div className="min-h-screen bg-background" data-testid="leads-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
              <p className="text-muted-foreground">Manage and track your high-quality prospects</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => generateLeadsMutation.mutate({ 
                  targetIndustry: "Technology", 
                  companySize: "Medium" 
                })}
                disabled={generateLeadsMutation.isPending}
                data-testid="button-generate-leads"
              >
                <Zap className="h-4 w-4 mr-2" />
                {generateLeadsMutation.isPending ? "Generating..." : "Generate Leads"}
              </Button>
              <Button variant="outline" data-testid="button-export-leads">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Score</p>
                  <p className="text-3xl font-bold text-green-600">{stats.high}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medium Score</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Score</p>
                  <p className="text-3xl font-bold text-red-600">{stats.low}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Score:</label>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-32" data-testid="select-score-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High (80+)</SelectItem>
                    <SelectItem value="medium">Medium (60-79)</SelectItem>
                    <SelectItem value="low">Low (0-59)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {filteredLeads.length} of {stats.total} leads
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        {isLeadsLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <LeadsTable 
            leads={filteredLeads} 
            onContactLead={handleContactLead}
            onGenerateOutreach={handleGenerateOutreach}
          />
        )}

        {/* Empty State */}
        {!isLeadsLoading && filteredLeads.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-6">
                {(leads as any[])?.length === 0 
                  ? "Generate your first leads to get started" 
                  : "No leads match your current filters"
                }
              </p>
              {(leads as any[])?.length === 0 && (
                <Button 
                  onClick={() => generateLeadsMutation.mutate({ 
                    targetIndustry: "Technology", 
                    companySize: "Medium" 
                  })}
                  disabled={generateLeadsMutation.isPending}
                  data-testid="button-generate-first-leads"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Your First Leads
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Outreach Modal */}
        <OutreachModal
          open={outreachModalOpen}
          onOpenChange={setOutreachModalOpen}
          lead={selectedLead}
        />
      </div>
    </div>
  );
}
