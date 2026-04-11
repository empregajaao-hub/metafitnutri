import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, CheckCircle, SkipForward, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import RealisticWorkoutEngine from './RealisticWorkoutEngine';
import ExerciseAnimation from './ExerciseAnimation';
import PersonalTrainerMode from './PersonalTrainerMode';

interface Exercise {
  id: string;
  name_ptAO: string;
  category: string;
  difficulty: string;
  targetMuscles: string[];
  animationUrl: string;
  instructions_ptAO: string;
  tips_ptAO: string;
  duration: number;
  coach_cues: string[];
}

interface WorkoutPlayerProps {
  exercises: Exercise[];
  onComplete: (stats: { totalTime: number; exercisesCompleted: number }) => void;
  onClose: () => void;
}

const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ exercises, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.duration || 30);
  const [isResting, setIsResting] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const coachModeActive = true; // Treinador IA sempre ativo

  const currentExercise = exercises[currentIndex];
  const restDuration = 15;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
      
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        handleTimerEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, isResting]);

  const handleTimerEnd = () => {
    if (!isResting) {
      if (currentIndex < exercises.length - 1) {
        setIsResting(true);
        setTimeLeft(restDuration);
      } else {
        onComplete({ totalTime, exercisesCompleted: exercises.length });
      }
    } else {
      setIsResting(false);
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(exercises[currentIndex + 1]?.duration || 30);
    }
  };

  const skipExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(exercises[currentIndex + 1]?.duration || 30);
      setIsResting(false);
    } else {
      onComplete({ totalTime, exercisesCompleted: currentIndex + 1 });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + (isResting ? 0.5 : 0)) / exercises.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:p-6 overflow-y-auto">
      <PersonalTrainerMode 
        exerciseName={currentExercise.name_ptAO}
        isActive={coachModeActive && !isPaused}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <h2 className="font-bold text-lg">
            {isResting ? "Descanso" : currentExercise.name_ptAO}
          </h2>
          <p className="text-xs text-muted-foreground">
            Exercício {currentIndex + 1} de {exercises.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">🎯 Treinador IA</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-sm">
            <Timer className="w-4 h-4" />
            {formatTime(totalTime)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      <div className="flex-1 flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
        {/* Main Player Area */}
        <div className="relative">
          {!isResting ? (
            <RealisticWorkoutEngine
              exerciseId={currentExercise.id}
              animationUrl={currentExercise.animationUrl}
              coachCues={currentExercise.coach_cues}
              fallbackAnimation={<ExerciseAnimation exerciseName={currentExercise.name_ptAO} size="lg" />}
            />
          ) : (
            <div className="aspect-video bg-secondary/20 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-secondary/40">
              <p className="text-4xl font-black text-primary mb-2">{timeLeft}s</p>
              <p className="text-muted-foreground font-medium">Prepara-te para o próximo:</p>
              <p className="text-xl font-bold mt-1">{exercises[currentIndex + 1]?.name_ptAO}</p>
            </div>
          )}
        </div>

        {/* Exercise Info & Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {currentExercise.targetMuscles.map(muscle => (
                <span key={muscle} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {muscle}
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => setShowInfo(!showInfo)}>
              <Info className="w-4 h-4 mr-1" />
              Técnica
            </Button>
          </div>

          {showInfo && (
            <div className="bg-muted/50 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="font-bold text-sm mb-2">Como fazer:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentExercise.instructions_ptAO}
              </p>
              <div className="mt-3 p-2 bg-primary/5 border-l-2 border-primary rounded-r-lg">
                <p className="text-xs italic text-primary">
                  <strong>Dica:</strong> {currentExercise.tips_ptAO}
                </p>
              </div>
            </div>
          )}

          {/* Main Timer Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl font-black tracking-tighter text-foreground mb-2">
              {timeLeft}s
            </div>
            <div className="flex gap-4 w-full max-w-xs">
              <Button 
                className="flex-1 h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? "Retomar" : "Pausar"}
              </Button>
              <Button 
                variant="secondary" 
                className="h-14 w-14 rounded-2xl"
                onClick={skipExercise}
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Next Up) - Elegant Design */}
      {!isResting && currentIndex < exercises.length - 1 && (
        <div className="mt-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative group overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 hover:to-primary/20 p-4 rounded-3xl border border-primary/10 transition-all duration-500 shadow-sm hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ChevronRight className="w-12 h-12 text-primary" />
              </div>
              
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                    <ExerciseAnimation exerciseName={exercises[currentIndex + 1].name_ptAO} size="sm" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                    {currentIndex + 2}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Próximo Desafio</span>
                    <div className="h-px flex-1 bg-primary/10" />
                  </div>
                  <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {exercises[currentIndex + 1].name_ptAO}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {exercises[currentIndex + 1].targetMuscles.slice(0, 2).map(m => (
                      <span key={m} className="text-[9px] font-bold text-muted-foreground uppercase">{m}</span>
                    ))}
                  </div>
                </div>
                
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Duração</span>
                  <span className="text-sm font-black text-primary">{exercises[currentIndex + 1].duration}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default WorkoutPlayer;
