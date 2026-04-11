import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import SmartNotifications from "./components/SmartNotifications";
import { autoRegisterPush } from "./lib/pushNotifications";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Upload from "./pages/Upload";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import History from "./pages/History";
import MealPlan from "./pages/MealPlan";
import Recipes from "./pages/Recipes";
import WeightLoss from "./pages/WeightLoss";
import Workout from "./pages/Workout";
import Support from "./pages/Support";
import SupportEN from "./pages/SupportEN";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import PersonalTrainer from "./pages/PersonalTrainer";
import Anamnesis from "./pages/Anamnesis";
import Subscription from "./pages/Subscription";
import Social from "./pages/Social";
import Install from "./pages/Install";
import InstallPrompt from "./components/InstallPrompt";
const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    const publicPaths = ['/support', '/support-en', '/privacy', '/about'];
    const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));
    if (hasShownSplash || isPublicPath) {
      setShowSplash(false);
    }
  }, []);

  // Auto-register push notifications when user is authenticated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Small delay to let SW register first
        setTimeout(() => autoRegisterPush(), 2000);
      }
    });
    // Also try on mount if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setTimeout(() => autoRegisterPush(), 2000);
    });
    return () => subscription.unsubscribe();
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
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/weight-loss" element={<WeightLoss />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support-en" element={<SupportEN />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/personal-trainer" element={<PersonalTrainer />} />
          <Route path="/anamnesis" element={<Anamnesis />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/social" element={<Social />} />
          <Route path="/install" element={<Install />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SmartNotifications />
        <InstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
