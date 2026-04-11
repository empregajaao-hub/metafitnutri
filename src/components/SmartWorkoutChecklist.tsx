import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Flame, Zap, Target, Trophy, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChecklistItem {
  id: string;
  title_ptAO: string;
  description_ptAO: string;
  icon: React.ReactNode;
  points: number;
  completed: boolean;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SmartWorkoutChecklistProps {
  objective: 'lose' | 'maintain' | 'gain' | null;
  dayOfWeek: number; // 0-6
}

const SmartWorkoutChecklist: React.FC<SmartWorkoutChecklistProps> = ({ objective, dayOfWeek }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Gerar checklist baseado no objetivo
  useEffect(() => {
    const items = generateChecklistByObjective(objective, dayOfWeek);
    setChecklist(items);
    calculateStats(items);
  }, [objective, dayOfWeek]);

  const generateChecklistByObjective = (obj: string | null, day: number): ChecklistItem[] => {
    const baseItems: ChecklistItem[] = [
      {
        id: 'warmup',
        title_ptAO: 'Aquecimento (5 min)',
        description_ptAO: 'Prepara o corpo com alongamentos leves',
        icon: <Zap className="w-5 h-5" />,
        points: 10,
        completed: false,
        category: 'essencial',
        difficulty: 'easy',
      },
      {
        id: 'main-workout',
        title_ptAO: 'Treino Principal',
        description_ptAO: 'Complete todos os exercícios do dia',
        icon: <Flame className="w-5 h-5" />,
        points: 50,
        completed: false,
        category: 'essencial',
        difficulty: 'hard',
      },
      {
        id: 'cooldown',
        title_ptAO: 'Arrefecimento (5 min)',
        description_ptAO: 'Alongamentos e respiração profunda',
        icon: <Sparkles className="w-5 h-5" />,
        points: 10,
        completed: false,
        category: 'essencial',
        difficulty: 'easy',
      },
    ];

    // Adicionar itens específicos por objetivo
    if (obj === 'lose') {
      baseItems.push(
        {
          id: 'cardio-bonus',
          title_ptAO: 'Cardio Extra (10 min)',
          description_ptAO: 'Caminhada rápida ou corrida leve',
          icon: <Flame className="w-5 h-5" />,
          points: 30,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
        },
        {
          id: 'water-intake',
          title_ptAO: 'Hidratação (2L)',
          description_ptAO: 'Bebe água suficiente durante o treino',
          icon: <Zap className="w-5 h-5" />,
          points: 15,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
        },
        {
          id: 'nutrition-log',
          title_ptAO: 'Regista Refeição Pós-Treino',
          description_ptAO: 'Documenta o que comeste após treino',
          icon: <Target className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
        }
      );
    } else if (obj === 'gain') {
      baseItems.push(
        {
          id: 'strength-focus',
          title_ptAO: 'Foco em Força',
          description_ptAO: 'Levanta pesos com boa forma',
          icon: <Trophy className="w-5 h-5" />,
          points: 40,
          completed: false,
          category: 'bonus',
          difficulty: 'hard',
        },
        {
          id: 'protein-intake',
          title_ptAO: 'Proteína Pós-Treino',
          description_ptAO: 'Consome proteína nos próximos 30 min',
          icon: <Zap className="w-5 h-5" />,
          points: 25,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
        },
        {
          id: 'rest-day-check',
          title_ptAO: 'Dia de Descanso Respeitado',
          description_ptAO: 'Garante recuperação adequada',
          icon: <Sparkles className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
        }
      );
    } else {
      baseItems.push(
        {
          id: 'consistency',
          title_ptAO: 'Consistência Diária',
          description_ptAO: 'Mantém rotina de treino regular',
          icon: <Trophy className="w-5 h-5" />,
          points: 25,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
        },
        {
          id: 'flexibility',
          title_ptAO: 'Flexibilidade',
          description_ptAO: 'Trabalha mobilidade e alongamento',
          icon: <Sparkles className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
        }
      );
    }

    return baseItems;
  };

  const calculateStats = (items: ChecklistItem[]) => {
    const completed = items.filter(i => i.completed).length;
    const points = items.reduce((sum, i) => sum + (i.completed ? i.points : 0), 0);
    setCompletedCount(completed);
    setTotalPoints(points);
  };

  const toggleItem = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    calculateStats(updated);
  };

  const essentialItems = checklist.filter(i => i.category === 'essencial');
  const bonusItems = checklist.filter(i => i.category === 'bonus');
  const essentialCompleted = essentialItems.filter(i => i.completed).length;
  const maxPoints = checklist.reduce((sum, i) => sum + i.points, 0);
  const progressPercent = (totalPoints / maxPoints) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'from-green-500/20 to-green-500/5 border-green-500/30';
      case 'medium':
        return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      case 'hard':
        return 'from-red-500/20 to-red-500/5 border-red-500/30';
      default:
        return 'from-muted to-muted/50';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {      case 'easy':
        return { label: 'Fácil', color: 'bg-green-500/20 text-green-700 border-green-500/30' };
      case 'medium':
        return { label: 'Médio', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' };
      case 'hard':
        return { label: 'Difícil', color: 'bg-red-500/20 text-red-700 border-red-500/30' };
      default:
        return { label: 'Normal', color: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Pontos */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 border border-primary/20 p-6">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-1">
                Checklist de Hoje
              </h3>
              <p className="text-3xl font-black text-foreground">
                {totalPoints} <span className="text-lg text-primary">pts</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Progresso</p>
              <p className="text-2xl font-black text-primary">
                {completedCount}/{checklist.length}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercent)}% concluído • {maxPoints - totalPoints} pts restantes
            </p>
          </div>
        </div>
      </div>

      {/* Seção Essencial */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Flame className="w-5 h-5 text-red-500" />
          <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
            Essencial ({essentialCompleted}/{essentialItems.length})
          </h4>
        </div>
        
        <div className="space-y-2">
          {essentialItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all border-2 bg-gradient-to-br ${getDifficultyColor(
                  item.difficulty
                )} ${
                  item.completed
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/50 hover:border-primary/30'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {item.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </motion.div>
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 text-primary">
                        {item.icon}
                      </div>
                      <h5 className={`font-bold text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.title_ptAO}
                      </h5>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.description_ptAO}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold border ${getDifficultyBadge(item.difficulty).color}`}
                      >
                        {getDifficultyBadge(item.difficulty).label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        +{item.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seção Bónus */}
      {bonusItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-5 h-5 text-accent" />
            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
              Bónus ({bonusItems.filter(i => i.completed).length}/{bonusItems.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {bonusItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (essentialItems.length + idx) * 0.05 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all border-2 bg-gradient-to-br ${getDifficultyColor(
                    item.difficulty
                  )} ${
                    item.completed
                      ? 'border-accent/50 bg-accent/5'
                      : 'border-border/50 hover:border-accent/30'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {item.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-accent" />
                        </motion.div>
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 text-accent">
                          {item.icon}
                        </div>
                        <h5 className={`font-bold text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title_ptAO}
                        </h5>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description_ptAO}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold border ${getDifficultyBadge(item.difficulty).color}`}
                        >
                          {getDifficultyBadge(item.difficulty).label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-accent/20 text-accent border-accent/30">
                          +{item.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Motivação */}
      {completedCount === checklist.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 p-6 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          <div className="relative z-10">
            <p className="text-3xl mb-2">🎉</p>
            <h4 className="font-black text-lg text-foreground mb-1">Treino Completo!</h4>
            <p className="text-sm text-muted-foreground">
              Excelente trabalho! Ganhaste {totalPoints} pontos hoje.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartWorkoutChecklist;
