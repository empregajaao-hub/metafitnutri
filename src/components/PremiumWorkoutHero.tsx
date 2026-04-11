import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp, Play, Calendar, Clock, Dumbbell, Heart } from 'lucide-react';

interface PremiumWorkoutHeroProps {
  objective: 'lose' | 'maintain' | 'gain' | null;
  dayOfWeek: number;
  onStartWorkout: () => void;
  streakDays?: number;
  caloriesGoal?: number;
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const PremiumWorkoutHero: React.FC<PremiumWorkoutHeroProps> = ({
  objective,
  dayOfWeek,
  onStartWorkout,
  streakDays = 0,
  caloriesGoal = 500,
}) => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getObjectiveEmoji = (obj: string | null) => {
    switch (obj) {
      case 'lose':
        return '🔥';
      case 'gain':
        return '💪';
      case 'maintain':
        return '⚖️';
      default:
        return '🏋️';
    }
  };

  const getObjectiveTitle = (obj: string | null) => {
    switch (obj) {
      case 'lose':
        return 'Perda de Peso';
      case 'gain':
        return 'Ganho Muscular';
      case 'maintain':
        return 'Manutenção';
      default:
        return 'Treino';
    }
  };

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Bom dia! Hora de acordar o corpo';
      case 'afternoon':
        return 'Boa tarde! Vamos queimar energia';
      case 'evening':
        return 'Boa noite! Último treino do dia';
      default:
        return 'Vamos treinar!';
    }
  };

  const getMotivationalQuote = (obj: string | null) => {
    const quotes = {
      lose: [
        'Cada treino é um passo para o teu objetivo! 💪',
        'Queima calorias, ganha confiança! 🔥',
        'O teu corpo agradece cada esforço! ⚡',
        'Consistência é o segredo do sucesso! 🎯',
      ],
      gain: [
        'Levanta pesado, cresce forte! 💪',
        'Cada repetição constrói músculos! 🏋️',
        'Força vem com dedicação! ⚡',
        'Hoje é dia de ganhar massa! 🚀',
      ],
      maintain: [
        'Mantém a forma, vive melhor! ⚖️',
        'Consistência é a chave! 🔑',
        'Treina para a tua saúde! 💚',
        'Equilíbrio perfeito! ✨',
      ],
    };

    const objQuotes = obj ? quotes[obj as keyof typeof quotes] : [];
    return objQuotes[Math.floor(Math.random() * objQuotes.length)] || 'Vamos treinar!';
  };

  return (
    <div className="relative space-y-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 border-primary/20 p-6 md:p-8">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative z-10 space-y-6">
            {/* Greeting Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                    {getGreeting()}
                  </h2>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl"
                >
                  {getObjectiveEmoji(objective)}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-primary/10 backdrop-blur-sm"
              >
                <span className="text-2xl flex-shrink-0">✨</span>
                <p className="text-sm text-foreground font-semibold leading-relaxed">
                  {getMotivationalQuote(objective)}
                </p>
              </motion.div>
            </motion.div>

            {/* Objective Badge & Info */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="px-3 py-1.5 text-sm font-bold bg-primary/20 text-primary border-primary/30">
                {getObjectiveTitle(objective)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {dayNames[dayOfWeek]}
              </Badge>
              {streakDays > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-700 border-orange-500/30">
                  <Flame className="w-3 h-3 mr-1" />
                  {streakDays} dias
                </Badge>
              )}
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex justify-center mb-2">
                  <Flame className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Meta
                </p>
                <p className="text-lg font-black text-foreground">{caloriesGoal}</p>
                <p className="text-[10px] text-muted-foreground">calorias</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Duração
                </p>
                <p className="text-lg font-black text-foreground">45</p>
                <p className="text-[10px] text-muted-foreground">minutos</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex justify-center mb-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Intensidade
                </p>
                <p className="text-lg font-black text-foreground">Alta</p>
                <p className="text-[10px] text-muted-foreground">Máxima Queima</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onStartWorkout}
                className="w-full h-14 text-base font-black rounded-xl shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/40 transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Começar Treino Agora
              </Button>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>Personalizado para ti</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Treino IA Premium</span>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Secondary Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="p-4 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Objetivo</p>
              <p className="font-bold text-sm text-foreground">{getObjectiveTitle(objective)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Progresso</p>
              <p className="font-bold text-sm text-foreground">{streakDays} dias 🔥</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PremiumWorkoutHero;
