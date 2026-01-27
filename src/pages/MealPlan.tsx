import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  Sun, 
  Cookie, 
  Moon, 
  Sparkles,
  Lock,
  Utensils
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { supabase } from "@/integrations/supabase/client";

const MealPlan = () => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("plan, is_active, trial_start_date, created_at")
        .eq("user_id", user.id)
        .single();

      if (!subscription) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Check if has paid plan
      const paidPlans = ["essential", "evolution", "personal_trainer"];
      if (paidPlans.includes(subscription.plan || "") && subscription.is_active) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Check if still in trial
      const trialStart = new Date(subscription.trial_start_date || subscription.created_at);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      const inTrial = daysPassed < 7;

      setHasAccess(inTrial);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
      setIsLoading(false);
    }
  };

  // Sample meal plan for demonstration
  const sampleMealPlan = [
    {
      meal: "Pequeno-almoço",
      time: "07:00 - 09:00",
      icon: Coffee,
      food: "Papa de milho com leite + banana + amendoim torrado",
      calories: 420,
      protein: 15,
      carbs: 65,
      fat: 12,
    },
    {
      meal: "Almoço",
      time: "12:00 - 14:00",
      icon: Sun,
      food: "Funge de bombó com calulu de peixe e feijão de óleo",
      calories: 650,
      protein: 35,
      carbs: 75,
      fat: 18,
    },
    {
      meal: "Lanche",
      time: "16:00 - 17:00",
      icon: Cookie,
      food: "Batata doce assada + ginguba (amendoim)",
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 9,
    },
    {
      meal: "Jantar",
      time: "19:00 - 21:00",
      icon: Moon,
      food: "Frango grelhado com mandioca cozida e quizaca",
      calories: 520,
      protein: 42,
      carbs: 48,
      fat: 14,
    },
  ];

  const totalCalories = sampleMealPlan.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = sampleMealPlan.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = sampleMealPlan.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = sampleMealPlan.reduce((sum, m) => sum + m.fat, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-primary">A carregar...</div>
      </div>
    );
  }

  // Access denied screen
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Acesso Restrito
              </h1>
              <p className="text-muted-foreground mb-6">
                O período de teste terminou. Subscreve um plano para aceder aos planos de alimentação personalizados.
              </p>
              <Button variant="hero" className="w-full" onClick={() => navigate("/subscription")}>
                Ver Planos
              </Button>
            </Card>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  Plano Alimentar
                  <Sparkles className="w-5 h-5 text-primary" />
                </h1>
                <p className="text-muted-foreground">
                  Receitas 100% angolanas adaptadas ao teu objetivo
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Plan Generator */}
          <div className="mb-8">
            <WeeklyPlanGenerator type="meal" />
          </div>

          {/* Daily Summary Card */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Exemplo de Plano Diário
                </p>
                <p className="text-3xl font-bold text-primary">{totalCalories.toLocaleString('pt-AO')} kcal</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="px-4 py-2 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Proteínas</p>
                  <p className="text-xl font-bold text-secondary">{totalProtein}g</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Carbos</p>
                  <p className="text-xl font-bold text-accent">{totalCarbs}g</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Gorduras</p>
                  <p className="text-xl font-bold text-destructive">{totalFat}g</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Meal Cards */}
          <div className="space-y-4">
            {sampleMealPlan.map((meal) => {
              const Icon = meal.icon;
              return (
                <Card key={meal.meal} className="p-5 hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {meal.meal}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {meal.time}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {meal.calories} kcal
                        </Badge>
                      </div>
                      <p className="text-foreground mb-3">{meal.food}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-secondary">
                          <span className="w-2 h-2 rounded-full bg-secondary" />
                          {meal.protein}g proteína
                        </span>
                        <span className="flex items-center gap-1 text-accent">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          {meal.carbs}g carbos
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <span className="w-2 h-2 rounded-full bg-destructive" />
                          {meal.fat}g gordura
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Info Card */}
          <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Plano Personalizado com IA</h4>
                <p className="text-sm text-muted-foreground">
                  Use o gerador acima para criar um plano semanal completo baseado nos seus dados de anamnese. 
                  O plano inclui receitas 100% angolanas adaptadas ao seu objetivo.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default MealPlan;
