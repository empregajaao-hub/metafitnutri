import { useEffect, useState } from "react";
import SubscriptionWall from "@/components/SubscriptionWall";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import PremiumWorkoutPage from "@/components/PremiumWorkoutPage";
import exercisesData from "@/data/exercises.json";
import { useToast } from "@/hooks/use-toast";
import { getTodayHomeExercises, getTodayGymExercises } from "@/data/rotatingContent";

const Workout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<{
    isOpen: boolean;
    exercises: any[];
  }>({ isOpen: false, exercises: [] });

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

  const workouts = {
    home: getTodayHomeExercises(),
    gym: getTodayGymExercises()
  };

  const startRealisticWorkout = (type: "home" | "gym") => {
    const selectedExercises = workouts[type].map(ex => {
      const realisticEx = exercisesData.find(re => 
        re.name_ptAO.toLowerCase().includes(ex.name.toLowerCase()) || 
        ex.name.toLowerCase().includes(re.name_ptAO.toLowerCase())
      );
      
      if (realisticEx) return realisticEx;
      
      return {
        id: ex.name.toLowerCase().replace(/\s+/g, '-'),
        name_ptAO: ex.name,
        category: type,
        difficulty: "Normal",
        targetMuscles: [ex.muscleGroup],
        animationUrl: "",
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
    <>
      <PremiumWorkoutPage 
        onStartWorkout={startRealisticWorkout}
        onClose={() => navigate(-1)}
      />
      <MobileBottomNav />
    </>
  );
};

export default Workout;
