import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Home, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutSession from "@/components/WorkoutSession";
import MobileBottomNav from "@/components/MobileBottomNav";

const Workout = () => {
  const [activeSession, setActiveSession] = useState<{
    isOpen: boolean;
    type: string;
    exercises: any[];
  }>({ isOpen: false, type: "", exercises: [] });

  const workouts = {
    home: [
      {
        name: "Agachamentos",
        sets: "3 séries",
        reps: "15 repetições",
        rest: "60s descanso",
        description: "Exercício para pernas e glúteos",
      },
      {
        name: "Flexões",
        sets: "3 séries",
        reps: "10-15 repetições",
        rest: "60s descanso",
        description: "Trabalha peito, ombros e tríceps",
      },
      {
        name: "Prancha",
        sets: "3 séries",
        reps: "30-60 segundos",
        rest: "45s descanso",
        description: "Fortalece o core e abdómen",
      },
      {
        name: "Lunges",
        sets: "3 séries",
        reps: "12 repetições cada perna",
        rest: "60s descanso",
        description: "Trabalha pernas e equilíbrio",
      },
    ],
    gym: [
      {
        name: "Supino Reto",
        sets: "4 séries",
        reps: "8-12 repetições",
        rest: "90s descanso",
        description: "Principal exercício para peito",
      },
      {
        name: "Agachamento com Barra",
        sets: "4 séries",
        reps: "8-10 repetições",
        rest: "120s descanso",
        description: "Rei dos exercícios para pernas",
      },
      {
        name: "Remada Curvada",
        sets: "4 séries",
        reps: "10-12 repetições",
        rest: "90s descanso",
        description: "Desenvolve as costas",
      },
      {
        name: "Desenvolvimento com Halteres",
        sets: "3 séries",
        reps: "10-12 repetições",
        rest: "75s descanso",
        description: "Para ombros fortes",
      },
    ],
  };

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Guia de Treinos
            </h1>
            <p className="text-muted-foreground">
              Treinos adaptados ao teu objetivo e nível
            </p>
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
                <Card key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-secondary-foreground">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-primary">📊 {exercise.sets}</span>
                        <span className="text-secondary">
                          🔄 {exercise.reps}
                        </span>
                        <span className="text-accent">⏱️ {exercise.rest}</span>
                      </div>
                    </div>
                  </div>
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
                <Card key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-foreground">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-primary">📊 {exercise.sets}</span>
                        <span className="text-secondary">
                          🔄 {exercise.reps}
                        </span>
                        <span className="text-accent">⏱️ {exercise.rest}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Card className="p-6 mt-8 bg-accent/10">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              💡 Dicas Importantes
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Aquece sempre 5-10 minutos antes do treino</li>
              <li>• Mantém boa forma em todos os exercícios</li>
              <li>• Aumenta progressivamente a intensidade</li>
              <li>• Descansa adequadamente entre treinos</li>
              <li>• Hidrata-te bem durante e após o treino</li>
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