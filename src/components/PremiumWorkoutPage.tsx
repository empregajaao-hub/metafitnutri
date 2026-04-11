import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Home, Dumbbell, ArrowLeft, Zap, TrendingUp, Flame, Star, Trophy } from 'lucide-react';
import PremiumWorkoutHero from './PremiumWorkoutHero';
import SmartWorkoutChecklist from './SmartWorkoutChecklist';
import GamificationBadges from './GamificationBadges';
import WorkoutTracker from './WorkoutTracker';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PremiumWorkoutPageProps {
  onStartWorkout: (type: 'home' | 'gym' | 'kegel') => void;
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
          <p className="text-muted-foreground text-sm">A carregar experiência premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header Elegante */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Área de Treino</h1>
            <div className="flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <p className="text-[10px] uppercase font-black text-primary tracking-widest">Premium IA Experience</p>
            </div>
          </div>
          <div className="w-10" />
        </motion.div>

        {/* Premium Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <PremiumWorkoutHero
            objective={objective}
            dayOfWeek={dayOfWeek}
            onStartWorkout={() => onStartWorkout('home')}
            streakDays={streakDays}
            caloriesGoal={objective === 'lose' ? 600 : 500}
          />
        </motion.div>

        {/* Main Interactive Tabs */}
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
            <TabsTrigger value="checklist" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold">Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab - O Coração da Experiência */}
          <TabsContent value="checklist" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SmartWorkoutChecklist
                objective={objective}
                dayOfWeek={dayOfWeek}
              />
            </motion.div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GamificationBadges
                streakDays={streakDays}
                totalWorkouts={totalWorkouts}
                totalCalories={totalCalories}
              />
            </motion.div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <WorkoutTracker />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Workout Selection - Design Refinado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 space-y-6"
        >
          <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-border/50" />
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Modalidade de Treino
            </h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Home Workout Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card 
                className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
                onClick={() => onStartWorkout('home')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Home className="w-16 h-16 text-blue-600" />
                </div>
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground">Em Casa</h4>
                      <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">Sem Equipamento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">45 min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">~450 kcal</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl h-11 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                    Iniciar Treino
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Gym Workout Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card 
                className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group shadow-sm"
                onClick={() => onStartWorkout('gym')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Dumbbell className="w-16 h-16 text-purple-600" />
                </div>
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground">No Ginásio</h4>
                      <p className="text-[10px] font-bold text-purple-600/70 uppercase tracking-wider">Equipamento Completo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">60 min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">~600 kcal</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl h-11 font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all">
                    Iniciar Treino
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Kegel Workout Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }} className="md:col-span-2">
              <Card 
                className="relative overflow-hidden p-6 bg-gradient-to-br from-pink-500/10 via-transparent to-pink-500/5 border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer group shadow-sm"
                onClick={() => onStartWorkout('kegel')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-16 h-16 text-pink-600" />
                </div>
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground">Treino Kegel</h4>
                      <p className="text-[10px] font-bold text-pink-600/70 uppercase tracking-wider">Saúde Pélvica</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">5-10 min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Baixo Impacto</span>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl h-11 font-bold bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-600/20 transition-all">
                    Aceder ao Treino
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumWorkoutPage;
