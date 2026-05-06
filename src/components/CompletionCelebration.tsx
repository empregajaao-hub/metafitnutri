import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Share2, RotateCcw } from 'lucide-react';

interface CompletionCelebrationProps {
  totalTime: number;
  exercisesCompleted: number;
  caloriesBurned: number;
  newStreak?: boolean;
  streakDays?: number;
  onClose: () => void;
  onRepeat: () => void;
}

const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  totalTime,
  exercisesCompleted,
  caloriesBurned,
  newStreak = false,
  streakDays = 0,
  onClose,
  onRepeat,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 200 },
    },
  };

  const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* Confetti */}
      {showConfetti &&
        confettiPieces.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 1, y: -20, x: 0 }}
            animate={{ opacity: 0, y: 400, x: (Math.random() - 0.5) * 200 }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'easeIn',
            }}
            className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none"
            style={{ left: `${piece.left}%` }}
          />
        ))}

      {/* Main Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />

          <div className="relative z-10 space-y-6 text-center">
            {/* Trophy Icon */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                <Trophy className="w-10 h-10 text-white fill-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-black text-foreground mb-2">
                Treino Completo!
              </h2>
              <p className="text-muted-foreground">Excelente trabalho hoje!</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Tempo
                </p>
                <p className="text-xl font-black text-primary">
                  {formatTime(totalTime)}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Exercícios
                </p>
                <p className="text-xl font-black text-secondary">
                  {exercisesCompleted}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Calorias
                </p>
                <p className="text-xl font-black text-accent">
                  {caloriesBurned}
                </p>
              </div>
            </motion.div>

            {/* Streak Badge */}
            {newStreak && streakDays > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <Badge className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-sm font-bold">
                  🔥 {streakDays} dias seguidos!
                </Badge>
              </motion.div>
            )}

            {/* Motivational Message */}
            <motion.div variants={itemVariants} className="bg-primary/10 p-4 rounded-xl border border-primary/20">
              <p className="text-sm font-semibold text-foreground">
                {streakDays > 7
                  ? 'Estás a ser incrível! Mantém esse ritmo! 💪'
                  : streakDays > 3
                  ? 'Ótimo trabalho! Já estás num bom caminho! 🚀'
                  : 'Que começo fantástico! Continua assim! ⭐'}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-lg h-12 font-bold"
                onClick={onClose}
              >
                <span>Fechar</span>
              </Button>
              <Button
                className="flex-1 rounded-lg h-12 font-bold"
                onClick={onRepeat}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Repetir
              </Button>
            </motion.div>

            {/* Share Button */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="w-full text-primary hover:bg-primary/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partilhar Conquista
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CompletionCelebration;
