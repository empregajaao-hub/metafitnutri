import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Flame, ChefHat, Clock, Heart, Loader2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Utensils } from "lucide-react";
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
  };
  onUnlockBenefits?: () => void;
}

const MealAnalysisResult = ({ result, onUnlockBenefits }: MealAnalysisResultProps) => {
  const { toast } = useToast();
  const [savingRecipe, setSavingRecipe] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [showRecipes, setShowRecipes] = useState(false);
  const [showSuggestedRecipes, setShowSuggestedRecipes] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [userCalorieTarget, setUserCalorieTarget] = useState<number | null>(null);

  const isIngredients = result.type === "ingredients";
  const mealName = result.meal || result.description || (isIngredients ? "Ingredientes Identificados" : "Refeição");
  const suggestions = result.suggestions || [];
  const suggestedRecipes = result.suggested_recipes || [];
  const angolonRecipes = result.angolan_recipes || [];

  // Fetch user goal from profile
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
        // Estimate daily calorie target
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

  const macroData = [
    { name: "Prot", value: result.protein_g, color: "#22c55e" },
    { name: "Carb", value: result.carbs_g, color: "#3b82f6" },
    { name: "Gord", value: result.fat_g, color: "#eab308" },
  ];
  const totalMacros = result.protein_g + result.carbs_g + result.fat_g;

  // Goal match logic
  const getGoalAlert = () => {
    if (!userGoal || !result.estimated_calories) return null;
    const cal = result.estimated_calories;
    const goalLabels: Record<string, string> = { lose: "Perder Peso", maintain: "Manter Peso", gain: "Ganhar Massa" };
    const goalEmoji: Record<string, string> = { lose: "🔥", maintain: "⚖️", gain: "💪" };
    const goalLabel = goalLabels[userGoal] || userGoal;
    const emoji = goalEmoji[userGoal] || "📊";

    if (userGoal === "lose" && cal > 500) {
      return { type: "warning" as const, title: "Atenção — Calorias Elevadas", message: `${cal} kcal pode ser demais para a tua meta de ${goalLabel}.${userCalorieTarget ? ` Meta diária: ~${userCalorieTarget} kcal.` : ""}`, emoji };
    }
    if (userGoal === "lose" && cal <= 500) {
      return { type: "success" as const, title: "Excelente Escolha!", message: `${cal} kcal — perfeita para ${goalLabel}.`, emoji };
    }
    if (userGoal === "gain" && cal < 400) {
      return { type: "warning" as const, title: "Porção Insuficiente", message: `Apenas ${cal} kcal — pouco para ${goalLabel}. Aumenta a porção.`, emoji };
    }
    if (userGoal === "gain" && cal >= 400) {
      return { type: "success" as const, title: "Boa Refeição!", message: `${cal} kcal — encaixa na tua meta de ${goalLabel}.`, emoji };
    }
    if (userGoal === "maintain") {
      return { type: "success" as const, title: "Refeição Equilibrada", message: `${cal} kcal — verifica o teu total diário${userCalorieTarget ? ` (~${userCalorieTarget} kcal)` : ""}.`, emoji };
    }
    return null;
  };

  const goalAlert = getGoalAlert();

  // Truncate meal name for compact display
  const shortName = mealName.length > 60 ? mealName.substring(0, 60) + "…" : mealName;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Goal Match Alert — Elegant */}
      {goalAlert && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`p-4 border-2 ${goalAlert.type === "warning" ? "border-amber-400/60 bg-gradient-to-r from-amber-500/10 to-orange-500/5" : "border-emerald-400/60 bg-gradient-to-r from-emerald-500/10 to-green-500/5"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${goalAlert.type === "warning" ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                <span className="text-lg">{goalAlert.emoji}</span>
              </div>
              <div>
                <p className={`text-sm font-bold ${goalAlert.type === "warning" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {goalAlert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{goalAlert.message}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Compact Header — Short name + calories + macros in one card */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {isIngredients ? <ChefHat className="w-5 h-5 text-primary" /> : <Utensils className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">{shortName}</h2>
            <p className="text-xs text-muted-foreground">
              {isIngredients ? "Ingredientes" : result.portion_size} • {(result.confidence * 100).toFixed(0)}% confiança
            </p>
          </div>
          {!isIngredients && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary">{result.estimated_calories}</p>
              <p className="text-[10px] text-muted-foreground">kcal</p>
            </div>
          )}
        </div>

        {/* Inline Macros */}
        {totalMacros > 0 && (
          <div className="flex gap-2">
            {macroData.map((m) => {
              const pct = totalMacros > 0 ? ((m.value / totalMacros) * 100).toFixed(0) : "0";
              return (
                <div key={m.name} className="flex-1 text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{m.name}</p>
                  <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}g</p>
                  <p className="text-[10px] text-muted-foreground">{pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Macro Chart — compact */}
      {totalMacros > 0 && (
        <Card className="p-3">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" outerRadius={50} innerRadius={30} dataKey="value" paddingAngle={3}>
                  {macroData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* What to eat / not eat — compact inline */}
      {(result.what_to_eat || result.what_not_to_eat) && (
        <div className="grid grid-cols-2 gap-2">
          {result.what_to_eat && result.what_to_eat.length > 0 && (
            <Card className="p-3">
              <p className="text-xs font-semibold text-green-600 mb-1">✅ Comer</p>
              <ul className="space-y-0.5">
                {result.what_to_eat.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </Card>
          )}
          {result.what_not_to_eat && result.what_not_to_eat.length > 0 && (
            <Card className="p-3">
              <p className="text-xs font-semibold text-destructive mb-1">❌ Evitar</p>
              <ul className="space-y-0.5">
                {result.what_not_to_eat.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Suggestions — compact */}
      {suggestions.length > 0 && (
        <Card className="p-3">
          <p className="text-xs font-semibold text-foreground mb-2">💡 Recomendações</p>
          <ul className="space-y-1">
            {suggestions.slice(0, 3).map((s, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary font-bold">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Angolan Recipes — COLLAPSIBLE */}
      {!isIngredients && angolonRecipes.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => setShowRecipes(!showRecipes)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              🍽️ Receitas Alternativas Angolanas ({angolonRecipes.length})
            </span>
            {showRecipes ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showRecipes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2">
                  {angolonRecipes.map((recipe, i) => (
                    <div key={i} className="p-3 bg-muted/20 rounded-lg">
                      <h4 className="text-sm font-bold text-foreground">{recipe.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">{recipe.description}</p>
                      <p className="text-[11px] text-primary mt-1">💡 {recipe.why}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Suggested Recipes (ingredients) — COLLAPSIBLE */}
      {isIngredients && suggestedRecipes.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => setShowSuggestedRecipes(!showSuggestedRecipes)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              Receitas Sugeridas ({suggestedRecipes.length})
            </span>
            {showSuggestedRecipes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showSuggestedRecipes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2">
                  {suggestedRecipes.map((recipe, index) => (
                    <Card key={index} className="border-border/50 overflow-hidden">
                      <button
                        onClick={() => setExpandedRecipe(expandedRecipe === index ? null : index)}
                        className="w-full p-3 text-left flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{recipe.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />{recipe.time_minutes}min
                            </span>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{recipe.difficulty}</span>
                            {recipe.nutrition_per_portion && (
                              <span className="text-[10px] text-primary font-semibold">{recipe.nutrition_per_portion.calories} kcal</span>
                            )}
                          </div>
                        </div>
                        {expandedRecipe === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <AnimatePresence>
                        {expandedRecipe === index && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2">
                              <p className="text-[11px] text-muted-foreground">{recipe.description}</p>
                              <p className="text-[11px] text-primary bg-primary/5 p-2 rounded">💡 {recipe.why}</p>

                              {recipe.ingredients_from_photo && recipe.ingredients_from_photo.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold mb-1">✅ Da foto:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {recipe.ingredients_from_photo.map((ing, i) => (
                                      <span key={i} className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">{ing}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {recipe.additional_ingredients && recipe.additional_ingredients.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold mb-1">🛒 Precisas:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {recipe.additional_ingredients.map((ing, i) => (
                                      <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{ing}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {recipe.steps && recipe.steps.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold mb-1">📝 Passos:</p>
                                  <ol className="space-y-0.5">
                                    {recipe.steps.map((step, i) => (
                                      <li key={i} className="text-[10px] text-muted-foreground">{i + 1}. {step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {recipe.nutrition_per_portion && (
                                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border">
                                  <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground">Cal</p>
                                    <p className="text-xs font-bold text-primary">{recipe.nutrition_per_portion.calories}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground">Prot</p>
                                    <p className="text-xs font-bold text-green-500">{recipe.nutrition_per_portion.protein_g}g</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground">Carb</p>
                                    <p className="text-xs font-bold text-blue-500">{recipe.nutrition_per_portion.carbs_g}g</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground">Gord</p>
                                    <p className="text-xs font-bold text-yellow-500">{recipe.nutrition_per_portion.fat_g}g</p>
                                  </div>
                                </div>
                              )}

                              <Button
                                variant={savedRecipes.has(recipe.name) ? "secondary" : "outline"}
                                size="sm"
                                className="w-full mt-1"
                                onClick={(e) => { e.stopPropagation(); handleSaveRecipe(recipe); }}
                                disabled={savingRecipe === recipe.name || savedRecipes.has(recipe.name)}
                              >
                                {savingRecipe === recipe.name ? (
                                  <><Loader2 className="w-3 h-3 animate-spin" /> A guardar...</>
                                ) : savedRecipes.has(recipe.name) ? (
                                  <><Heart className="w-3 h-3 fill-current" /> Guardada</>
                                ) : (
                                  <><Heart className="w-3 h-3" /> Guardar</>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Unlock Benefits */}
      {onUnlockBenefits && (
        <Card className="p-4 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors" onClick={onUnlockBenefits}>
          <p className="text-sm font-bold text-foreground text-center">🚀 Desbloquear Todos os Benefícios</p>
        </Card>
      )}
    </div>
  );
};

export default MealAnalysisResult;
