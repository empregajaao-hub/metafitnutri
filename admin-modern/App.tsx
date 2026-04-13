import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Recipes from "./pages/Recipes";
import Notifications from "./pages/Notifications";

function Router() {
  const [location] = useLocation();

  // Extract current tab from location hash
  const getCurrentTab = () => {
    const hash = location.split("#")[1] || "dashboard";
    return hash;
  };

  const currentTab = getCurrentTab();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentTab={currentTab} />

      {/* Main Content */}
      <main className="flex-1 ml-64 transition-smooth">
        <div className="p-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="#dashboard" component={Dashboard} />
            <Route path="#users" component={Users} />
            <Route path="#payments" component={Payments} />
            <Route path="#recipes" component={Recipes} />
            <Route path="#notifications" component={Notifications} />
            <Route path="/404" component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
