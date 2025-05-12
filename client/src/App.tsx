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
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/verify-email" component={VerifyEmail} />
        <ProtectedRoute path="/admin" component={AdminPanel} />
        <Route path="/prayer-times" component={PrayerTimes} />
        <Route path="/daily-wisdom" component={DailyWisdom} />
        <Route path="/quran-hadith" component={QuranHadith} />
        <Route path="/dua-requests" component={DuaRequests} />
        <Route path="/communities" component={Communities} />
        <Route path="/events" component={Events} />
        <Route path="/profile/:id?" component={Profile} />
        <Route path="/explore" component={Explore} />
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
        <ThemeProvider defaultTheme="light" storageKey="theme-mode">
          {isAuthPage ? (
            <Router />
          ) : (
            <div className="flex min-h-screen bg-gray-50 dark:bg-navy-dark">
              <main className="flex-1">
                <div className="lg:pl-64">
                  <MobileHeader />
                  <Sidebar />
                  <div className="container mx-auto px-4 py-6">
                    <Router />
                  </div>
                </div>
              </main>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;