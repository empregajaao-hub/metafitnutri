import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Home, Dumbbell, ArrowLeft, Zap, TrendingUp, Flame } from 'lucide-react';
import PremiumWorkoutHero from './PremiumWorkoutHero';
import SmartWorkoutChecklist from './SmartWorkoutChecklist';
import GamificationBadges from './GamificationBadges';
import WorkoutTracker from './WorkoutTracker';
import ExerciseAnimation from './ExerciseAnimation';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PremiumWorkoutPageProps {
  onStartWorkout: (type: 'home' | 'gym') => void;
  onClose: () => void;
}

const PremiumWorkoutPage: React.FC<PremiumWorkoutPageProps> = ({ onStartWorkout, onClose }) => {
  const navigate = useNavigate();
  const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain' | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    setDayOfWeek(new Date().getDay());
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch objective
      const { data: profile } = await supabase
        .from('profiles')
        .select('Objetivo')
        .eq('id', user.id)
        .single();
      
      setObjective((profile?.Objetivo as any) || null);

      // Fetch workout stats
      const { data: history } = await supabase
        .from('workout_history')
        .select('completed_at, calories_burned')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (history) {
        setTotalWorkouts(history.length);
        setTotalCalories(history.reduce((sum, h) => sum + (h.calories_burned || 0), 0));

        // Calculate streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < history.length; i++) {
          const workoutDate = new Date(history[i].completed_at);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (workoutDate.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }
        setStreakDays(streak);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-black text-foreground">Treinos</h1>
            <p className="text-xs text-muted-foreground">Experiência Premium IA</p>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </motion.div>

        {/* Premium Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <PremiumWorkoutHero
            objective={objective}
            dayOfWeek={dayOfWeek}
            onStartWorkout={() => onStartWorkout('home')}
            streakDays={streakDays}
            caloriesGoal={objective === 'lose' ? 600 : 500}
          />
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="checklist" className="rounded-lg text-xs md:text-sm gap-1">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg text-xs md:text-sm gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg text-xs md:text-sm gap-1">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SmartWorkoutChecklist
                objective={objective}
                dayOfWeek={dayOfWeek}
              />
            </motion.div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GamificationBadges
                streakDays={streakDays}
                totalWorkouts={totalWorkouts}
                totalCalories={totalCalories}
              />
            </motion.div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <WorkoutTracker />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Workout Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          <h3 className="font-black text-sm uppercase tracking-widest text-foreground px-1">
            Escolhe o Tipo de Treino
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Workout */}
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group"
              onClick={() => onStartWorkout('home')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-lg text-foreground mb-1">Treino em Casa</h4>
                    <p className="text-xs text-muted-foreground">Sem equipamento</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>40-50 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    <span>~400-500 calorias</span>
                  </div>
                </div>
                <Button className="w-full rounded-lg h-10 text-sm font-bold bg-blue-600 hover:bg-blue-700">
                  Começar
                </Button>
              </div>
            </Card>

            {/* Gym Workout */}
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
              onClick={() => onStartWorkout('gym')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-lg text-foreground mb-1">Treino de Ginásio</h4>
                    <p className="text-xs text-muted-foreground">Com equipamento</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Dumbbell className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>50-60 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    <span>~500-600 calorias</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full rounded-lg h-10 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white">
                  Começar
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Daily Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <div className="space-y-3">
              <h4 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Dica do Dia
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {objective === 'lose'
                  ? 'Mantém um défice calórico consistente. Treina com intensidade mas não esqueças de descansar adequadamente.'
                  : objective === 'gain'
                  ? 'Foca em exercícios compostos com pesos progressivos. Consome proteína suficiente para recuperação muscular.'
                  : 'Consistência é a chave. Treina regularmente e mantém uma alimentação equilibrada.'}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumWorkoutPage;
