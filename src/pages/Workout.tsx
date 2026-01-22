import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Home, Play, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutSession from "@/components/WorkoutSession";
import MobileBottomNav from "@/components/MobileBottomNav";
import ExerciseGuide from "@/components/ExerciseGuide";
import { getTodayHomeExercises, getTodayGymExercises, getTodayTips, getDayName } from "@/data/rotatingContent";
import WorkoutChecklist from "@/components/WorkoutChecklist";
import { supabase } from "@/integrations/supabase/client";

// Componente para ilustrar exercícios com emoji/ícone inteligente
const ExerciseIllustration = ({ exerciseName }: { exerciseName: string }) => {
  const getIllustration = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Exercícios de pernas
    if (lowerName.includes("agachamento") || lowerName.includes("squat") || lowerName.includes("leg") || lowerName.includes("lunge") || lowerName.includes("cadeira")) {
      return { emoji: "🦵", bg: "from-orange-500/20 to-red-500/20", label: "Pernas" };
    }
    
    // Exercícios de peito
    if (lowerName.includes("flexão") || lowerName.includes("flexões") || lowerName.includes("push") || lowerName.includes("supino") || lowerName.includes("crucifixo")) {
      return { emoji: "💪", bg: "from-blue-500/20 to-cyan-500/20", label: "Peito" };
    }
    
    // Exercícios de core/abdómen
    if (lowerName.includes("prancha") || lowerName.includes("plank") || lowerName.includes("abdom") || lowerName.includes("dead bug") || lowerName.includes("bicicleta")) {
      return { emoji: "🧘", bg: "from-green-500/20 to-teal-500/20", label: "Core" };
    }
    
    // Exercícios de costas
    if (lowerName.includes("remada") || lowerName.includes("row") || lowerName.includes("costa") || lowerName.includes("puxada") || lowerName.includes("superman")) {
      return { emoji: "🔙", bg: "from-indigo-500/20 to-blue-500/20", label: "Costas" };
    }
    
    // Exercícios de ombros
    if (lowerName.includes("desenvolvimento") || lowerName.includes("ombro") || lowerName.includes("elevação") || lowerName.includes("militar")) {
      return { emoji: "🙆", bg: "from-amber-500/20 to-orange-500/20", label: "Ombros" };
    }
    
    // Exercícios de braços
    if (lowerName.includes("rosca") || lowerName.includes("bíceps") || lowerName.includes("tríceps") || lowerName.includes("dips") || lowerName.includes("francês") || lowerName.includes("testa")) {
      return { emoji: "💪", bg: "from-purple-500/20 to-pink-500/20", label: "Braços" };
    }
    
    // Cardio/HIIT
    if (lowerName.includes("jumping") || lowerName.includes("burpee") || lowerName.includes("mountain") || lowerName.includes("cardio") || lowerName.includes("esteira") || lowerName.includes("elíptico") || lowerName.includes("caminhada")) {
      return { emoji: "🏃", bg: "from-red-500/20 to-orange-500/20", label: "Cardio" };
    }
    
    // Alongamento/Recuperação
    if (lowerName.includes("alongamento") || lowerName.includes("yoga") || lowerName.includes("respiração") || lowerName.includes("rolo") || lowerName.includes("flexibilidade")) {
      return { emoji: "🧘‍♀️", bg: "from-teal-500/20 to-cyan-500/20", label: "Flexibilidade" };
    }
    
    // Glúteos
    if (lowerName.includes("glúteo") || lowerName.includes("quadril") || lowerName.includes("hip")) {
      return { emoji: "🍑", bg: "from-pink-500/20 to-rose-500/20", label: "Glúteos" };
    }
    
    // Padrão
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
  const [activeSession, setActiveSession] = useState<{
    isOpen: boolean;
    type: string;
    exercises: any[];
  }>({ isOpen: false, type: "", exercises: [] });

  const [goal, setGoal] = useState<"lose" | "maintain" | "gain" | null>(null);

  useEffect(() => {
    const loadGoal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .single();
      setGoal((data?.Objetivo as any) || null);
    };
    loadGoal();
  }, []);

  // Exercícios rotativos baseados no dia da semana
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

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Guia de Treinos
              </h1>
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{dayName}</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Treinos que mudam diariamente para maximizar resultados
            </p>
          </div>

          <div className="mb-6">
            <WorkoutChecklist goal={goal} />
          </div>

          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="home">
                <Home className="w-4 h-4 mr-2" />
                Treino em Casa
              </TabsTrigger>
              <TabsTrigger value="gym">
                <Dumbbell className="w-4 h-4 mr-2" />
                Treino no Ginásio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-4">
              <Card className="p-6 bg-secondary/10 border-secondary mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Treino Para Iniciantes
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Sem equipamento necessário • 30-40 minutos • 3-4x por semana
                </p>
                <Button variant="hero" size="sm" onClick={() => startWorkout("home")}>
                  <Play className="w-4 h-4 mr-2" />
                  Começar Treino
                </Button>
              </Card>

              {workouts.home.map((exercise, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <ExerciseIllustration exerciseName={exercise.name} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          #{idx + 1}
                        </span>
                        <span className="text-xs text-secondary font-medium">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          📊 {exercise.sets}
                        </span>
                        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
                          🔄 {exercise.reps}
                        </span>
                        <span className="px-2 py-1 bg-accent/10 text-accent-foreground rounded-full font-medium">
                          ⏱️ {exercise.rest}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExerciseGuide exerciseName={exercise.name} />
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="gym" className="space-y-4">
              <Card className="p-6 bg-primary/10 border-primary mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Treino Intermediário
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Equipamento de ginásio • 45-60 minutos • 4-5x por semana
                </p>
                <Button variant="hero" size="sm" onClick={() => startWorkout("gym")}>
                  <Play className="w-4 h-4 mr-2" />
                  Começar Treino
                </Button>
              </Card>

              {workouts.gym.map((exercise, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <ExerciseIllustration exerciseName={exercise.name} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          #{idx + 1}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          📊 {exercise.sets}
                        </span>
                        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
                          🔄 {exercise.reps}
                        </span>
                        <span className="px-2 py-1 bg-accent/10 text-accent-foreground rounded-full font-medium">
                          ⏱️ {exercise.rest}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExerciseGuide exerciseName={exercise.name} />
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Card className="p-6 mt-8 bg-accent/10">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              💡 Dicas de {dayName}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {todayTips.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
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