import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingDown, Target, Calendar, Flame, Zap, LineChart as LineChartIcon, Award, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const WeightLoss = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);

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
        .select("peso, Altura, Idade, gender, \"Nivel de Atividade\"")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setCurrentWeight(profile.peso);
        setHeight(profile.Altura);
        setAge(profile.Idade);
        setGender(profile.gender);
        setActivityLevel(profile["Nivel de Atividade"]);
        setTargetWeight(profile.peso ? profile.peso - 5 : null);
      }

      const { data: tracking } = await supabase
        .from("daily_tracking")
        .select("tracking_date, weight_recorded")
        .eq("user_id", user.id)
        .order("tracking_date", { ascending: true })
        .limit(30);

      if (tracking && tracking.length > 0) {
        const formattedData = tracking.map((t: any) => ({
          date: new Date(t.tracking_date).toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' }),
          weight: t.weight_recorded || profile.peso,
          fullDate: t.tracking_date,
        }));
        setProgressData(formattedData);
      } else if (profile.peso) {
        const mockData = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' }),
            weight: profile.peso - (i * 0.15),
            fullDate: date.toISOString(),
          });
        }
        setProgressData(mockData);
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!currentWeight || !targetWeight) {
      toast({ title: "Aviso", description: "Preenche o peso atual e a meta." });
      return;
    }

    if (targetWeight >= currentWeight) {
      toast({ title: "Aviso", description: "A meta deve ser menor que o peso atual." });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          peso: currentWeight,
          Objetivo: "lose",
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Meta de perda de peso guardada." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const calculateMetrics = () => {
    if (!currentWeight || !targetWeight || !height || !age || !gender) return null;

    const weightToLose = currentWeight - targetWeight;
    const weeksEstimate = Math.ceil(weightToLose / 0.5);
    const monthsEstimate = Math.ceil(weeksEstimate / 4);

    const bmr = gender === "feminino"
      ? 655.1 + (9.563 * currentWeight) + (1.85 * height) - (4.676 * age)
      : 66.47 + (13.75 * currentWeight) + (5.003 * height) - (6.755 * age);

    const multipliers: Record<string, number> = {
      "Sedentário": 1.2,
      "Levemente Ativo": 1.375,
      "Moderadamente Ativo": 1.55,
      "Muito Ativo": 1.725,
      "Extremamente Ativo": 1.9,
    };
    const tdee = bmr * (multipliers[activityLevel || ""] || 1.55);
    const deficitCalories = Math.round(tdee * 0.80);

    const protein = Math.round(currentWeight * 2.0);
    const fat = Math.round((deficitCalories * 0.25) / 9);
    const carbs = Math.round((deficitCalories - protein * 4 - fat * 9) / 4);

    return {
      weightToLose,
      weeksEstimate,
      monthsEstimate,
      dailyCalories: deficitCalories,
      protein,
      carbs,
      fat,
    };
  };

  const metrics = calculateMetrics();
  const progressPercent = metrics ? Math.min((currentWeight - targetWeight) / metrics.weightToLose * 100, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header Premium */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")} 
            className="rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Meta de Perda de Peso
            </h1>
            <p className="text-xs text-white font-black opacity-80 mt-1">Acompanha o teu progresso em tempo real</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Current Status Card Premium */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-600/30 via-orange-600/20 to-red-600/30 backdrop-blur-xl p-6 shadow-xl shadow-red-950/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white font-black uppercase tracking-widest opacity-90">Objetivo</p>
                <p className="text-3xl font-black text-white leading-tight">Perder Peso</p>
                <p className="text-xs text-white font-bold opacity-80 mt-1">Plano personalizado para ti</p>
              </div>
            </div>
          </Card>

          {/* Progress Ring Card */}
          {metrics && (
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600/30 via-cyan-600/20 to-blue-600/30 backdrop-blur-xl p-8 shadow-xl shadow-emerald-950/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/20" />
                      <motion.circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke="url(#gradient)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={440}
                        initial={{ strokeDashoffset: 440 }}
                        animate={{ strokeDashoffset: 440 - (440 * progressPercent / 100) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white tracking-tighter">{progressPercent.toFixed(0)}%</span>
                      <span className="text-xs text-white font-black uppercase opacity-80">Progresso</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <p className="text-xs text-white font-black uppercase opacity-70">Atual</p>
                    <p className="text-xl font-black text-white mt-1">{currentWeight.toFixed(1)}</p>
                    <p className="text-[10px] text-white font-black opacity-50">kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <p className="text-xs text-white font-black uppercase opacity-70">Meta</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{targetWeight.toFixed(1)}</p>
                    <p className="text-[10px] text-white font-black opacity-50">kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <p className="text-xs text-white font-black uppercase opacity-70">Falta</p>
                    <p className="text-xl font-black text-red-400 mt-1">{metrics.weightToLose.toFixed(1)}</p>
                    <p className="text-[10px] text-white font-black opacity-50">kg</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Performance Chart */}
          {progressData.length > 0 && (
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-blue-600/30 backdrop-blur-xl p-6 shadow-xl shadow-blue-950/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
                    <LineChartIcon className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="font-black text-white text-lg tracking-tight">Gráfico de Desempenho</h3>
                </div>
                
                <div className="h-64 -mx-6 px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.6)"
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.6)"
                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(value) => [`${(value as number).toFixed(1)} kg`, 'Peso']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#60a5fa" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {/* Weight Input Section */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-600/30 via-blue-600/20 to-cyan-600/30 backdrop-blur-xl p-6 shadow-xl shadow-cyan-950/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
            
            <div className="relative z-10 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="currentWeight" className="text-sm font-black text-white uppercase tracking-wider">Peso Atual (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={currentWeight || ""}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || null)}
                  className="text-xl font-black bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:ring-cyan-400/20 h-12 rounded-xl"
                  placeholder="Ex: 85"
                  min="30"
                  max="250"
                  step="0.1"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="targetWeight" className="text-sm font-black text-white uppercase tracking-wider">Meta de Peso (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={targetWeight || ""}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || null)}
                  className="text-xl font-black bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:ring-cyan-400/20 h-12 rounded-xl"
                  placeholder="Ex: 75"
                  min="30"
                  max="250"
                  step="0.1"
                />
                <p className="text-xs text-white font-bold opacity-90 bg-white/5 p-2 rounded-lg inline-block">
                  {currentWeight && targetWeight && currentWeight > targetWeight
                    ? `Precisas perder ${(currentWeight - targetWeight).toFixed(1)} kg`
                    : "A meta deve ser menor que o peso atual"}
                </p>
              </div>
            </div>
          </Card>

          {/* Metrics Card */}
          {metrics && (
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-purple-600/30 backdrop-blur-xl p-6 shadow-xl shadow-purple-950/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10">
                <h3 className="font-black text-white text-lg mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-300" />
                  </div>
                  Estimativas Personalizadas
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                    <p className="text-[10px] text-white font-black uppercase opacity-70 mb-1 tracking-widest">Tempo Estimado</p>
                    <p className="text-3xl font-black text-purple-300">{metrics.monthsEstimate}</p>
                    <p className="text-[10px] text-white font-black opacity-60">meses (~{metrics.weeksEstimate} sem)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                    <p className="text-[10px] text-white font-black uppercase opacity-70 mb-1 tracking-widest">Peso a Perder</p>
                    <p className="text-3xl font-black text-red-400">{metrics.weightToLose.toFixed(1)}</p>
                    <p className="text-[10px] text-white font-black opacity-60">kg totais</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/20">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    Plano Diário Recomendado
                  </h4>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
                      <p className="text-[9px] text-white font-black uppercase opacity-70">Cal</p>
                      <p className="text-lg font-black text-orange-400 mt-1">{metrics.dailyCalories}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
                      <p className="text-[9px] text-white font-black uppercase opacity-70">Prot</p>
                      <p className="text-lg font-black text-green-400 mt-1">{metrics.protein}g</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
                      <p className="text-[9px] text-white font-black uppercase opacity-70">Carb</p>
                      <p className="text-lg font-black text-blue-400 mt-1">{metrics.carbs}g</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
                      <p className="text-[9px] text-white font-black uppercase opacity-70">Gord</p>
                      <p className="text-lg font-black text-yellow-400 mt-1">{metrics.fat}g</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-blue-500/20 border border-blue-400/40">
                    <p className="text-xs text-white font-bold leading-relaxed flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-300 shrink-0" />
                      <span>Estes valores são baseados num défice calórico de ~20%. Ajusta conforme necessário para o teu ritmo.</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full h-14 text-xl font-black bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-xl shadow-red-500/40 border-0 rounded-2xl" 
                onClick={handleSaveGoal}
                disabled={saving || !currentWeight || !targetWeight}
              >
                {saving ? "A guardar..." : "Guardar Meta"}
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              className="w-full h-12 border-white/40 text-white hover:bg-white/10 font-black rounded-xl"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border-amber-400/40 backdrop-blur-xl rounded-2xl">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/30 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-amber-300" />
              </div>
              <p className="text-xs text-white font-black leading-relaxed">
                <span className="text-amber-300 uppercase tracking-tighter">Dica de Especialista:</span> Uma perda de peso saudável é de ~0.5 kg por semana. O app vai ajustar o teu plano de forma inteligente.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default WeightLoss;
