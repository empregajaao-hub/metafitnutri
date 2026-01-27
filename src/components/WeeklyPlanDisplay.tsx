import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Share2, 
  Calendar, 
  Utensils, 
  Dumbbell,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Flame,
  Droplets,
  Loader2,
  Sparkles
} from "lucide-react";
import { 
  generateWeeklyMealPDF, 
  generateWeeklyWorkoutPDF, 
  downloadPDF, 
  shareViaWhatsApp 
} from "@/utils/weeklyPlanPDF";
import { useToast } from "@/hooks/use-toast";

interface WeeklyPlanDisplayProps {
  plan: any;
  planType: "meal" | "workout";
  profile: {
    name?: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    activityLevel?: string;
  };
}

const DAYS_PT: { [key: string]: string } = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const getMealIcon = (mealName: string) => {
  const lower = mealName.toLowerCase();
  if (lower.includes("pequeno") || lower.includes("café")) return Coffee;
  if (lower.includes("almoço")) return Sun;
  if (lower.includes("lanche")) return Cookie;
  if (lower.includes("jantar")) return Moon;
  return Utensils;
};

export const WeeklyPlanDisplay = ({ plan, planType, profile }: WeeklyPlanDisplayProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeDay, setActiveDay] = useState("monday");
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = planType === "meal"
        ? generateWeeklyMealPDF(plan, profile)
        : generateWeeklyWorkoutPDF(plan, profile);
      
      const filename = planType === "meal"
        ? `Plano_Alimentar_METAFIT_${new Date().toISOString().split("T")[0]}.pdf`
        : `Plano_Treino_METAFIT_${new Date().toISOString().split("T")[0]}.pdf`;
      
      downloadPDF(blob, filename);
      
      toast({
        title: "PDF Guardado! 📄",
        description: "O ficheiro foi guardado com sucesso.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = planType === "meal"
        ? generateWeeklyMealPDF(plan, profile)
        : generateWeeklyWorkoutPDF(plan, profile);
      
      const filename = planType === "meal"
        ? `Plano_Alimentar_METAFIT_${new Date().toISOString().split("T")[0]}.pdf`
        : `Plano_Treino_METAFIT_${new Date().toISOString().split("T")[0]}.pdf`;
      
      const message = planType === "meal"
        ? `🥗 Meu Plano Alimentar Semanal METAFIT\n\n✅ Objetivo: ${profile.goal || "Saúde"}\n📊 Meta: ${plan.dailyCalories || "~2000"} kcal/dia\n\nGerado pela app METAFIT NUTRI 💚`
        : `💪 Meu Plano de Treino Semanal METAFIT\n\n✅ Objetivo: ${profile.goal || "Fitness"}\n🏋️ 7 dias de treino personalizado\n\nGerado pela app METAFIT NUTRI 💪`;

      const shared = await shareViaWhatsApp(blob, filename, message);
      
      if (shared) {
        toast({
          title: "Partilhado! 📤",
          description: "O plano foi partilhado com sucesso.",
        });
      } else {
        toast({
          title: "PDF Guardado!",
          description: "Podes agora partilhá-lo via WhatsApp.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Erro",
        description: "Não foi possível partilhar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const weeklyPlan = plan?.weeklyPlan || plan?.plan?.weeklyPlan || {};

  if (!weeklyPlan || Object.keys(weeklyPlan).length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhum plano disponível.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {planType === "meal" ? (
                <Utensils className="w-6 h-6 text-white" />
              ) : (
                <Dumbbell className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {planType === "meal" ? "Plano Alimentar" : "Plano de Treino"}
                <Sparkles className="w-4 h-4 text-primary" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Semana de {new Date().toLocaleDateString("pt-AO", { day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 sm:flex-none"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
            <Button 
              variant="hero" 
              size="sm" 
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 sm:flex-none"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Daily Calories / Tips Summary */}
        {planType === "meal" && plan.dailyCalories && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="gap-1">
              <Flame className="w-3 h-3" />
              {plan.dailyCalories} kcal/dia
            </Badge>
            {plan.hydration && (
              <Badge variant="outline" className="gap-1">
                <Droplets className="w-3 h-3" />
                {plan.hydration.split(" ").slice(0, 4).join(" ")}...
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Day Tabs */}
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {DAYS_ORDER.map((day) => {
            const hasData = weeklyPlan[day];
            return (
              <TabsTrigger 
                key={day} 
                value={day}
                className="min-w-[70px]"
                disabled={!hasData}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {DAYS_PT[day]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {DAYS_ORDER.map((day) => {
          const dayData = weeklyPlan[day];
          if (!dayData) return null;

          return (
            <TabsContent key={day} value={day} className="mt-4">
              {planType === "meal" ? (
                <div className="space-y-3">
                  {dayData.meals?.map((meal: any, idx: number) => {
                    const MealIcon = getMealIcon(meal.name);
                    return (
                      <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                            <MealIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h4 className="font-semibold text-foreground">{meal.name}</h4>
                                <p className="text-xs text-muted-foreground">{meal.time}</p>
                              </div>
                              {meal.calories && (
                                <Badge variant="secondary" className="ml-2">
                                  {meal.calories} kcal
                                </Badge>
                              )}
                            </div>
                            <ul className="mt-2 space-y-1">
                              {meal.foods?.map((food: string, fIdx: number) => (
                                <li key={fIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {/* Day Total */}
                  {dayData.meals && (
                    <Card className="p-3 bg-primary/5 border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total do Dia</span>
                        <Badge className="bg-primary">
                          {dayData.meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)} kcal
                        </Badge>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Workout Focus */}
                  <Card className="p-4 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{dayData.focus}</h4>
                          <p className="text-sm text-muted-foreground">{dayData.duration}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Exercises */}
                  {dayData.exercises?.length > 0 ? (
                    <div className="space-y-2">
                      {dayData.exercises.map((exercise: any, idx: number) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="font-medium text-foreground">{exercise.name}</h5>
                                {exercise.notes && (
                                  <p className="text-xs text-muted-foreground">💡 {exercise.notes}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {exercise.sets} × {exercise.reps}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 text-center bg-muted/30">
                      <p className="text-muted-foreground">
                        🧘 Dia de descanso - Faz alongamentos leves
                      </p>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
            💡 Dicas {planType === "meal" ? "Nutricionais" : "do Treinador"}
          </h4>
          <ul className="space-y-1">
            {plan.tips.map((tip: string, idx: number) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default WeeklyPlanDisplay;
