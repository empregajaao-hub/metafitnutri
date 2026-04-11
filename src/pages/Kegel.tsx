import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Activity, Info, CheckCircle2, Play, Timer, Zap } from "lucide-react";
import { motion } from "framer-motion";
import MobileBottomNav from "@/components/MobileBottomNav";

const Kegel = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<"masculino" | "feminino" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGender = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("gender")
          .eq("id", user.id)
          .single();

        setGender(profile?.gender as any || "masculino");
      } catch (error) {
        console.error("Error fetching gender:", error);
        setGender("masculino");
      } finally {
        setLoading(false);
      }
    };

    fetchUserGender();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMale = gender === "masculino";

  const content = {
    title: isMale ? "Exercícios de Kegel para Homens" : "Exercícios de Kegel para Mulheres",
    description: isMale 
      ? "Fortalece os músculos do pavimento pélvico para melhorar o controlo da bexiga e a saúde sexual."
      : "Fortalece o pavimento pélvico para suporte dos órgãos, controlo da bexiga e recuperação pós-parto.",
    benefits: isMale 
      ? ["Melhoria do controlo urinário", "Aumento da performance sexual", "Prevenção de problemas de próstata", "Maior estabilidade do core"]
      : ["Prevenção de incontinência", "Recuperação pós-parto", "Melhoria da sensibilidade sexual", "Suporte dos órgãos pélvicos"],
    steps: [
      {
        title: "Identificar os Músculos",
        desc: isMale 
          ? "Tenta parar o fluxo de urina ou contrair os músculos que evitam a passagem de gases."
          : "Imagina que estás a tentar segurar a urina ou a contrair a zona vaginal."
      },
      {
        title: "A Técnica",
        desc: "Contrai os músculos por 3-5 segundos e depois relaxa por 3-5 segundos."
      },
      {
        title: "Repetição",
        desc: "Repete o ciclo 10 vezes, 3 vezes ao dia para melhores resultados."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-black tracking-tight">Treino Kegel</h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">{content.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground px-1">Benefícios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground px-1">Como Praticar</h3>
            {content.steps.map((step, i) => (
              <div key={i} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-px before:bg-border last:before:hidden">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                  {i + 1}
                </div>
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="p-6 border-dashed border-2 border-primary/20 bg-transparent">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Timer className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">5 Minutos</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Nível Fácil</span>
                </div>
              </div>
              <Button className="w-full rounded-xl h-12 font-bold gap-2 shadow-lg shadow-primary/20">
                <Play className="w-4 h-4 fill-current" />
                Começar Sessão Guiada
              </Button>
              <p className="text-[10px] text-muted-foreground italic">
                Dica: Podes fazer estes exercícios em qualquer lugar, ninguém vai notar!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Kegel;
