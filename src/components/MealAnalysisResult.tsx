import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flame, ChefHat, Clock, Heart, Loader2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Utensils, Info, Sparkles, Target, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestedRecipe {
  name: string;
  description: string;
  difficulty: string;
  time_minutes: number;
  why: string;
  ingredients_from_photo?: string[];
  additional_ingredients?: string[];
  steps?: string[];
  nutrition_per_portion?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

interface MealAnalysisResultProps {
  result: {
    type?: "meal" | "ingredients";
    meal?: string;
    description?: string;
    estimated_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    portion_size: string;
    confidence: number;
    suggestions?: string[];
    ingredients?: Array<{ name: string; calories: number }>;
    items?: Array<{ name: string; calories: number; estimated_grams: number }>;
    what_to_eat?: string[];
    what_not_to_eat?: string[];
    angolan_recipes?: Array<{ name: string; description: string; why: string }>;
    suggested_recipes?: SuggestedRecipe[];
    sugar_alert?: {
      has_sugary_items: boolean;
      items_detected: string[];
      health_warning: string;
      healthier_alternatives: string[];
    };
  };
  onUnlockBenefits?: () => void;
}

const MealAnalysisResult = ({ result, onUnlockBenefits }: MealAnalysisResultProps) => {
  const { toast } = useToast();
  const [savingRecipe, setSavingRecipe] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [showRecipes, setShowRecipes] = useState(false);
  const [showSuggestedRecipes, setShowSuggestedRecipes] = true; // Default to true for better UX
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(0); // Expand first recipe by default
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [userCalorieTarget, setUserCalorieTarget] = useState<number | null>(null);

  const isIngredients = result.type === "ingredients";
  const mealName = result.meal || result.description || (isIngredients ? "Ingredientes Identificados" : "Refeição");
  const suggestions = result.suggestions || [];
  const suggestedRecipes = result.suggested_recipes || [];
  const angolonRecipes = result.angolan_recipes || [];

  useEffect(() => {
    const fetchGoal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo, peso, Altura, Idade")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.Objetivo) {
        setUserGoal(profile.Objetivo);
        if (profile.peso && profile.Altura && profile.Idade) {
          const bmr = 10 * profile.peso + 6.25 * profile.Altura - 5 * profile.Idade + 5;
          const tdee = bmr * 1.55;
          if (profile.Objetivo === "lose") setUserCalorieTarget(Math.round(tdee - 500));
          else if (profile.Objetivo === "gain") setUserCalorieTarget(Math.round(tdee + 300));
          else setUserCalorieTarget(Math.round(tdee));
        }
      }
    };
    fetchGoal();
  }, []);

  const handleSaveRecipe = async (recipe: SuggestedRecipe) => {
    try {
      setSavingRecipe(recipe.name);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Autenticação necessária", description: "Faz login para guardar receitas.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("favorite_recipes").insert({
        user_id: user.id,
        recipe_name: recipe.name,
        recipe_description: recipe.description,
        difficulty: recipe.difficulty,
        time_minutes: recipe.time_minutes,
        ingredients: [...(recipe.ingredients_from_photo || []), ...(recipe.additional_ingredients || [])],
        steps: recipe.steps || [],
        calories: recipe.nutrition_per_portion?.calories || 0,
        protein_g: recipe.nutrition_per_portion?.protein_g || 0,
        carbs_g: recipe.nutrition_per_portion?.carbs_g || 0,
        fat_g: recipe.nutrition_per_portion?.fat_g || 0,
        why_recommended: recipe.why,
      });
      if (error) throw error;
      setSavedRecipes(prev => new Set([...prev, recipe.name]));
      toast({ title: "Guardada!", description: `"${recipe.name}" nos favoritos.` });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingRecipe(null);
    }
  };

  const protein = Number(result.protein_g) || 0;
  const carbs = Number(result.carbs_g) || 0;
  const fat = Number(result.fat_g) || 0;

  const macroData = [
    { name: "Proteína", value: protein, color: "hsl(var(--primary))" },
    { name: "Carboidratos", value: carbs, color: "hsl(var(--secondary))" },
    { name: "Gorduras", value: fat, color: "hsl(var(--accent))" },
  ].filter(m => m.value > 0);

  const totalMacros = protein + carbs + fat;

  const getGoalAlert = () => {
    if (!userGoal || !result.estimated_calories) return null;
    const cal = result.estimated_calories;
    const goalLabels: Record<string, string> = { lose: "Perder Peso", maintain: "Manter Peso", gain: "Ganhar Massa" };
    const goalLabel = goalLabels[userGoal] || userGoal;

    if (userGoal === "lose" && cal > 500) {
      return { type: "warning" as const, title: "Atenção — Calorias Elevadas", message: `${cal} kcal pode ser demais para a tua meta de ${goalLabel}.`, icon: <AlertTriangle className="w-5 h-5" /> };
    }
    if (userGoal === "lose" && cal <= 500) {
      return { type: "success" as const, title: "Excelente Escolha!", message: `${cal} kcal — perfeita para ${goalLabel}.`, icon: <CheckCircle2 className="w-5 h-5" /> };
    }
    if (userGoal === "gain" && cal < 400) {
      return { type: "warning" as const, title: "Porção Insuficiente", message: `Apenas ${cal} kcal — pouco para ${goalLabel}. Aumenta a porção.`, icon: <Info className="w-5 h-5" /> };
    }
    if (userGoal === "gain" && cal >= 400) {
      return { type: "success" as const, title: "Boa Refeição!", message: `${cal} kcal — encaixa na tua meta de ${goalLabel}.`, icon: <Target className="w-5 h-5" /> };
    }
    return { type: "info" as const, title: "Análise Concluída", message: `${cal} kcal — Refeição equilibrada para o seu dia.`, icon: <Sparkles className="w-5 h-5" /> };
  };

  const goalAlert = getGoalAlert();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Hero Section - Visual Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-secondary/5 border border-white/10 shadow-2xl p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mb-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-glow mb-2">
            {isIngredients ? <ChefHat className="w-8 h-8 text-primary" /> : <Utensils className="w-8 h-8 text-primary" />}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
              {mealName}
            </h2>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {isIngredients ? "Ingredientes Detectados" : `${result.portion_size} • ${(result.confidence * 100).toFixed(0)}% Precisão`}
            </p>
          </div>

          {!isIngredients && (
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-primary tracking-tighter">{result.estimated_calories}</span>
              <span className="text-xl font-bold text-muted-foreground">kcal</span>
            </div>
          )}
        </div>

        {/* Macro Rings / Summary */}
        {totalMacros > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-8 relative z-10">
            {[
              { label: "Proteína", value: protein, color: "text-primary", bg: "bg-primary/10" },
              { label: "Carbos", value: carbs, color: "text-secondary", bg: "bg-secondary/10" },
              { label: "Gordura", value: fat, color: "text-accent", bg: "bg-accent/10" }
            ].map((macro, i) => (
              <div key={i} className={`flex flex-col items-center p-4 rounded-3xl ${macro.bg} backdrop-blur-sm border border-white/5`}>
                <span className={`text-lg font-black ${macro.color}`}>{macro.value}g</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{macro.label}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Goal Match Alert */}
      {goalAlert && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className={`p-5 border-none shadow-lg overflow-hidden relative ${
            goalAlert.type === "warning" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : 
            goalAlert.type === "success" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : 
            "bg-primary/10 text-primary-700 dark:text-primary-400"
          }`}>
            <div className="absolute top-0 right-0 p-2 opacity-10">
              {goalAlert.icon}
            </div>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                goalAlert.type === "warning" ? "bg-amber-500/20" : 
                goalAlert.type === "success" ? "bg-emerald-500/20" : 
                "bg-primary/20"
              }`}>
                {goalAlert.icon}
              </div>
              <div>
                <h4 className="font-black text-base tracking-tight">{goalAlert.title}</h4>
                <p className="text-sm font-medium opacity-90 mt-1 leading-relaxed">{goalAlert.message}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sugar Alert - If present */}
      {result.sugar_alert?.has_sugary_items && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 border-none bg-destructive/10 text-destructive shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-destructive/20 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-base tracking-tight">Alerta de Açúcar! ⚠️</h4>
                <p className="text-sm font-medium leading-relaxed">{result.sugar_alert.health_warning}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.sugar_alert.items_detected.map((item, i) => (
                    <span key={i} className="text-[10px] font-bold bg-destructive/20 px-2 py-1 rounded-full uppercase">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What to Eat */}
        {result.what_to_eat && result.what_to_eat.length > 0 && (
          <Card className="p-6 border-none bg-emerald-500/5 shadow-sm rounded-[2rem]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Priorizar</h4>
            </div>
            <ul className="space-y-3">
              {result.what_to_eat.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* What to Avoid */}
        {result.what_not_to_eat && result.what_not_to_eat.length > 0 && (
          <Card className="p-6 border-none bg-destructive/5 shadow-sm rounded-[2rem]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-widest text-destructive">Evitar / Reduzir</h4>
            </div>
            <ul className="space-y-3">
              {result.what_not_to_eat.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Suggested Recipes Section */}
      {(suggestedRecipes.length > 0 || angolonRecipes.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" />
              Sugestões do Chef IA
            </h3>
          </div>

          <div className="space-y-4">
            {suggestedRecipes.map((recipe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`overflow-hidden border-none shadow-md transition-all duration-300 rounded-[2rem] ${expandedRecipe === index ? 'ring-2 ring-primary/20' : 'hover:bg-muted/30'}`}>
                  <button
                    onClick={() => setExpandedRecipe(expandedRecipe === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-foreground tracking-tight">{recipe.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                            <Clock className="w-3 h-3" /> {recipe.time_minutes} min
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">•</span>
                          <span className="text-[10px] font-bold text-primary uppercase">{recipe.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full bg-muted transition-transform duration-300 ${expandedRecipe === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedRecipe === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-6">
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                              "{recipe.description}"
                            </p>
                            <p className="text-xs font-bold text-primary mt-3 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> {recipe.why}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {recipe.ingredients_from_photo && (
                              <div className="space-y-3">
                                <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ingredientes da Foto</h5>
                                <div className="flex flex-wrap gap-2">
                                  {recipe.ingredients_from_photo.map((ing, i) => (
                                    <span key={i} className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500/10">{ing}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {recipe.additional_ingredients && (
                              <div className="space-y-3">
                                <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Extras Necessários</h5>
                                <div className="flex flex-wrap gap-2">
                                  {recipe.additional_ingredients.map((ing, i) => (
                                    <span key={i} className="text-[11px] font-bold bg-muted px-3 py-1.5 rounded-xl border border-border/50">{ing}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {recipe.steps && (
                            <div className="space-y-4">
                              <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Modo de Preparo</h5>
                              <div className="space-y-3">
                                {recipe.steps.map((step, i) => (
                                  <div key={i} className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {recipe.nutrition_per_portion && (
                              <div className="flex gap-6">
                                <div className="text-center">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Calorias</p>
                                  <p className="text-lg font-black text-primary">{recipe.nutrition_per_portion.calories}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Proteína</p>
                                  <p className="text-lg font-black text-foreground">{recipe.nutrition_per_portion.protein_g}g</p>
                                </div>
                              </div>
                            )}
                            
                            <Button
                              variant={savedRecipes.has(recipe.name) ? "secondary" : "default"}
                              className="w-full sm:w-auto rounded-2xl font-black px-8 h-12 shadow-lg shadow-primary/20"
                              onClick={(e) => { e.stopPropagation(); handleSaveRecipe(recipe); }}
                              disabled={savingRecipe === recipe.name || savedRecipes.has(recipe.name)}
                            >
                              {savingRecipe === recipe.name ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> A guardar...</>
                              ) : savedRecipes.has(recipe.name) ? (
                                <><Heart className="w-4 h-4 fill-current mr-2" /> Guardada</>
                              ) : (
                                <><Heart className="w-4 h-4 mr-2" /> Guardar Receita</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Unlock Benefits CTA */}
      {onUnlockBenefits && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card 
            className="p-8 bg-gradient-to-r from-primary to-secondary border-none cursor-pointer shadow-xl shadow-primary/20 rounded-[2.5rem] group relative overflow-hidden" 
            onClick={onUnlockBenefits}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white tracking-tight">Evolua para o Premium</h4>
                <p className="text-sm font-medium text-white/80">Análises ilimitadas e planos personalizados.</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MealAnalysisResult;
