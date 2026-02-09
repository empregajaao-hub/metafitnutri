import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Home, Play, Calendar, Lock, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutSession from "@/components/WorkoutSession";
import MobileBottomNav from "@/components/MobileBottomNav";
import ExerciseGuide from "@/components/ExerciseGuide";
import ExerciseAnimation from "@/components/ExerciseAnimation";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { getTodayHomeExercises, getTodayGymExercises, getTodayTips, getDayName } from "@/data/rotatingContent";
import WorkoutChecklist from "@/components/WorkoutChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .single();
      setGoal((profile?.Objetivo as any) || null);

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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="max-w-sm mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Acesso Restrito
            </h1>
            <p className="text-muted-foreground mb-8">
              O período de teste terminou. Subscreve um plano para aceder aos treinos.
            </p>
            <Button className="w-full" onClick={() => navigate("/subscription")}>
              Ver Planos
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Treinos</h1>
                <p className="text-xs text-muted-foreground">Exercícios diários</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {dayName}
          </Badge>
        </div>

        {/* Weekly Plan Generator */}
        <div className="mb-6">
          <WeeklyPlanGenerator type="workout" />
        </div>

        {/* Workout Checklist */}
        <div className="mb-6">
          <WorkoutChecklist goal={goal} />
        </div>

        {/* Workout Tabs */}
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/30">
            <TabsTrigger value="home" className="gap-2 text-sm">
              <Home className="w-4 h-4" />
              Casa
            </TabsTrigger>
            <TabsTrigger value="gym" className="gap-2 text-sm">
              <Dumbbell className="w-4 h-4" />
              Ginásio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-3">
            {/* Start Button */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Treino Para Iniciantes</h3>
                  <p className="text-xs text-muted-foreground">Sem equipamento • 30-40 min</p>
                </div>
                <Button size="sm" onClick={() => startWorkout("home")}>
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              </div>
            </Card>

            {workouts.home.map((exercise, idx) => (
              <Card key={idx} className="p-4 border-border/50 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <ExerciseAnimation exerciseName={exercise.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5">#{idx + 1}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5">{exercise.muscleGroup}</Badge>
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{exercise.description}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                      <span>•</span>
                      <span>{exercise.rest}</span>
                    </div>
                  </div>
                </div>
                <ExerciseGuide exerciseName={exercise.name} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="gym" className="space-y-3">
            {/* Start Button */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Treino Intermediário</h3>
                  <p className="text-xs text-muted-foreground">Equipamento • 45-60 min</p>
                </div>
                <Button size="sm" onClick={() => startWorkout("gym")}>
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              </div>
            </Card>

            {workouts.gym.map((exercise, idx) => (
              <Card key={idx} className="p-4 border-border/50 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <ExerciseAnimation exerciseName={exercise.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5">#{idx + 1}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5">{exercise.muscleGroup}</Badge>
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{exercise.description}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                      <span>•</span>
                      <span>{exercise.rest}</span>
                    </div>
                  </div>
                </div>
                <ExerciseGuide exerciseName={exercise.name} />
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="p-4 mt-6 bg-muted/30 border-border/50">
          <h3 className="font-medium text-foreground mb-2 text-sm">💡 Dicas de {dayName}</h3>
          <ul className="space-y-1">
            {todayTips.map((tip, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
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
