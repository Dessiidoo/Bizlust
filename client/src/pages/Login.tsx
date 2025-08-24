import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, firstName, lastName };

      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: isLogin ? "Login successful!" : "Registration successful!",
          description: `Welcome${isLogin ? ' back' : ''} to LeadPro!`,
        });
        setLocation("/");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-white mr-3" />
            <span className="text-3xl font-bold text-white">LeadPro</span>
          </div>
          <p className="text-blue-100">
            AI-powered lead generation platform
          </p>
        </div>

        {/* Login/Register Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "Welcome Back" : "Get Started"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-password"
                />
                {!isLogin && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
                data-testid="button-toggle-mode"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center text-blue-100 space-y-2">
          <h3 className="font-semibold">What you'll get:</h3>
          <ul className="text-sm space-y-1">
            <li>✓ AI-powered lead scoring</li>
            <li>✓ Market intelligence insights</li>
            <li>✓ Personalized outreach suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}