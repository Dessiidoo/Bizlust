import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Copy, 
  Edit3, 
  Send, 
  Clock, 
  User, 
  Building2,
  Sparkles,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    contactName: string;
    contactTitle?: string;
    contactEmail?: string;
    company: {
      name: string;
      industry?: string;
    };
    marketSignal?: string;
    score: number;
  } | null;
}

interface OutreachSuggestion {
  subject: string;
  message: string;
  channel: string;
  timing: string;
  followUpSchedule: string[];
}

export function OutreachModal({ open, onOpenChange, lead }: OutreachModalProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [outreachData, setOutreachData] = useState<OutreachSuggestion | null>(null);

  const generateOutreachMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/leads/${leadId}/outreach`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to generate outreach');
      return response.json();
    },
    onSuccess: (data: OutreachSuggestion) => {
      setOutreachData(data);
      setEditedSubject(data.subject);
      setEditedMessage(data.message);
      setEditMode(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate outreach email. Please try again.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (open && lead && !outreachData) {
      generateOutreachMutation.mutate(lead.id);
    }
    if (!open) {
      setOutreachData(null);
      setEditMode(false);
    }
  }, [open, lead]);

  const handleCopyEmail = () => {
    const emailContent = `Subject: ${editMode ? editedSubject : outreachData?.subject}

${editMode ? editedMessage : outreachData?.message}`;
    
    navigator.clipboard.writeText(emailContent);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard",
    });
  };

  const handleSaveEdit = () => {
    if (outreachData) {
      setOutreachData({
        ...outreachData,
        subject: editedSubject,
        message: editedMessage,
      });
    }
    setEditMode(false);
    toast({
      title: "Saved",
      description: "Your edits have been saved",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Quality";
    if (score >= 60) return "Medium Quality";
    return "Low Quality";
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Generated Outreach Email
          </DialogTitle>
          <DialogDescription>
            Personalized email for {lead.contactName} at {lead.company.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Lead Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                  <p className="font-medium">{lead.contactName}</p>
                  {lead.contactTitle && (
                    <p className="text-sm text-muted-foreground">{lead.contactTitle}</p>
                  )}
                  {lead.contactEmail && (
                    <p className="text-sm text-blue-600">{lead.contactEmail}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{lead.company.name}</p>
                      {lead.company.industry && (
                        <p className="text-sm text-muted-foreground">{lead.company.industry}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead Score</Label>
                  <Badge className={`mt-1 ${getScoreColor(lead.score)}`}>
                    {lead.score}/100 - {getScoreLabel(lead.score)}
                  </Badge>
                </div>

                {lead.marketSignal && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Market Signal</Label>
                    <p className="text-sm">{lead.marketSignal}</p>
                  </div>
                )}

                {outreachData && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Best Time to Reach</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{outreachData.timing}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <div className="lg:col-span-2">
            {generateOutreachMutation.isPending ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : outreachData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Generated Email
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateOutreachMutation.mutate(lead.id)}
                        data-testid="button-regenerate-email"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                        data-testid="button-edit-email"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {editMode ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    {editMode ? (
                      <Input
                        id="subject"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="mt-1"
                        data-testid="input-email-subject"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-muted rounded-md font-medium">
                        {outreachData.subject}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Email Message</Label>
                    {editMode ? (
                      <Textarea
                        id="message"
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        rows={12}
                        className="mt-1"
                        data-testid="textarea-email-message"
                      />
                    ) : (
                      <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap">
                        {outreachData.message}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    {editMode ? (
                      <Button 
                        onClick={handleSaveEdit}
                        data-testid="button-save-email"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleCopyEmail}
                          data-testid="button-copy-email"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Email
                        </Button>
                        {lead.contactEmail && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              const subject = encodeURIComponent(editedSubject);
                              const body = encodeURIComponent(editedMessage);
                              window.open(`mailto:${lead.contactEmail}?subject=${subject}&body=${body}`);
                            }}
                            data-testid="button-send-email"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Open in Email
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Follow-up Schedule */}
                  {outreachData.followUpSchedule.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Suggested Follow-up Schedule</h4>
                      <ul className="space-y-1">
                        {outreachData.followUpSchedule.map((followUp, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {followUp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}