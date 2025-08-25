import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Rocket, 
  Play, 
  Shield, 
  Lock, 
  TrendingUp,
  Target,
  Eye,
  Zap,
  Star,
  Calendar
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" style={{transform: 'none', backfaceVisibility: 'visible', willChange: 'auto'}}>
      {/* Navigation */}
      <nav className="bg-background shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-foreground">LeadPro</span>
            </div>
            <Button asChild data-testid="button-login">
              <a href="/login" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Get Started
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-primary text-white py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Turn Market Intelligence Into{" "}
                <span className="text-yellow-400">Revenue Growth</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                AI-powered lead generation that identifies your perfect customers before your competitors do. 
                Access exclusive market insights and convert prospects into profits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold"
                  asChild
                  data-testid="button-start-trial"
                >
                  <a href="/login">
                    <Rocket className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  data-testid="button-watch-demo"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-blue-100">4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-400 mr-1" />
                  <span className="text-blue-100">SOC 2 Certified</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-blue-100">99.9% Uptime</span>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Demo Dashboard</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 LeadPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}