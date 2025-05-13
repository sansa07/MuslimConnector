import { Suspense, lazy } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy loaded admin pages
const AdminLogin = lazy(() => import("./AdminLogin"));
const Dashboard = lazy(() => import("./Dashboard"));

export default function AdminPanel() {
  const [location] = useLocation();
  const auth = useAuth();
  const user = auth.user;
  const isAuthenticated = auth.isAuthenticated;
  
  // URL'den path kısmını al (örn: /admin/login -> login)
  const getSubPath = () => {
    const path = location.split('/admin/')[1] || '';
    return path;
  };
  
  // Admin rotasına girdiğinde, kullanıcının yetkisini ve alt rotayı kontrol et
  const isAdmin = user?.role === 'admin';
  const subPath = getSubPath();

  // Ana sayfa veya sadece /admin rotasında, yönetici değilse giriş sayfasına yönlendir
  if (!subPath && isAuthenticated && !isAdmin) {
    return <AdminLogin />;
  }
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/dashboard" component={Dashboard} />
      </Switch>
    </Suspense>
  );
}