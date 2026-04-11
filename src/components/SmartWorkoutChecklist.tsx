import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Flame, Zap, Target, Trophy, Sparkles, Lock, Star, Zap as ZapIcon, Heart, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
  id: string;
  title_ptAO: string;
  description_ptAO: string;
  icon: React.ReactNode;
  points: number;
  completed: boolean;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji?: string;
}

interface SmartWorkoutChecklistProps {
  objective: 'lose' | 'maintain' | 'gain' | null;
  dayOfWeek: number;
}

const SmartWorkoutChecklist: React.FC<SmartWorkoutChecklistProps> = ({ objective, dayOfWeek }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

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
        title_ptAO: 'Aquecimento Dinâmico',
        description_ptAO: 'Prepara o corpo com alongamentos e mobilidade articular',
        icon: <Zap className="w-5 h-5" />,
        points: 10,
        completed: false,
        category: 'essencial',
        difficulty: 'easy',
        emoji: '🔥',
      },
      {
        id: 'main-workout',
        title_ptAO: 'Treino Principal',
        description_ptAO: 'Complete todos os exercícios do dia com boa forma',
        icon: <Flame className="w-5 h-5" />,
        points: 50,
        completed: false,
        category: 'essencial',
        difficulty: 'hard',
        emoji: '💪',
      },
      {
        id: 'cooldown',
        title_ptAO: 'Arrefecimento & Alongamento',
        description_ptAO: 'Alongamentos profundos e respiração controlada',
        icon: <Sparkles className="w-5 h-5" />,
        points: 10,
        completed: false,
        category: 'essencial',
        difficulty: 'easy',
        emoji: '🧘',
      },
    ];

    // Adicionar itens específicos por objetivo
    if (obj === 'lose') {
      baseItems.push(
        {
          id: 'cardio-bonus',
          title_ptAO: 'Cardio Extra - Queima Máxima',
          description_ptAO: 'Caminhada rápida, corrida leve ou saltar à corda (10-15 min)',
          icon: <Heart className="w-5 h-5" />,
          points: 35,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
          emoji: '🏃',
        },
        {
          id: 'water-intake',
          title_ptAO: 'Hidratação Completa',
          description_ptAO: 'Bebe pelo menos 2L de água durante e após o treino',
          icon: <Zap className="w-5 h-5" />,
          points: 15,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '💧',
        },
        {
          id: 'nutrition-log',
          title_ptAO: 'Regista Refeição Pós-Treino',
          description_ptAO: 'Documenta o que comeste nos próximos 30 minutos',
          icon: <Target className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '🥗',
        },
        {
          id: 'deficit-check',
          title_ptAO: 'Verifica Défice Calórico',
          description_ptAO: 'Confirma que mantiveste o défice calórico do dia',
          icon: <ZapIcon className="w-5 h-5" />,
          points: 25,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
          emoji: '📊',
        }
      );
    } else if (obj === 'gain') {
      baseItems.push(
        {
          id: 'strength-focus',
          title_ptAO: 'Foco em Força Máxima',
          description_ptAO: 'Levanta pesos progressivos com boa forma técnica',
          icon: <Trophy className="w-5 h-5" />,
          points: 45,
          completed: false,
          category: 'bonus',
          difficulty: 'hard',
          emoji: '🏋️',
        },
        {
          id: 'protein-intake',
          title_ptAO: 'Proteína Pós-Treino Premium',
          description_ptAO: 'Consome proteína de qualidade nos próximos 30 minutos',
          icon: <Dumbbell className="w-5 h-5" />,
          points: 30,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '🥚',
        },
        {
          id: 'rest-day-check',
          title_ptAO: 'Recuperação Adequada',
          description_ptAO: 'Garante 7-9 horas de sono para crescimento muscular',
          icon: <Sparkles className="w-5 h-5" />,
          points: 25,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '😴',
        },
        {
          id: 'calorie-surplus',
          title_ptAO: 'Superávit Calórico Confirmado',
          description_ptAO: 'Verifica que consumiste calorias suficientes para crescimento',
          icon: <ZapIcon className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
          emoji: '📈',
        }
      );
    } else {
      baseItems.push(
        {
          id: 'consistency',
          title_ptAO: 'Consistência Diária',
          description_ptAO: 'Mantém a rotina de treino regular e equilibrada',
          icon: <Trophy className="w-5 h-5" />,
          points: 30,
          completed: false,
          category: 'bonus',
          difficulty: 'medium',
          emoji: '📅',
        },
        {
          id: 'flexibility',
          title_ptAO: 'Mobilidade & Flexibilidade',
          description_ptAO: 'Trabalha alongamento e mobilidade articular (10 min)',
          icon: <Sparkles className="w-5 h-5" />,
          points: 20,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '🤸',
        },
        {
          id: 'mindfulness',
          title_ptAO: 'Respiração & Mindfulness',
          description_ptAO: 'Pratica respiração consciente durante o treino',
          icon: <Heart className="w-5 h-5" />,
          points: 15,
          completed: false,
          category: 'bonus',
          difficulty: 'easy',
          emoji: '🧠',
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
    
    // Trigger celebration animation
    if (!checklist.find(i => i.id === id)?.completed) {
      setLastCompletedId(id);
      setCelebrationActive(true);
      setTimeout(() => setCelebrationActive(false), 1000);
    }
  };

  const essentialItems = checklist.filter(i => i.category === 'essencial');
  const bonusItems = checklist.filter(i => i.category === 'bonus');
  const essentialCompleted = essentialItems.filter(i => i.completed).length;
  const maxPoints = checklist.reduce((sum, i) => sum + i.points, 0);
  const progressPercent = (totalPoints / maxPoints) * 100;
  const isAllComplete = completedCount === checklist.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50';
      case 'medium':
        return 'from-blue-500/15 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50';
      case 'hard':
        return 'from-red-500/15 to-red-500/5 border-red-500/30 hover:border-red-500/50';
      default:
        return 'from-muted to-muted/50';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { label: 'Fácil', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40' };
      case 'medium':
        return { label: 'Médio', color: 'bg-blue-500/20 text-blue-700 border-blue-500/40' };
      case 'hard':
        return { label: 'Desafiante', color: 'bg-red-500/20 text-red-700 border-red-500/40' };
      default:
        return { label: 'Normal', color: 'bg-muted text-muted-foreground' };
    }
  };

  const getObjectiveEmoji = () => {
    switch (objective) {
      case 'lose':
        return '⚡';
      case 'gain':
        return '💪';
      case 'maintain':
        return '⚖️';
      default:
        return '🎯';
    }
  };

  const getObjectiveTitle = () => {
    switch (objective) {
      case 'lose':
        return 'Perder Peso';
      case 'gain':
        return 'Ganhar Massa';
      case 'maintain':
        return 'Manter Forma';
      default:
        return 'Objetivo Pessoal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Premium com Objetivo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/20 border border-primary/30 p-6 md:p-8"
      >
        {/* Animated background elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 space-y-5">
          {/* Título com Objetivo */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getObjectiveEmoji()}</span>
                <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground">
                  {getObjectiveTitle()}
                </h3>
              </div>
              <p className="text-4xl font-black text-foreground">
                {totalPoints} <span className="text-xl text-primary">pontos</span>
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-right"
            >
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Progresso</p>
              <p className="text-3xl font-black text-primary">
                {completedCount}/{checklist.length}
              </p>
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden border border-primary/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-lg"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground font-medium">
                {Math.round(progressPercent)}% completo
              </p>
              <p className="text-xs font-bold text-primary">
                {maxPoints - totalPoints} pts restantes
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Seção Essencial */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-600" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
              Essencial
            </h4>
          </div>
          <Badge className="bg-red-500/20 text-red-700 border-red-500/40 font-bold">
            {essentialCompleted}/{essentialItems.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {essentialItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              layout
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all border-2 bg-gradient-to-br ${getDifficultyColor(
                    item.difficulty
                  )} ${
                    item.completed
                      ? 'border-primary/60 bg-primary/8 shadow-lg'
                      : 'border-border/50'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: item.completed ? 1 : 0.8,
                          rotate: item.completed ? 360 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {item.completed ? (
                          <div className="relative">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <motion.div
                              animate={{ scale: [1, 1.5, 0] }}
                              transition={{ duration: 0.6 }}
                              className="absolute inset-0 border-2 border-primary rounded-full"
                            />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/50" />
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{item.emoji}</span>
                        <h5 className={`font-bold text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title_ptAO}
                        </h5>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description_ptAO}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold border ${getDifficultyBadge(item.difficulty).color}`}
                        >
                          {getDifficultyBadge(item.difficulty).label}
                        </Badge>
                        <Badge className="text-[10px] font-bold bg-primary/20 text-primary border-primary/30">
                          +{item.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Seção Bónus */}
      {bonusItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
                Bónus
              </h4>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/40 font-bold">
              {bonusItems.filter(i => i.completed).length}/{bonusItems.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {bonusItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (essentialItems.length + idx) * 0.08 }}
                layout
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all border-2 bg-gradient-to-br ${getDifficultyColor(
                      item.difficulty
                    )} ${
                      item.completed
                        ? 'border-accent/60 bg-accent/8 shadow-lg'
                        : 'border-border/50'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: item.completed ? 1 : 0.8,
                            rotate: item.completed ? 360 : 0,
                          }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          {item.completed ? (
                            <div className="relative">
                              <CheckCircle2 className="w-6 h-6 text-accent" />
                              <motion.div
                                animate={{ scale: [1, 1.5, 0] }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 border-2 border-accent rounded-full"
                              />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground/50" />
                          )}
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{item.emoji}</span>
                          <h5 className={`font-bold text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.title_ptAO}
                          </h5>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{item.description_ptAO}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold border ${getDifficultyBadge(item.difficulty).color}`}
                          >
                            {getDifficultyBadge(item.difficulty).label}
                          </Badge>
                          <Badge className="text-[10px] font-bold bg-accent/20 text-accent border-accent/30">
                            +{item.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Celebração ao Completar */}
      <AnimatePresence>
        {isAllComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/10 border-2 border-green-500/40 p-6 md:p-8 text-center"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 space-y-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h4 className="font-black text-2xl text-foreground">Treino Completo!</h4>
              <p className="text-sm text-muted-foreground">
                Excelente trabalho! Ganhaste <span className="font-bold text-green-600">{totalPoints} pontos</span> hoje. 🏆
              </p>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-muted-foreground pt-2"
              >
                Continua assim para manter o teu streak! 🔥
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dica Motivacional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 p-5"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <h5 className="font-bold text-sm text-foreground mb-1">Dica do Dia</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {objective === 'lose'
                ? 'Treina com intensidade mas não esqueças de descansar. O défice calórico + treino consistente = resultados garantidos!'
                : objective === 'gain'
                ? 'Foca em exercícios compostos com pesos progressivos. Proteína + superávit calórico + descanso = ganho muscular!'
                : 'A consistência é a chave. Treina regularmente, come bem e dorme o suficiente para manter a forma!'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SmartWorkoutChecklist;
