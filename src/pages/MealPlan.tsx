import { useState, useEffect } from "react";
import SubscriptionWall from "@/components/SubscriptionWall";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  Sun, 
  Cookie, 
  Moon, 
  Lock,
  Utensils,
  ArrowLeft,
  Flame
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

      const paidPlans = ["essential", "evolution", "personal_trainer"];
      if (paidPlans.includes(subscription.plan || "") && subscription.is_active) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

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

  const sampleMealPlan = [
    {
      meal: "Pequeno-almoço",
      time: "07:00",
      icon: Coffee,
      food: "Papa de milho com leite + banana + amendoim",
      calories: 420,
      protein: 15,
      carbs: 65,
      fat: 12,
    },
    {
      meal: "Almoço",
      time: "12:30",
      icon: Sun,
      food: "Funge com calulu de peixe e feijão",
      calories: 650,
      protein: 35,
      carbs: 75,
      fat: 18,
    },
    {
      meal: "Lanche",
      time: "16:00",
      icon: Cookie,
      food: "Batata doce assada + ginguba",
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 9,
    },
    {
      meal: "Jantar",
      time: "19:30",
      icon: Moon,
      food: "Frango grelhado com mandioca e quizaca",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full mb-6">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SubscriptionWall feature="Planos Alimentares" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Plano Alimentar</h1>
              <p className="text-xs text-muted-foreground">Receitas 100% angolanas</p>
            </div>
          </div>
        </div>

        {/* Weekly Plan Generator */}
        <div className="mb-6">
          <WeeklyPlanGenerator type="meal" />
        </div>

        {/* Daily Summary */}
        <Card className="p-4 mb-6 bg-muted/30 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Exemplo Diário</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{totalCalories}</span>
              <span className="text-sm text-muted-foreground">kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground">Proteína</p>
              <p className="text-sm font-semibold text-secondary">{totalProtein}g</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground">Carbos</p>
              <p className="text-sm font-semibold text-accent">{totalCarbs}g</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground">Gordura</p>
              <p className="text-sm font-semibold text-destructive">{totalFat}g</p>
            </div>
          </div>
        </Card>

        {/* Meal Cards */}
        <div className="space-y-3">
          {sampleMealPlan.map((meal) => {
            const Icon = meal.icon;
            return (
              <Card key={meal.meal} className="p-4 border-border/50 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground">{meal.meal}</h3>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{meal.food}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {meal.calories} kcal
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        P:{meal.protein}g · C:{meal.carbs}g · G:{meal.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Use o gerador acima para criar um plano semanal personalizado
        </p>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default MealPlan;
