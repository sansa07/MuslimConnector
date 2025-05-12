import { Suspense, lazy } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/lib/protected-route";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNav from "@/components/layout/MobileNav";
import PatternOverlay from "@/components/layout/PatternOverlay";

// Pages
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import VerifyEmail from "@/pages/verify-email";
import NotFound from "@/pages/not-found";

// Lazy loaded pages
const AdminPanel = lazy(() => import("@/pages/admin"));
const PrayerTimes = lazy(() => import("@/pages/PrayerTimes"));
const DailyWisdom = lazy(() => import("@/pages/DailyWisdom"));
const QuranHadith = lazy(() => import("@/pages/QuranHadith"));
const DuaRequests = lazy(() => import("@/pages/DuaRequests"));
const Communities = lazy(() => import("@/pages/Communities"));
const Events = lazy(() => import("@/pages/Events"));
const Profile = lazy(() => import("@/pages/Profile"));
const Explore = lazy(() => import("@/pages/Explore"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/verify-email" component={VerifyEmail} />
        <ProtectedRoute path="/admin" component={AdminPanel} />
        <ProtectedRoute path="/prayer-times" component={PrayerTimes} />
        <ProtectedRoute path="/daily-wisdom" component={DailyWisdom} />
        <ProtectedRoute path="/quran-hadith" component={QuranHadith} />
        <ProtectedRoute path="/dua-requests" component={DuaRequests} />
        <ProtectedRoute path="/communities" component={Communities} />
        <ProtectedRoute path="/events" component={Events} />
        <ProtectedRoute path="/profile/:id?" component={Profile} />
        <ProtectedRoute path="/explore" component={Explore} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth" || location === "/verify-email";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="islamic-navy" storageKey="theme-mode">
          {isAuthPage ? (
            <Router />
          ) : (
            <div className="min-h-screen bg-gray-50 dark:bg-navy-dark islamic-green:bg-[#eaf5ed] islamic-gold:bg-[#f9f5e8] islamic-navy:bg-[#12233f] relative">
              <PatternOverlay />
              <Sidebar />
              <MobileHeader />
              <main className="lg:ml-64 pb-20 lg:pb-10 relative z-10">
                <div className="container mx-auto px-4 py-6">
                  <Router />
                </div>
              </main>
              <MobileNav />
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;