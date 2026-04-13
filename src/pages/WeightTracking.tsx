import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Scale, 
  Target, 
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Edit2,
  Save,
  X,
  Calendar,
  Flame,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";

const WeightTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState<string>("");
  const [userGoal, setUserGoal] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("peso, peso_meta, Objetivo")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentWeight(profile.peso);
        setTargetWeight(profile.peso_meta);
        setUserGoal(profile.Objetivo);
        setNewTargetWeight(profile.peso_meta?.toString() || "");
      }

      // Fetch weight history from daily_tracking
      const { data: history } = await supabase
        .from("daily_tracking")
        .select("tracking_date, weight_recorded")
        .eq("user_id", user.id)
        .order("tracking_date", { ascending: false })
        .limit(30);

      if (history) {
        setWeightHistory(history);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTargetWeight = async () => {
    if (!newTargetWeight || isNaN(parseFloat(newTargetWeight))) {
      toast({
        title: "Valor inválido",
        description: "Por favor, introduza um peso válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ peso_meta: parseFloat(newTargetWeight) })
        .eq("id", user.id);

      if (error) throw error;

      setTargetWeight(parseFloat(newTargetWeight));
      setIsEditingTarget(false);
      toast({
        title: "Meta atualizada!",
        description: `Nova meta de peso: ${newTargetWeight} kg`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast({
        title: "Valor inválido",
        description: "Por favor, introduza um peso válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const weight = parseFloat(newWeight);

      // Update current weight in profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ peso: weight })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Record in daily_tracking
      const { error: trackingError } = await supabase
        .from("daily_tracking")
        .upsert({
          user_id: user.id,
          tracking_date: today,
          weight_recorded: weight
        }, { onConflict: "user_id,tracking_date" });

      if (trackingError) throw trackingError;

      setCurrentWeight(weight);
      setNewWeight("");
      setIsAddingWeight(false);
      
      // Refresh history
      fetchUserData();
      
      toast({
        title: "Peso registado!",
        description: `Peso atual: ${weight} kg`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getWeightStatus = () => {
    if (!currentWeight || !targetWeight) return null;
    const diff = currentWeight - targetWeight;
    
    if (userGoal === 'lose') {
      if (diff <= 0) return { status: 'achieved', label: 'Meta atingida!' };
      return { status: 'in-progress', label: `${diff.toFixed(1)} kg para a meta` };
    } else if (userGoal === 'gain') {
      if (diff >= 0) return { status: 'achieved', label: 'Meta atingida!' };
      return { status: 'in-progress', label: `${Math.abs(diff).toFixed(1)} kg para a meta` };
    }
    return null;
  };

  const getProgressPercent = () => {
    if (!currentWeight || !targetWeight) return 0;
    
    if (userGoal === 'lose') {
      return Math.min(100, Math.max(0, ((currentWeight - targetWeight) / currentWeight) * 100));
    } else if (userGoal === 'gain') {
      return Math.min(100, Math.max(0, ((currentWeight - targetWeight) / targetWeight) * 100));
    }
    return 0;
  };

  const status = getWeightStatus();
  const progressPercent = getProgressPercent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Rastreamento de Peso</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Objetivo: {userGoal === 'lose' ? 'Perder Peso' : userGoal === 'gain' ? 'Ganhar Peso' : 'Manter Peso'}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Weight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" className="p-6 border-none bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Peso Atual</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingWeight(!isAddingWeight)}
                  className="h-8 gap-1 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  Registar
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{currentWeight?.toFixed(1) || '—'}</span>
                <span className="text-xl font-bold text-white/60">kg</span>
              </div>

              {/* Add Weight Input */}
              <AnimatePresence>
                {isAddingWeight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 pt-2 border-t border-white/10"
                  >
                    <Input
                      type="number"
                      placeholder="Novo peso (kg)"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      step="0.1"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddWeight}
                      className="h-9 px-3 gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsAddingWeight(false);
                        setNewWeight("");
                      }}
                      className="h-9 px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Target Weight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="p-6 border-none bg-gradient-to-br from-green-500/10 to-green-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meta de Peso</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingTarget(!isEditingTarget)}
                  className="h-8 gap-1 text-green-400 hover:bg-green-500/10"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{targetWeight?.toFixed(1) || '—'}</span>
                <span className="text-xl font-bold text-white/60">kg</span>
              </div>

              {/* Edit Target Weight Input */}
              <AnimatePresence>
                {isEditingTarget && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 pt-2 border-t border-white/10"
                  >
                    <Input
                      type="number"
                      placeholder="Nova meta (kg)"
                      value={newTargetWeight}
                      onChange={(e) => setNewTargetWeight(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      step="0.1"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleUpdateTargetWeight}
                      className="h-9 px-3 gap-1 bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsEditingTarget(false);
                        setNewTargetWeight(targetWeight?.toString() || "");
                      }}
                      className="h-9 px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Progress Card */}
        {currentWeight && targetWeight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6 border-none bg-card/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {status?.status === 'achieved' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Meta Atingida!
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-primary" />
                      Progresso
                    </>
                  )}
                </h3>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/50 font-medium">
                  <span>{userGoal === 'lose' ? 'Inicial' : 'Inicial'}</span>
                  <span>{Math.round(progressPercent)}%</span>
                  <span>{userGoal === 'lose' ? 'Meta' : 'Meta'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-center">
                <p className="text-sm font-bold text-white">{status?.label}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Weight History */}
        {weightHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Histórico de Peso (Últimos 30 dias)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {weightHistory.map((entry, idx) => (
                <Card key={idx} variant="glass" className="p-3 border-none flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {new Date(entry.tracking_date).toLocaleDateString('pt-AO', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-[10px] text-white/40 uppercase font-medium">
                        {entry.weight_recorded ? `${entry.weight_recorded.toFixed(1)} kg` : 'Sem registro'}
                      </p>
                    </div>
                  </div>
                  {entry.weight_recorded && (
                    <div className="flex items-center gap-2">
                      {idx > 0 && weightHistory[idx - 1].weight_recorded && (
                        <>
                          {entry.weight_recorded < weightHistory[idx - 1].weight_recorded ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingDown className="w-3 h-3" />
                              <span className="text-[10px] font-bold">
                                {(weightHistory[idx - 1].weight_recorded - entry.weight_recorded).toFixed(1)} kg
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <TrendingUp className="w-3 h-3" />
                              <span className="text-[10px] font-bold">
                                {(entry.weight_recorded - weightHistory[idx - 1].weight_recorded).toFixed(1)} kg
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default WeightTracking;
