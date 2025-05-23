import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import Operations from "@/pages/operations";
import Progress from "@/pages/progress";
import Performance from "@/pages/performance";
import Safety from "@/pages/safety";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <>{children}</>;
};

const AppLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {!isAuthenticated ? <Login /> : <Redirect to="/dashboard" />}
      </Route>
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout title="Tableau de Bord">
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/home">
        <ProtectedRoute>
          <AppLayout title="Accueil">
            <Home />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/operations">
        <ProtectedRoute>
          <AppLayout title="Suivi des Opérations">
            <Operations />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/progress">
        <ProtectedRoute>
          <AppLayout title="Suivi des Avancements">
            <Progress />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/performance">
        <ProtectedRoute>
          <AppLayout title="Performances Techniques">
            <Performance />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/safety">
        <ProtectedRoute>
          <AppLayout title="Sécurité & Incidents">
            <Safety />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute>
          <AppLayout title="Gestion des Utilisateurs">
            <Users />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
