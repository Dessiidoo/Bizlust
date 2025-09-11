import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, User, Briefcase, Users } from "lucide-react";

const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const industries = [
  "Technology",
  "Healthcare",
  "Finance", 
  "Manufacturing",
  "Retail",
  "Education",
  "Real Estate",
  "Consulting",
  "Marketing & Advertising",
  "Legal Services",
  "Construction",
  "Transportation",
  "Food & Beverage",
  "Entertainment",
  "Non-Profit",
  "Government",
  "Energy",
  "Agriculture",
  "Other"
];

const companySizes = [
  "Solo/Freelancer (1)",
  "Startup (2-10)",
  "Small (11-50)", 
  "Medium (51-200)",
  "Large (201-1000)",
  "Enterprise (1000+)"
];

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        companyName: user.companyName || "",
        industry: user.industry || "",
        companySize: user.companySize || "",
      });
    }
  }, [user, form]);

  // Redirect to external site when profile is complete
  React.useEffect(() => {
    if (user?.companyName && user?.industry && user?.companySize) {
      window.location.href = "https://jeosync.com";
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your business profile has been updated successfully. AI lead generation will now be more targeted to your business!",
      });
      window.location.href = "https://jeosync.com";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasProfile = user?.companyName && user?.industry && user?.companySize;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Business Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Help our AI understand your business so we can generate more targeted leads and insights.
          </p>
        </div>

        {!hasProfile && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Your profile is incomplete. Complete it to get AI-powered leads tailored to your specific business needs.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              This information helps our AI generate leads that are the perfect fit for your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          {...field}
                          data-testid="input-company-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-size">
                            <SelectValue placeholder="Select your company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    How This Helps
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• AI generates leads in your target industries</li>
                    <li>• Lead scoring considers your business context</li>
                    <li>• Market insights tailored to your company size</li>
                    <li>• Outreach suggestions match your industry</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {hasProfile && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Profile Complete
              </CardTitle>
              <CardDescription className="text-green-700">
                Great! Your profile is complete. The AI will now generate leads specifically targeted to your {user?.industry || 'business'} business.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}