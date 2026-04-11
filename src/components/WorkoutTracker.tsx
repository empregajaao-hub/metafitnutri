import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutStats {
  completedWorkouts: number;
  currentStreak: number;
  totalCalories: number;
  thisWeekWorkouts: number;
  lastWorkoutDate: string | null;
}

const WorkoutTracker: React.FC = () => {
  const [stats, setStats] = useState<WorkoutStats>({
    completedWorkouts: 0,
    currentStreak: 0,
    totalCalories: 0,
    thisWeekWorkouts: 0,
    lastWorkoutDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutStats();
  }, []);

  const fetchWorkoutStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch workout history
      const { data: history } = await supabase
        .from('workout_history')
        .select('completed_at, calories_burned')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (!history) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const completedWorkouts = history.length;
      const totalCalories = history.reduce((sum, h) => sum + (h.calories_burned || 0), 0);
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < history.length; i++) {
        const workoutDate = new Date(history[i].completed_at);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (workoutDate.toDateString() === expectedDate.toDateString()) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Count this week's workouts
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekWorkouts = history.filter(h => new Date(h.completed_at) > weekAgo).length;

      setStats({
        completedWorkouts,
        currentStreak,
        totalCalories,
        thisWeekWorkouts,
        lastWorkoutDate: history[0]?.completed_at || null,
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Completed Workouts */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                Treinos
              </p>
              <p className="text-3xl font-black text-primary">{stats.completedWorkouts}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Total concluído</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                Sequência
              </p>
              <p className="text-3xl font-black text-secondary">{stats.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Dias seguidos</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </Card>

        {/* Total Calories */}
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                Calorias
              </p>
              <p className="text-3xl font-black text-accent">{stats.totalCalories.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Queimadas</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-accent" />
            </div>
          </div>
        </Card>

        {/* This Week */}
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                Esta Semana
              </p>
              <p className="text-3xl font-black text-green-600">{stats.thisWeekWorkouts}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Treinos</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold">Meta Semanal</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {Math.round((stats.thisWeekWorkouts / 5) * 100)}%
            </Badge>
          </div>
          <Progress value={(stats.thisWeekWorkouts / 5) * 100} className="h-2" />
          <p className="text-[10px] text-muted-foreground">
            {stats.thisWeekWorkouts} de 5 treinos completados
          </p>
        </div>
      </Card>

      {/* Last Workout */}
      {stats.lastWorkoutDate && (
        <Card className="p-4 bg-muted/20 border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Último treino:</p>
            <Badge variant="outline" className="text-xs">
              {new Date(stats.lastWorkoutDate).toLocaleDateString('pt-AO', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkoutTracker;
