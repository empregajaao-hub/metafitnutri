import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Heart, Zap, Dumbbell, LineChart, Sparkles, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import Dashboard from "@/components/Dashboard";
import SmartNotifications from "@/components/SmartNotifications";
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
          .select("\"Nome Completo\", \"Objetivo\", peso")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setUserName(profile["Nome Completo"] || "");
          setUserGoal(profile["Objetivo"] as "lose" | "maintain" | "gain" | null);
          setUserWeight(profile.peso);
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

  const features = [
    {
      icon: Sparkles,
      title: "Análise IA",
      description: "Foto → Macros em segundos"
    },
    {
      icon: Dumbbell,
      title: "Treinos",
      description: "Planos personalizados"
    },
    {
      icon: LineChart,
      title: "Progresso",
      description: "Acompanha evolução"
    },
    {
      icon: Target,
      title: "Metas",
      description: "Objetivos claros"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  // Dashboard para utilizadores logados
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        
        <main className="container mx-auto px-4 py-6 max-w-lg">
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

  // Landing page para visitantes
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section - Clean & Minimal */}
      <section className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-2xl mx-auto"
        >
          {/* Logo with neon blue glow */}
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 scale-125" />
            <img 
              src={logo} 
              alt="METAFIT" 
              className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-full relative z-10 border-2 border-primary/50 shadow-glow"
            />
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">100% Angolano</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
              Nutrientes sob controle
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tira uma foto da refeição e recebe análise completa de macronutrientes instantaneamente.
            </p>
          </div>

          {/* Unique Feature Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 shadow-glow"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              EXCLUSIVO MUNDIAL
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">📸 Foto de Ingredientes → Receitas</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tira foto de ingredientes crus e recebe <span className="text-primary font-semibold">receitas completas</span> com quantidades exatas adaptadas ao teu objetivo. Único app no mundo com esta tecnologia!
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button 
              size="lg"
              onClick={handleGoToUpload}
              className="group bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
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
      </section>

      {/* Features Grid - Clean Cards */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="p-5 text-center border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
            >
              <feature.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Benefits Section - Minimal */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Análise fotográfica IA</p>
              <p className="text-xs text-muted-foreground">Calorias e macros em segundos</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Treinos personalizados</p>
              <p className="text-xs text-muted-foreground">Planos adaptados ao teu objetivo</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <LineChart className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Acompanha o teu progresso</p>
              <p className="text-xs text-muted-foreground">Histórico completo de refeições e evolução</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section className="container mx-auto px-4 py-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10"
        >
          <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Pronto para começar?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Junta-te a centenas de angolanos saudáveis
          </p>
          <Button 
            onClick={() => navigate('/onboarding')}
            className="rounded-full px-6 bg-primary hover:bg-primary/90"
          >
            Começar Agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer - Minimal */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="METAFIT" className="h-8 w-8 rounded-full" />
              <span className="text-sm font-medium text-foreground">METAFIT</span>
            </div>
            
            <div className="flex gap-6 text-xs text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">
                Sobre
              </button>
              <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">
                Privacidade
              </button>
              <button onClick={() => navigate('/support')} className="hover:text-foreground transition-colors">
                Suporte
              </button>
            </div>
          </div>
          
          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            © 2024 METAFIT NUTRI · Lubatec
          </p>
        </div>
      </footer>
      
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
