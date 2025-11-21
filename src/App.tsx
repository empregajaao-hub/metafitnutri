import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InstallPromptAndroid from "./components/InstallPromptAndroid";
import InstallInstructionsIOS from "./components/InstallInstructionsIOS";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Upload from "./pages/Upload";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import History from "./pages/History";
import MealPlan from "./pages/MealPlan";
import Workout from "./pages/Workout";
import Payment from "./pages/Payment";
import Support from "./pages/Support";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPromptAndroid />
      <InstallInstructionsIOS />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
