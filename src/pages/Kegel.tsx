import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Info, Heart, TrendingUp, Shield, Zap, CheckCircle2, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import MobileBottomNav from "@/components/MobileBottomNav";
import KgelTrainer from "@/components/KgelTrainer";

const Kegel = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<"masculino" | "feminino" | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrainer, setShowTrainer] = useState(false);

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">A carregar treino personalizado...</p>
        </div>
      </div>
    );
  }

  const isMale = gender === "masculino";

  const content = {
    title: isMale ? "Treino Kegel para Homens" : "Treino Kegel para Mulheres",
    subtitle: isMale 
      ? "Fortalece o pavimento pélvico para melhor controlo e saúde sexual"
      : "Fortalece o pavimento pélvico para suporte, controlo e bem-estar",
    benefits: isMale 
      ? [
          { icon: Shield, title: "Controlo Urinário", desc: "Melhora significativa na retenção" },
          { icon: Heart, title: "Performance Sexual", desc: "Intensidade e controlo aumentados" },
          { icon: TrendingUp, title: "Saúde da Próstata", desc: "Prevenção de problemas comuns" },
          { icon: Zap, title: "Estabilidade Core", desc: "Núcleo mais forte e resistente" }
        ]
      : [
          { icon: Shield, title: "Prevenção de Incontinência", desc: "Controlo total da bexiga" },
          { icon: Heart, title: "Recuperação Pós-parto", desc: "Restauração muscular acelerada" },
          { icon: TrendingUp, title: "Bem-estar Sexual", desc: "Sensibilidade e satisfação" },
          { icon: Zap, title: "Suporte Pélvico", desc: "Órgãos bem posicionados" }
        ]
  };

  const steps = [
    {
      number: 1,
      title: "Identificar os Músculos",
      desc: isMale 
        ? "Tenta parar o fluxo de urina ou contrair os músculos que evitam a passagem de gases. Estes são os músculos do pavimento pélvico."
        : "Imagina que estás a tentar segurar a urina ou a contrair a zona vaginal. Estes são os músculos-alvo.",
      icon: Target
    },
    {
      number: 2,
      title: "Técnica Correta",
      desc: "Contrai os músculos por 3-5 segundos com força, depois relaxa completamente por 3-5 segundos. Mantém uma respiração normal durante todo o exercício.",
      icon: Heart
    },
    {
      number: 3,
      title: "Progressão Gradual",
      desc: "Começa com 10 repetições, 3 vezes ao dia. Aumenta gradualmente para 20-30 repetições conforme ganhas força.",
      icon: TrendingUp
    },
    {
      number: 4,
      title: "Consistência",
      desc: "Os resultados aparecem após 4-6 semanas de treino consistente. Mantém a rotina para resultados duradouros.",
      icon: CheckCircle2
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border/50">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{content.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{content.subtitle}</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => setShowTrainer(true)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-3 group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                Iniciar Sessão Guiada
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Benefits Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Benefícios Comprovados
                </h2>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.benefits.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="p-5 bg-gradient-to-br from-muted/50 to-muted/20 border-border/50 hover:border-primary/30 transition-all group cursor-default">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-foreground">{benefit.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{benefit.desc}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* How To Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Como Praticar
                </h2>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="space-y-4">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="p-6 bg-gradient-to-br from-background to-muted/10 border-border/50 hover:border-primary/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Icon className="w-24 h-24 text-primary" />
                        </div>

                        <div className="relative z-10 flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-black text-sm">
                              {step.number}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex gap-4">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <h3 className="font-bold text-primary">Dicas Importantes</h3>
                    <ul className="space-y-2 text-sm text-primary/80">
                      <li>• Podes fazer estes exercícios em qualquer lugar, discretamente</li>
                      <li>• Não segures a respiração durante as contrações</li>
                      <li>• Se sentires dor, para imediatamente e consulta um profissional</li>
                      <li>• A consistência é mais importante que a intensidade</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Stats Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-muted/30 border-border/50">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black text-primary">5-10</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">Minutos/dia</p>
              </Card>
              <Card className="p-4 text-center bg-muted/30 border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black text-primary">4-6</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">Semanas</p>
              </Card>
              <Card className="p-4 text-center bg-muted/30 border-border/50">
                <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black text-primary">3x</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">Por dia</p>
              </Card>
            </motion.div>

            {/* Final CTA */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => setShowTrainer(true)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                Começar Treino Agora
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Trainer Modal */}
      {showTrainer && gender && (
        <KgelTrainer gender={gender} onClose={() => setShowTrainer(false)} />
      )}

      <MobileBottomNav />
    </>
  );
};

export default Kegel;
