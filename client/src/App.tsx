import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Explore from "@/pages/explore";
import Events from "@/pages/events";
import Duas from "@/pages/duas";
import Quran from "@/pages/quran";
import Login from "@/pages/login";
import Register from "@/pages/register";
import MobileHeader from "@/components/layout/mobile-header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import MobileDailyMenu from "@/components/mobile-daily-menu";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/explore" component={Explore} />
      <Route path="/events" component={Events} />
      <Route path="/duas" component={Duas} />
      <Route path="/quran" component={Quran} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="müslimnet-theme">
        <TooltipProvider>
          <div className="relative min-h-screen">
            {/* Pattern Overlay */}
            <div className="pattern-overlay"></div>
            
            {/* Mobile Header - visible on mobile only */}
            <MobileHeader />
            
            {/* Desktop Sidebar - visible on desktop only */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="lg:ml-64 pb-20 lg:pb-10">
              <div className="container mx-auto px-4 py-6">
                <Toaster />
                <Router />
              </div>
            </main>
            
            {/* Mobile Daily Menu - visible above mobile navigation */}
            <MobileDailyMenu />
            
            {/* Mobile Bottom Navigation - visible on mobile only */}
            <MobileNavigation />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
