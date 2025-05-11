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
import PrayerTimes from "@/pages/PrayerTimes";
import DailyWisdom from "@/pages/DailyWisdom";
import MobileHeader from "@/components/layout/mobile-header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/explore" component={Explore} />
      <Route path="/events" component={Events} />
      <Route path="/duas" component={Duas} />
      <Route path="/quran" component={Quran} />
      <Route path="/prayer-times" component={PrayerTimes} />
      <Route path="/daily-wisdom" component={DailyWisdom} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  
  // Dil değiştiğinde yönlendirmeyi güncelle
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="müslimnet-theme">
        <TooltipProvider>
          <div className={`relative min-h-screen ${direction === "rtl" ? "rtl" : ""}`}>
            {/* Pattern Overlay */}
            <div className="pattern-overlay"></div>
            
            {/* Mobile Header - visible on mobile only */}
            <MobileHeader />
            
            {/* Desktop Sidebar - visible on desktop only */}
            <Sidebar direction={direction} />
            
            {/* Main Content */}
            <main className={`pb-20 lg:pb-10 ${direction === "rtl" ? "lg:mr-64" : "lg:ml-64"}`}>
              <div className="container mx-auto px-4 py-6">
                <Toaster />
                <Router />
              </div>
            </main>
            
            {/* Mobile Bottom Navigation - visible on mobile only */}
            <MobileNavigation />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
