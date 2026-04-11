import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp, Play, Calendar, Clock } from 'lucide-react';

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
        'Cada movimento te aproxima do teu objetivo',
        'Queima calorias, ganha confiança',
        'O teu corpo vai agradecer',
      ],
      gain: [
        'Força vem do treino consistente',
        'Músculos crescem fora do ginásio',
        'Hoje é dia de ficar mais forte',
      ],
      maintain: [
        'Consistência é a chave',
        'Mantém o ritmo, mantém a forma',
        'Treino regular = vida melhor',
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                    {getGreeting()}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{getMotivationalQuote(objective)}"
                  </p>
                </div>
                <div className="text-5xl">{getObjectiveEmoji(objective)}</div>
              </div>
            </div>

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
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/10 dark:bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Meta
                </p>
                <p className="text-lg font-black text-foreground">{caloriesGoal}</p>
                <p className="text-[10px] text-muted-foreground">calorias</p>
              </div>
              <div className="bg-black/10 dark:bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Duração
                </p>
                <p className="text-lg font-black text-foreground">45</p>
                <p className="text-[10px] text-muted-foreground">minutos</p>
              </div>
              <div className="bg-black/10 dark:bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Intensidade
                </p>
                <p className="text-lg font-black text-foreground">🔥</p>
                <p className="text-[10px] text-muted-foreground">Moderada</p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onStartWorkout}
                className="w-full h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:shadow-primary/40 transition-all"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                Começar Treino Agora
              </Button>
            </motion.div>

            {/* Quick Info */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Sem equipamento necessário</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Treino IA Realista</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Secondary Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer group">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Progresso</p>
                <p className="font-bold text-sm text-foreground">{streakDays} dias seguidos</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumWorkoutHero;
