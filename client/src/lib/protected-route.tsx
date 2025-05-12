import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // Show loading state
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // Redirect to auth page if not logged in
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // For admin routes, check role
        if (path.startsWith("/admin") && user.role !== "admin" && user.role !== "moderator") {
          return <Redirect to="/" />;
        }

        // Render the component
        return <Component {...params} />;
      }}
    </Route>
  );
}