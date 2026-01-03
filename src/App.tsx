import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import SmartNotifications from "./components/SmartNotifications";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Upload from "./pages/Upload";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import History from "./pages/History";
import MealPlan from "./pages/MealPlan";
import Workout from "./pages/Workout";
import Support from "./pages/Support";
import SupportEN from "./pages/SupportEN";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import PersonalTrainer from "./pages/PersonalTrainer";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    // Skip splash for public pages (support, privacy, about)
    const publicPaths = ['/support', '/support-en', '/privacy', '/about'];
    const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));
    if (hasShownSplash || isPublicPath) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("hasShownSplash", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support-en" element={<SupportEN />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/personal-trainer" element={<PersonalTrainer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SmartNotifications />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
