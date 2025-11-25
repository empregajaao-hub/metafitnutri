import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, TrendingUp, Minus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Goal = "lose" | "maintain" | "gain" | null;

const Onboarding = () => {
  const [goal, setGoal] = useState<Goal>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState({ age: "", weight: "", height: "", activity: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const goals = [
    {
      id: "lose" as Goal,
      label: "Perder Peso",
      icon: TrendingDown,
      description: "Reduzir calorias e gordura de forma saudável",
      gradient: "from-red-500 to-orange-500",
    },
    {
      id: "maintain" as Goal,
      label: "Manter Peso",
      icon: Minus,
      description: "Equilíbrio nutricional e manutenção",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "gain" as Goal,
      label: "Ganhar Peso",
      icon: TrendingUp,
      description: "Aumentar massa muscular com proteína",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const handleContinue = async () => {
    if (showDetails) {
      await saveProfile();
    } else {
      setShowDetails(true);
    }
  };

  const handleSkip = async () => {
    await saveProfile();
  };

  const saveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").update({
        goal: goal || "maintain",
        age: details.age ? parseInt(details.age) : null,
        weight: details.weight ? parseFloat(details.weight) : null,
        height: details.height ? parseFloat(details.height) : null,
        activity_level: details.activity || null,
      }).eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil guardado!",
        description: "Vamos começar a tua jornada.",
      });
      navigate("/upload");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-medium">
        {!showDetails ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao METAFIT</h1>
              <p className="text-muted-foreground">
                Escolha o seu objetivo para receber conselhos personalizados em Português de Angola
              </p>
            </div>

            <div className="grid gap-4 pt-4">
              {goals.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`relative p-6 rounded-lg border-2 transition-smooth text-left group hover:shadow-medium ${
                      goal === g.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${g.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 text-foreground">{g.label}</h3>
                        <p className="text-sm text-muted-foreground">{g.description}</p>
                      </div>
                      {goal === g.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!goal}
              variant="hero"
              size="lg"
              className="w-full"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Informações Opcionais</h2>
              <p className="text-muted-foreground">
                Ajuda-nos a personalizar melhor as tuas sugestões (podes pular este passo)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade (anos)</Label>
                <Input id="age" type="number" placeholder="Ex: 28" value={details.age} onChange={(e) => setDetails({...details, age: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input id="weight" type="number" placeholder="Ex: 75" value={details.weight} onChange={(e) => setDetails({...details, weight: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input id="height" type="number" placeholder="Ex: 170" value={details.height} onChange={(e) => setDetails({...details, height: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Nível de Actividade</Label>
                <select
                  id="activity"
                  value={details.activity}
                  onChange={(e) => setDetails({...details, activity: e.target.value})}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Seleccionar...</option>
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Leve</option>
                  <option value="moderate">Moderado</option>
                  <option value="active">Activo</option>
                  <option value="very-active">Muito Activo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSkip} variant="outline" className="flex-1">
                Pular
              </Button>
              <Button onClick={handleContinue} variant="hero" className="flex-1">
                Finalizar
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
