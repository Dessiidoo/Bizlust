import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/Navigation";
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
      <Navigation />

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
                  data-testid="button-get-started"
                >
                  <a href="/login">
                    <Rocket className="h-5 w-5 mr-2" />
                    Get Started
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
                  <Shield className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm">SOC 2 Certified</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm">99.9% Uptime</span>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-12">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Business professionals analyzing data" 
                className="rounded-xl shadow-2xl w-full h-auto object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Every Business Leader Craves
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop playing guessing games with your sales pipeline. Get the competitive intelligence 
              that transforms your business from reactive to predictive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Perfect Customer Targeting</h3>
                <p className="text-muted-foreground">
                  AI identifies prospects with 94% higher conversion rates than traditional methods. 
                  Stop wasting time on cold leads.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Competitor Blind Spots</h3>
                <p className="text-muted-foreground">
                  See market opportunities your competitors miss. Access real-time insights 
                  that give you first-mover advantage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Predictable Revenue</h3>
                <p className="text-muted-foreground">
                  Turn sales from guesswork into science. Our clients see 340% ROI 
                  within 90 days of implementation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of businesses already dominating their markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "James Mitchell",
                role: "CEO, TechFlow Solutions",
                content: "LeadVault identified 40% more qualified prospects than our previous solution. We closed $500K in new business within the first quarter.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              },
              {
                name: "Sarah Chen",
                role: "VP Sales, Innovation Labs",
                content: "The competitive intelligence feature is game-changing. We're always one step ahead of our competition now. ROI was 340% in 3 months.",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              },
              {
                name: "David Rodriguez",
                role: "Director, Global Enterprises",
                content: "Finally, a platform that delivers on its promises. Our conversion rates improved by 85% and our sales cycle shortened by 30%.",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Join the businesses that have already discovered the unfair advantage of AI-powered 
            market intelligence. Start your free trial today.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-blue-800 p-6 rounded-xl">
              <div className="text-4xl font-bold mb-2">247</div>
              <div className="text-blue-200">Qualified Leads</div>
              <div className="text-sm text-blue-300">Average per month</div>
            </div>
            
            <div className="bg-blue-800 p-6 rounded-xl">
              <div className="text-4xl font-bold mb-2">340%</div>
              <div className="text-blue-200">Average ROI</div>
              <div className="text-sm text-blue-300">Within 90 days</div>
            </div>
            
            <div className="bg-blue-800 p-6 rounded-xl">
              <div className="text-4xl font-bold mb-2">94%</div>
              <div className="text-blue-200">Lead Quality</div>
              <div className="text-sm text-blue-300">Conversion accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold text-lg"
              asChild
              data-testid="button-start-trial-cta"
            >
              <a href="/login">
                <Rocket className="h-5 w-5 mr-2" />
                Start 14-Day Free Trial
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary font-semibold text-lg"
              data-testid="button-schedule-demo"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Setup in under 5 minutes • Cancel anytime
          </p>
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
