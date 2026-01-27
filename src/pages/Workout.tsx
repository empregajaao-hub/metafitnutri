import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Home, Play, Calendar, Lock, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutSession from "@/components/WorkoutSession";
import MobileBottomNav from "@/components/MobileBottomNav";
import ExerciseGuide from "@/components/ExerciseGuide";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { getTodayHomeExercises, getTodayGymExercises, getTodayTips, getDayName } from "@/data/rotatingContent";
import WorkoutChecklist from "@/components/WorkoutChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Componente para ilustrar exercícios com emoji/ícone inteligente
const ExerciseIllustration = ({ exerciseName }: { exerciseName: string }) => {
  const getIllustration = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("agachamento") || lowerName.includes("squat") || lowerName.includes("leg") || lowerName.includes("lunge") || lowerName.includes("cadeira")) {
      return { emoji: "🦵", bg: "from-destructive/20 to-destructive/10", label: "Pernas" };
    }
    if (lowerName.includes("flexão") || lowerName.includes("flexões") || lowerName.includes("push") || lowerName.includes("supino") || lowerName.includes("crucifixo")) {
      return { emoji: "💪", bg: "from-primary/20 to-secondary/20", label: "Peito" };
    }
    if (lowerName.includes("prancha") || lowerName.includes("plank") || lowerName.includes("abdom") || lowerName.includes("dead bug") || lowerName.includes("bicicleta")) {
      return { emoji: "🧘", bg: "from-accent/20 to-accent/10", label: "Core" };
    }
    if (lowerName.includes("remada") || lowerName.includes("row") || lowerName.includes("costa") || lowerName.includes("puxada") || lowerName.includes("superman")) {
      return { emoji: "🔙", bg: "from-secondary/20 to-primary/20", label: "Costas" };
    }
    if (lowerName.includes("desenvolvimento") || lowerName.includes("ombro") || lowerName.includes("elevação") || lowerName.includes("militar")) {
      return { emoji: "🙆", bg: "from-muted/30 to-muted/20", label: "Ombros" };
    }
    if (lowerName.includes("rosca") || lowerName.includes("bíceps") || lowerName.includes("tríceps") || lowerName.includes("dips") || lowerName.includes("francês") || lowerName.includes("testa")) {
      return { emoji: "💪", bg: "from-secondary/20 to-accent/20", label: "Braços" };
    }
    if (lowerName.includes("jumping") || lowerName.includes("burpee") || lowerName.includes("mountain") || lowerName.includes("cardio") || lowerName.includes("esteira") || lowerName.includes("elíptico") || lowerName.includes("caminhada")) {
      return { emoji: "🏃", bg: "from-destructive/20 to-muted/20", label: "Cardio" };
    }
    if (lowerName.includes("alongamento") || lowerName.includes("yoga") || lowerName.includes("respiração") || lowerName.includes("rolo") || lowerName.includes("flexibilidade")) {
      return { emoji: "🧘‍♀️", bg: "from-accent/20 to-primary/20", label: "Flexibilidade" };
    }
    if (lowerName.includes("glúteo") || lowerName.includes("quadril") || lowerName.includes("hip")) {
      return { emoji: "🍑", bg: "from-secondary/20 to-muted/20", label: "Glúteos" };
    }
    
    return { emoji: "💪", bg: "from-primary/20 to-secondary/20", label: "Treino" };
  };

  const { emoji, bg, label } = getIllustration(exerciseName);

  return (
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bg} flex flex-col items-center justify-center shrink-0 border border-border/50`}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-[8px] font-medium text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
};

const Workout = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<{
    isOpen: boolean;
    type: string;
    exercises: any[];
  }>({ isOpen: false, type: "", exercises: [] });

  const [goal, setGoal] = useState<"lose" | "maintain" | "gain" | null>(null);
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

      // Get profile goal
      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .single();
      setGoal((profile?.Objetivo as any) || null);

      // Check subscription
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

  const workouts = {
    home: getTodayHomeExercises(),
    gym: getTodayGymExercises()
  };
  
  const todayTips = getTodayTips();
  const dayName = getDayName();

  const startWorkout = (type: "home" | "gym") => {
    setActiveSession({
      isOpen: true,
      type: type === "home" ? "Treino em Casa" : "Treino no Ginásio",
      exercises: workouts[type],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-primary">A carregar...</div>
      </div>
    );
  }

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
                O período de teste terminou. Subscreve um plano para aceder aos planos de treino personalizados.
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Guia de Treinos
                  </h1>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Treinos que mudam diariamente para maximizar resultados
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Calendar className="w-3 h-3 mr-1" />
                {dayName}
              </Badge>
            </div>
          </div>

          {/* Weekly Plan Generator */}
          <div className="mb-8">
            <WeeklyPlanGenerator type="workout" />
          </div>

          {/* Workout Checklist */}
          <div className="mb-6">
            <WorkoutChecklist goal={goal} />
          </div>

          {/* Workout Tabs */}
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="home" className="gap-2">
                <Home className="w-4 h-4" />
                Treino em Casa
              </TabsTrigger>
              <TabsTrigger value="gym" className="gap-2">
                <Dumbbell className="w-4 h-4" />
                Treino no Ginásio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-4">
              <Card className="p-6 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Treino Para Iniciantes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sem equipamento • 30-40 min • 3-4x por semana
                    </p>
                  </div>
                  <Button variant="hero" size="sm" onClick={() => startWorkout("home")}>
                    <Play className="w-4 h-4 mr-2" />
                    Começar
                  </Button>
                </div>
              </Card>

              {workouts.home.map((exercise, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <ExerciseIllustration exerciseName={exercise.name} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{idx + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {exercise.muscleGroup}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge className="bg-primary/10 text-primary border-0">
                          📊 {exercise.sets}
                        </Badge>
                        <Badge className="bg-secondary/10 text-secondary border-0">
                          🔄 {exercise.reps}
                        </Badge>
                        <Badge className="bg-accent/10 text-accent-foreground border-0">
                          ⏱️ {exercise.rest}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ExerciseGuide exerciseName={exercise.name} />
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="gym" className="space-y-4">
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Treino Intermediário
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Equipamento de ginásio • 45-60 min • 4-5x por semana
                    </p>
                  </div>
                  <Button variant="hero" size="sm" onClick={() => startWorkout("gym")}>
                    <Play className="w-4 h-4 mr-2" />
                    Começar
                  </Button>
                </div>
              </Card>

              {workouts.gym.map((exercise, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <ExerciseIllustration exerciseName={exercise.name} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{idx + 1}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">
                          {exercise.muscleGroup}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge className="bg-primary/10 text-primary border-0">
                          📊 {exercise.sets}
                        </Badge>
                        <Badge className="bg-secondary/10 text-secondary border-0">
                          🔄 {exercise.reps}
                        </Badge>
                        <Badge className="bg-accent/10 text-accent-foreground border-0">
                          ⏱️ {exercise.rest}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ExerciseGuide exerciseName={exercise.name} />
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Tips Card */}
          <Card className="p-6 mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              💡 Dicas de {dayName}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {todayTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <WorkoutSession
        isOpen={activeSession.isOpen}
        onClose={() => setActiveSession({ ...activeSession, isOpen: false })}
        exercises={activeSession.exercises}
        workoutType={activeSession.type}
      />
      
      <MobileBottomNav />
    </div>
  );
};

export default Workout;
