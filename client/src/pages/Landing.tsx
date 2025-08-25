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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
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
      <section className="bg-gradient-to-br from-primary via-blue-700 to-blue-800 text-white py-20">
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

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Discover, Engage, Convert
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to identify high-value prospects 
              and turn them into customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Lead Discovery</h3>
                <p className="text-muted-foreground">
                  AI algorithms scan millions of data points to find your ideal prospects 
                  before your competition even knows they exist.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Get deep insights into market trends, competitor analysis, and emerging 
                  opportunities in your industry.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Automated Outreach</h3>
                <p className="text-muted-foreground">
                  Personalized messaging campaigns that convert prospects into customers 
                  with industry-leading open rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold">LeadPro</span>
              </div>
              <p className="text-gray-400 mb-4">
                The AI-powered platform that transforms market intelligence into competitive advantage.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Lead Generation", "Market Intelligence", "Competitor Analysis", "Analytics"]
              },
              {
                title: "Company", 
                links: ["About Us", "Careers", "Press", "Contact"]
              },
              {
                title: "Support",
                links: ["Help Center", "API Docs", "Privacy Policy", "Terms of Service"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LeadPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}