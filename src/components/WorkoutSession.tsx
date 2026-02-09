import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, CheckCircle, Timer, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExerciseAnimation from "./ExerciseAnimation";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  description: string;
}

interface WorkoutSessionProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  workoutType: string;
}

const WorkoutSession = ({ isOpen, onClose, exercises, workoutType }: WorkoutSessionProps) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const { toast } = useToast();

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = parseInt(currentExercise?.sets?.match(/\d+/)?.[0] || "3");
  const restSeconds = parseInt(currentExercise?.rest?.match(/\d+/)?.[0] || "60");

  // Timer para tempo total
  useEffect(() => {
    if (!isOpen || isComplete || isPaused) return;
    
    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isComplete, isPaused]);

  // Timer para descanso
  useEffect(() => {
    if (!isResting || isPaused) return;

    if (restTime <= 0) {
      setIsResting(false);
      toast({
        title: "Hora de treinar! 💪",
        description: "O descanso acabou. Vamos à próxima série!",
      });
      return;
    }

    const timer = setInterval(() => {
      setRestTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, restTime, isPaused, toast]);

  const handleCompleteSet = useCallback(() => {
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setRestTime(restSeconds);
      toast({
        title: `Série ${currentSet} concluída! ✅`,
        description: `Descansa ${restSeconds} segundos antes da próxima série.`,
      });
    } else {
      // Exercício completo
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTime(90);
        toast({
          title: `${currentExercise.name} concluído! 🎉`,
          description: "Descansa 90 segundos antes do próximo exercício.",
        });
      } else {
        // Treino completo
        setIsComplete(true);
        toast({
          title: "Treino Concluído! 🏆",
          description: `Parabéns! Completaste o treino em ${formatTime(totalTime)}.`,
        });
      }
    }
  }, [currentSet, totalSets, currentExerciseIndex, exercises.length, currentExercise, restSeconds, totalTime, toast]);

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      toast({
        title: "Exercício pulado",
        description: "A avançar para o próximo exercício.",
      });
    } else {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setIsResting(false);
    setRestTime(0);
    setIsPaused(false);
    setIsComplete(false);
    setTotalTime(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentExerciseIndex * totalSets + currentSet - 1) / (exercises.length * totalSets)) * 100;

  if (!currentExercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              {workoutType}
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              {formatTime(totalTime)}
            </div>
          </div>
        </DialogHeader>

        {isComplete ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Treino Concluído!</h3>
              <p className="text-muted-foreground">
                Completaste {exercises.length} exercícios em {formatTime(totalTime)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-primary">{exercises.length}</p>
                <p className="text-xs text-muted-foreground">Exercícios</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-secondary">{exercises.length * totalSets}</p>
                <p className="text-xs text-muted-foreground">Séries</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-accent">{formatTime(totalTime)}</p>
                <p className="text-xs text-muted-foreground">Tempo</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Repetir Treino
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Terminar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progresso geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{currentExerciseIndex + 1}/{exercises.length} exercícios</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Exercício atual */}
            {!isResting ? (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="text-center space-y-4">
                  {/* Animated Exercise Demo */}
                  <div className="flex justify-center">
                    <ExerciseAnimation exerciseName={currentExercise.name} size="lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{currentExercise.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentExercise.description}</p>
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-primary">Série</p>
                      <p className="text-lg font-bold text-foreground">{currentSet}/{totalSets}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-secondary">Reps</p>
                      <p className="text-lg font-bold text-foreground">{currentExercise.reps.replace(' repetições', '').replace(' cada perna', '')}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto relative">
                    <span className="text-3xl font-bold text-secondary-foreground">{restTime}</span>
                    <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${(restTime / restSeconds) * 226} 226`}
                        className="text-primary/30"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Tempo de Descanso</h3>
                    <p className="text-sm text-muted-foreground">
                      Prepara-te para a próxima série
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleSkipRest} size="sm">
                    <SkipForward className="w-4 h-4 mr-2" />
                    Pular Descanso
                  </Button>
                </div>
              </Card>
            )}

            {/* Botões de ação */}
            <div className="space-y-3">
              {!isResting && (
                <Button 
                  onClick={handleCompleteSet} 
                  className="w-full h-14 text-lg"
                  disabled={isPaused}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Concluir Série {currentSet}
                </Button>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex-1"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Retomar
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSkipExercise}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Pular
                </Button>
              </div>
            </div>

            {/* Lista de exercícios */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Próximos exercícios:</p>
              <div className="space-y-1">
                {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                      {currentExerciseIndex + idx + 2}
                    </span>
                    {ex.name}
                  </div>
                ))}
                {currentExerciseIndex + 3 < exercises.length && (
                  <p className="text-xs text-muted-foreground pl-7">
                    +{exercises.length - currentExerciseIndex - 3} mais...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutSession;
