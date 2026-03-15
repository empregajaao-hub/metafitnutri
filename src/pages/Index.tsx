import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import Dashboard from "@/components/Dashboard";
import SmartNotifications from "@/components/SmartNotifications";
import FlashCards from "@/components/FlashCards";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userGoal, setUserGoal] = useState<"lose" | "maintain" | "gain" | null>(null);
  const [userWeight, setUserWeight] = useState<number | null>(null);

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("\"Nome Completo\", \"Objetivo\", peso, \"Idade\", \"Altura\", \"Nivel de Atividade\"")
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          setUserName(profile["Nome Completo"] || "");
          setUserGoal(profile["Objetivo"] as "lose" | "maintain" | "gain" | null);
          setUserWeight(profile.peso);

          // Redirect to onboarding if essential profile data is missing
          const needsOnboarding = !profile["Objetivo"] || !profile["Idade"] || !profile["Altura"] || !profile.peso;
          if (needsOnboarding) {
            navigate("/anamnesis");
            return;
          }
        } else {
          // No profile at all — needs onboarding
          navigate("/anamnesis");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Precisas de uma conta",
        description: "Para tirar/enviar foto, faz login ou cria uma conta primeiro.",
      });
      navigate("/auth");
      return;
    }
    navigate("/upload");
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 scale-150" />
          <img
            src={logo}
            alt="METAFIT"
            className="h-16 w-16 rounded-full relative z-10 border-2 border-primary/50 animate-pulse"
          />
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(215 28% 10%), hsl(220 25% 13%))' }}>
        <Navbar />
        <main className="flex-1 overflow-hidden px-4 py-2 max-w-lg mx-auto w-full">
          <Dashboard
            userName={userName}
            userGoal={userGoal}
            weight={userWeight}
          />
        </main>
        <SmartNotifications userGoal={userGoal} userName={userName} />
        <AIAssistant />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Hero compact */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 scale-125" />
              <img
                src={logo}
                alt="METAFIT"
                className="h-14 w-14 object-cover rounded-full relative z-10 border-2 border-primary/50"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">100% Angolano</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                Nutrientes sob controle
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                O único app que analisa comida pronta <span className="text-primary font-semibold">e</span> ingredientes crus com IA.
              </p>
            </div>

            <div className="flex gap-2.5 justify-center pt-1">
              <Button
                size="lg"
                onClick={handleGoToUpload}
                className="group bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              >
                <Camera className="w-4 h-4 mr-2" />
                Tirar Foto
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/auth')}
                className="rounded-full px-6"
              >
                Criar Conta
              </Button>
            </div>
          </motion.div>

          {/* Interactive FlashCards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FlashCards />
          </motion.div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="px-4 py-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground/60">
        <div className="flex items-center gap-1.5">
          <img src={logo} alt="METAFIT" className="h-5 w-5 rounded-full" />
          <span className="font-medium">METAFIT</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">Sobre</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacidade</button>
          <button onClick={() => navigate('/support')} className="hover:text-foreground transition-colors">Suporte</button>
        </div>
      </footer>

      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
