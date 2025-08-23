import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Filter, Phone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  contactName: string;
  contactEmail?: string;
  contactTitle?: string;
  contactPhone?: string;
  score: number;
  marketSignal?: string;
  company: {
    id: string;
    name: string;
    industry?: string;
  };
}

interface LeadsTableProps {
  leads: Lead[];
  onContactLead?: (leadId: string) => void;
}

export function LeadsTable({ leads, onContactLead }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = leads.filter(lead =>
    lead.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card data-testid="leads-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>High-Priority Leads</CardTitle>
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              data-testid="input-search-leads"
            />
            <Button variant="outline" size="sm" data-testid="button-filter-leads">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Company</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Score</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Market Signal</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {searchTerm ? "No leads match your search criteria" : "No leads available"}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    data-testid={`row-lead-${lead.id}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                            {getInitials(lead.company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{lead.company.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.company.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">{lead.contactName}</p>
                        <p className="text-sm text-muted-foreground">{lead.contactTitle}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={cn("px-2 py-1 text-xs font-medium", getScoreBadgeColor(lead.score))}>
                        {lead.score}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">{lead.marketSignal}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => onContactLead?.(lead.id)}
                          data-testid={`button-contact-${lead.id}`}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        {lead.contactEmail && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${lead.contactEmail}`}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {lead.contactPhone && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`tel:${lead.contactPhone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
