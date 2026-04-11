import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingDown, Target, Calendar, Flame, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
        // Default target weight is 5kg less than current
        setTargetWeight(profile.peso ? profile.peso - 5 : null);
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

      // Save target weight to daily_tracking or a custom field
      // For now, we'll store it in a metadata column if available
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
    const weeksEstimate = Math.ceil(weightToLose / 0.5); // ~0.5kg/week
    const monthsEstimate = Math.ceil(weeksEstimate / 4);

    // BMR calculation
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
    const deficitCalories = Math.round(tdee * 0.80); // 20% deficit

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Meta de Perda de Peso</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Current Status Card */}
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Objetivo</p>
                <p className="text-2xl font-bold text-red-500">Perder Peso</p>
              </div>
            </div>
          </Card>

          {/* Weight Input Section */}
          <Card className="p-6 border-border/50">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentWeight" className="text-sm font-semibold">Peso Atual (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={currentWeight || ""}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || null)}
                  className="text-lg font-bold bg-muted/30"
                  placeholder="Ex: 85"
                  min="30"
                  max="250"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight" className="text-sm font-semibold">Meta de Peso (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={targetWeight || ""}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || null)}
                  className="text-lg font-bold bg-muted/30"
                  placeholder="Ex: 75"
                  min="30"
                  max="250"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  {currentWeight && targetWeight && currentWeight > targetWeight
                    ? `Precisas perder ${(currentWeight - targetWeight).toFixed(1)} kg`
                    : "A meta deve ser menor que o peso atual"}
                </p>
              </div>
            </div>
          </Card>

          {/* Metrics Card */}
          {metrics && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Estimativas Personalizadas
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Tempo Estimado</p>
                  <p className="text-lg font-bold text-primary">{metrics.monthsEstimate} meses</p>
                  <p className="text-[10px] text-muted-foreground">~{metrics.weeksEstimate} semanas</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Peso a Perder</p>
                  <p className="text-lg font-bold text-red-500">{metrics.weightToLose.toFixed(1)} kg</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Plano Diário Recomendado
                </h4>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Calorias</p>
                    <p className="text-base font-bold text-primary">{metrics.dailyCalories}</p>
                    <p className="text-[9px] text-muted-foreground">kcal</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Proteína</p>
                    <p className="text-base font-bold text-green-500">{metrics.protein}g</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Carbos</p>
                    <p className="text-base font-bold text-blue-500">{metrics.carbs}g</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Gordura</p>
                    <p className="text-base font-bold text-yellow-500">{metrics.fat}g</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  Estes valores são baseados num défice calórico de ~20%. Ajusta conforme necessário.
                </p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full h-12 text-lg font-bold" 
              onClick={handleSaveGoal}
              disabled={saving || !currentWeight || !targetWeight}
            >
              {saving ? "A guardar..." : "Guardar Meta"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-muted/30 border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Dica:</strong> Uma perda de peso saudável é de ~0.5 kg por semana. O app vai ajustar o teu plano alimentar e de treino de acordo com esta meta.
            </p>
          </Card>
        </motion.div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default WeightLoss;
