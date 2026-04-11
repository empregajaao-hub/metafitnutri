import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, Star, Lock } from 'lucide-react';

interface AchievementBadge {
  id: string;
  title_ptAO: string;
  description_ptAO: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationBadgesProps {
  streakDays: number;
  totalWorkouts: number;
  totalCalories: number;
}

const GamificationBadges: React.FC<GamificationBadgesProps> = ({
  streakDays,
  totalWorkouts,
  totalCalories,
}) => {
  const [badges, setBadges] = useState<AchievementBadge[]>([]);

  useEffect(() => {
    const newBadges: AchievementBadge[] = [
      {
        id: 'first-workout',
        title_ptAO: 'Primeiro Passo',
        description_ptAO: 'Completa o teu primeiro treino',
        icon: <Zap className="w-6 h-6" />,
        unlocked: totalWorkouts >= 1,
        progress: Math.min(totalWorkouts, 1),
        maxProgress: 1,
        rarity: 'common',
      },
      {
        id: 'week-warrior',
        title_ptAO: 'Guerreiro da Semana',
        description_ptAO: 'Treina 7 dias seguidos',
        icon: <Flame className="w-6 h-6" />,
        unlocked: streakDays >= 7,
        progress: Math.min(streakDays, 7),
        maxProgress: 7,
        rarity: 'rare',
      },
      {
        id: 'month-master',
        title_ptAO: 'Mestre do Mês',
        description_ptAO: 'Treina 30 dias seguidos',
        icon: <Trophy className="w-6 h-6" />,
        unlocked: streakDays >= 30,
        progress: Math.min(streakDays, 30),
        maxProgress: 30,
        rarity: 'epic',
      },
      {
        id: 'calorie-crusher',
        title_ptAO: 'Queimador de Calorias',
        description_ptAO: 'Queima 10.000 calorias totais',
        icon: <Flame className="w-6 h-6" />,
        unlocked: totalCalories >= 10000,
        progress: Math.min(totalCalories, 10000),
        maxProgress: 10000,
        rarity: 'epic',
      },
      {
        id: 'legend-status',
        title_ptAO: 'Status Lendário',
        description_ptAO: 'Treina 100 dias seguidos',
        icon: <Star className="w-6 h-6" />,
        unlocked: streakDays >= 100,
        progress: Math.min(streakDays, 100),
        maxProgress: 100,
        rarity: 'legendary',
      },
      {
        id: 'century-club',
        title_ptAO: 'Clube do Século',
        description_ptAO: 'Completa 100 treinos',
        icon: <Trophy className="w-6 h-6" />,
        unlocked: totalWorkouts >= 100,
        progress: Math.min(totalWorkouts, 100),
        maxProgress: 100,
        rarity: 'legendary',
      },
    ];

    setBadges(newBadges);
  }, [streakDays, totalWorkouts, totalCalories]);

  const getRarityColor = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return 'from-muted to-muted/50 border-muted/30 opacity-50';
    
    switch (rarity) {
      case 'common':
        return 'from-gray-500/20 to-gray-500/5 border-gray-500/30';
      case 'rare':
        return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      case 'epic':
        return 'from-purple-500/20 to-purple-500/5 border-purple-500/30';
      case 'legendary':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      default:
        return 'from-muted to-muted/50';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'rare':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Comum';
      case 'rare':
        return 'Raro';
      case 'epic':
        return 'Épico';
      case 'legendary':
        return 'Lendário';
      default:
        return 'Normal';
    }
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground">
          Conquistas
        </h3>
        <Badge variant="secondary" className="text-xs">
          {unlockedCount}/{badges.length}
        </Badge>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={badge.unlocked ? { scale: 1.05 } : {}}
          >
            <Card
              className={`relative overflow-hidden p-4 bg-gradient-to-br border-2 transition-all cursor-pointer group ${getRarityColor(
                badge.rarity,
                badge.unlocked
              )}`}
            >
              {/* Shine Effect */}
              {badge.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    badge.unlocked
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {badge.unlocked ? badge.icon : <Lock className="w-6 h-6" />}
                </div>

                {/* Title */}
                <h4 className="font-bold text-xs leading-tight text-foreground">
                  {badge.title_ptAO}
                </h4>

                {/* Rarity Badge */}
                <Badge
                  variant="outline"
                  className={`text-[8px] font-bold border capitalize ${getRarityBadgeColor(
                    badge.rarity
                  )}`}
                >
                  {getRarityLabel(badge.rarity)}
                </Badge>

                {/* Progress Bar */}
                {badge.progress !== undefined && badge.maxProgress && !badge.unlocked && (
                  <div className="w-full space-y-1">
                    <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${(badge.progress / badge.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-[8px] text-muted-foreground">
                      {badge.progress}/{badge.maxProgress}
                    </p>
                  </div>
                )}

                {/* Unlocked Checkmark */}
                {badge.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground text-center">
        Desbloqueia conquistas e sobe de nível. Partilha as tuas conquistas com amigos!
      </p>
    </div>
  );
};

export default GamificationBadges;
