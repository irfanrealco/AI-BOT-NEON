import { useState, useCallback } from "react";
import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AppLayout } from "@/components/AppLayout";
import Home from "@/pages/home";
import NotebooksPage from "@/pages/notebooks";
import PodcastPage from "@/pages/podcast";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import type { UserRole } from "@/lib/types";

function AppRouter() {
  const [location, setLocation] = useLocation();
  const [userRole] = useState<UserRole>("Admin");

  const handleNavigate = useCallback(
    (path: string) => {
      setLocation(path);
    },
    [setLocation]
  );

  return (
    <AppLayout currentPath={location} onNavigate={handleNavigate} userRole={userRole}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/notebooks" component={NotebooksPage} />
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
