import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Heart,
  Brain,
} from "lucide-react";

interface KgelTrainerProps {
  gender: "masculino" | "feminino";
  onClose: () => void;
}

interface TrainingPhase {
  phase: "breathing" | "contraction" | "relaxation" | "rest";
  duration: number;
  instruction: string;
  detail: string;
}

const KgelTrainer: React.FC<KgelTrainerProps> = ({ gender, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const trainingPhases: TrainingPhase[] = [
    {
      phase: "breathing",
      duration: 3,
      instruction: "Respira Profundamente",
      detail: "Inspira pelo nariz, expira pela boca. Relaxa completamente.",
    },
    {
      phase: "contraction",
      duration: 5,
      instruction: "Contrai os Músculos",
      detail:
        gender === "masculino"
          ? "Contrai como se estivesses a parar o fluxo de urina. Mantém firme."
          : "Contrai a zona pélvica como se estivesses a segurar a urina. Força!",
    },
    {
      phase: "relaxation",
      duration: 3,
      instruction: "Relaxa Completamente",
      detail: "Deixa os músculos descansarem. Sem tensão.",
    },
    {
      phase: "rest",
      duration: 2,
      instruction: "Pausa Ativa",
      detail: "Respira normalmente. Prepara-te para a próxima série.",
    },
  ];

  const totalCycleDuration = trainingPhases.reduce((sum, p) => sum + p.duration, 0);
  const totalSessionDuration = totalCycleDuration * 10; // 10 ciclos

  useEffect(() => {
    setTimeRemaining(trainingPhases[0].duration);
    setTotalTime(totalSessionDuration);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhaseIndex = (currentPhaseIndex + 1) % trainingPhases.length;
          setCurrentPhaseIndex(nextPhaseIndex);

          // Check if session is complete
          if (nextPhaseIndex === 0) {
            setSessionsCompleted((prev) => prev + 1);
            if (sessionsCompleted + 1 >= 10) {
              setIsPlaying(false);
              return 0;
            }
          }

          return trainingPhases[nextPhaseIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentPhaseIndex, trainingPhases, sessionsCompleted]);

  const currentPhase = trainingPhases[currentPhaseIndex];
  const progress = ((sessionsCompleted * totalCycleDuration + (totalCycleDuration - timeRemaining)) / totalSessionDuration) * 100;

  const getPhaseColor = () => {
    switch (currentPhase.phase) {
      case "breathing":
        return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
      case "contraction":
        return "from-rose-500/20 to-rose-500/5 border-rose-500/30";
      case "relaxation":
        return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
      case "rest":
        return "from-purple-500/20 to-purple-500/5 border-purple-500/30";
      default:
        return "";
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase.phase) {
      case "breathing":
        return <Zap className="w-6 h-6 text-blue-500" />;
      case "contraction":
        return <Heart className="w-6 h-6 text-rose-500" />;
      case "relaxation":
        return <Brain className="w-6 h-6 text-emerald-500" />;
      case "rest":
        return <Pause className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const handleSkipPhase = () => {
    const nextPhaseIndex = (currentPhaseIndex + 1) % trainingPhases.length;
    setCurrentPhaseIndex(nextPhaseIndex);
    setTimeRemaining(trainingPhases[nextPhaseIndex].duration);
  };

  const handlePreviousPhase = () => {
    const prevPhaseIndex = currentPhaseIndex === 0 ? trainingPhases.length - 1 : currentPhaseIndex - 1;
    setCurrentPhaseIndex(prevPhaseIndex);
    setTimeRemaining(trainingPhases[prevPhaseIndex].duration);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-gradient-to-br from-background via-background to-secondary/5 border-primary/20 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-background to-background/80 backdrop-blur-md border-b border-border/50 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Sessão Kegel Guiada</h2>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                Treinador IA Profissional
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Main Training Area */}
          <div className="p-8 space-y-8">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Progresso da Sessão
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-muted" />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Série {sessionsCompleted + 1} de 10</span>
                <span>{Math.floor(totalTime / 60)}m {totalTime % 60}s total</span>
              </div>
            </div>

            {/* Current Phase Card */}
            <motion.div
              key={currentPhaseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`bg-gradient-to-br ${getPhaseColor()} p-8 border-2 relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 opacity-10 -mr-8 -mt-8">
                  {getPhaseIcon()}
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Phase Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      {getPhaseIcon()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{currentPhase.instruction}</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {currentPhase.phase === "breathing"
                          ? "Preparação"
                          : currentPhase.phase === "contraction"
                          ? "Esforço"
                          : currentPhase.phase === "relaxation"
                          ? "Recuperação"
                          : "Descanso"}
                      </p>
                    </div>
                  </div>

                  {/* Timer Circle */}
                  <div className="flex justify-center py-8">
                    <motion.div
                      key={timeRemaining}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-32 h-32 flex items-center justify-center"
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted/20"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="text-primary"
                          initial={{ strokeDasharray: "377", strokeDashoffset: "377" }}
                          animate={{
                            strokeDashoffset:
                              377 - (377 * (currentPhase.duration - timeRemaining)) / currentPhase.duration,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </svg>
                      <div className="text-center">
                        <div className="text-5xl font-black text-primary">
                          {timeRemaining}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                          segundos
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Instruction */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-sm leading-relaxed text-center font-medium">
                      {currentPhase.detail}
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed text-center font-medium">
                      {currentPhase.phase === "breathing"
                        ? "Respira profundamente para oxigenar os músculos."
                        : currentPhase.phase === "contraction"
                        ? "Contrai com força, mas mantém a respiração normal."
                        : currentPhase.phase === "relaxation"
                        ? "Deixa os músculos descansarem completamente."
                        : "Aproveita para respirar e preparar-te para a próxima série."}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Séries
                  </p>
                  <p className="text-2xl font-black text-primary">{sessionsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">de 10</p>
                </div>
              </Card>
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Fase Atual
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {currentPhaseIndex + 1}
                  </p>
                  <p className="text-[10px] text-muted-foreground">de 4</p>
                </div>
              </Card>
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Tempo
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {Math.floor((totalSessionDuration - (totalTime - timeRemaining)) / 60)}:{String((totalSessionDuration - (totalTime - timeRemaining)) % 60).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">decorrido</p>
                </div>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {sessionsCompleted === 0 ? "Começar Treino" : "Retomar"}
                  </>
                )}
              </motion.button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePreviousPhase}
                  className="flex-1 rounded-xl h-12"
                >
                  <SkipBack className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkipPhase}
                  className="flex-1 rounded-xl h-12"
                >
                  Próxima
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-full rounded-xl h-12"
              >
                <Volume2 className={`w-4 h-4 mr-2 ${soundEnabled ? "text-primary" : "text-muted-foreground"}`} />
                {soundEnabled ? "Som Ativado" : "Som Desativado"}
              </Button>
            </div>

            {/* Completion Message */}
            {sessionsCompleted >= 10 && !isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-6 text-center space-y-3"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-emerald-600">Parabéns! 🎉</h4>
                  <p className="text-sm text-emerald-600/80 mt-2">
                    Completaste a sessão de treino Kegel com sucesso!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default KgelTrainer;
