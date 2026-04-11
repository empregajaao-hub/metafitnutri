import { useEffect, useState } from "react";
import SubscriptionWall from "@/components/SubscriptionWall";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Home, Play, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileBottomNav from "@/components/MobileBottomNav";
import ExerciseAnimation from "@/components/ExerciseAnimation";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { getTodayHomeExercises, getTodayGymExercises, getTodayTips, getDayName } from "@/data/rotatingContent";
import WorkoutChecklist from "@/components/WorkoutChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import exercisesData from "@/data/exercises.json";
import { useToast } from "@/hooks/use-toast";

const Workout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<{
    isOpen: boolean;
    exercises: any[];
  }>({ isOpen: false, exercises: [] });

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

  const startRealisticWorkout = (type: "home" | "gym") => {
    // Map existing exercises to our new realistic exercise data
    const selectedExercises = workouts[type].map(ex => {
      const realisticEx = exercisesData.find(re => 
        re.name_ptAO.toLowerCase().includes(ex.name.toLowerCase()) || 
        ex.name.toLowerCase().includes(re.name_ptAO.toLowerCase())
      );
      
      if (realisticEx) return realisticEx;
      
      // Fallback if not found in our new JSON
      return {
        id: ex.name.toLowerCase().replace(/\s+/g, '-'),
        name_ptAO: ex.name,
        category: type,
        difficulty: "Normal",
        targetMuscles: [ex.muscleGroup],
        animationUrl: "", // Will trigger fallback
        instructions_ptAO: ex.description,
        tips_ptAO: "Mantém a postura correta.",
        duration: 45,
        coach_cues: ["Força!", "Respira bem", "Estás a fazer bem!"]
      };
    });

    setActiveSession({
      isOpen: true,
      exercises: selectedExercises,
    });
  };

  const handleWorkoutComplete = (stats: { totalTime: number; exercisesCompleted: number }) => {
    setActiveSession({ ...activeSession, isOpen: false });
    toast({
      title: "Treino Concluído! 🏆",
      description: `Parabéns! Completaste ${stats.exercisesCompleted} exercícios em ${Math.floor(stats.totalTime / 60)}m ${stats.totalTime % 60}s.`,
    });
    // Here we could also save to Supabase history
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full mb-6">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SubscriptionWall feature="Treinos" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (activeSession.isOpen) {
    return (
      <WorkoutPlayer 
        exercises={activeSession.exercises}
        onClose={() => setActiveSession({ ...activeSession, isOpen: false })}
        onComplete={handleWorkoutComplete}
      />
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
                <p className="text-xs text-muted-foreground">Experiência IA Realista</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {dayName}
          </Badge>
        </div>

        {/* AI Coach Banner */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Treinador IA Ativado</h3>
              <p className="text-[10px] text-muted-foreground">Vídeos realistas e correções em tempo real (pt-AO)</p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
        </Card>

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
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Treino do Dia</h3>
                  <p className="text-[10px] text-muted-foreground">Foco em {goal === 'lose' ? 'Queima de Gordura' : 'Tonificação'}</p>
                </div>
                <Button size="sm" onClick={() => startRealisticWorkout("home")} className="rounded-full px-6">
                  <Play className="w-4 h-4 mr-1 fill-current" />
                  Começar
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
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{exercise.description}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="gym" className="space-y-3">
            {/* Start Button */}
            <Card className="p-4 bg-secondary/5 border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Treino de Ginásio</h3>
                  <p className="text-[10px] text-muted-foreground">Hipertrofia e Força</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => startRealisticWorkout("gym")} className="rounded-full px-6">
                  <Play className="w-4 h-4 mr-1 fill-current" />
                  Começar
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
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{exercise.description}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                    </div>
                  </div>
                </div>
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

      <MobileBottomNav />
    </div>
  );
};

export default Workout;
