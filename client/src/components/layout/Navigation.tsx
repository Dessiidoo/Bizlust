import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target, 
  Menu,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Market Intelligence", href: "/insights", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Pricing", href: "/pricing", icon: Target },
];

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (user: any) => {
    // If no user, don't show anything
    if (!user) {
      return "";
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Brain className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-foreground">LeadPro</span>
            </Link>
          </div>

          {/* Only show navigation for authenticated users */}
          {user ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex items-center space-x-2",
                            isActive 
                              ? "text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={(user as any)?.profileImageUrl} alt={(user as any)?.firstName || "User"} />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <a href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/auth/logout', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include'
                            });
                            
                            if (response.ok) {
                              // Redirect to landing page after logout
                              window.location.href = '/';
                            }
                          } catch (error) {
                            console.error('Logout failed:', error);
                            window.location.href = '/';
                          }
                        }}
                        className="flex items-center w-full text-left px-2 py-1.5 text-sm"
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col space-y-4 mt-8">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          const isActive = location === item.href;
                          return (
                            <Link 
                              key={item.name} 
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start space-x-2",
                                  isActive 
                                    ? "text-primary font-medium bg-primary/10" 
                                    : "text-muted-foreground"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </>
          ) : (
            /* Show login button for unauthenticated users */
            <div className="flex items-center">
              <Button asChild>
                <a href="/login">Login</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
