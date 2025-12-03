import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Utensils, TrendingUp, Target, Flame, ChefHat, Clock, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  
  const isIngredients = result.type === "ingredients";
  const mealName = result.meal || result.description || (isIngredients ? "Ingredientes Identificados" : "Refeição");
  const suggestions = result.suggestions || [];
  const ingredients = result.ingredients || result.items || [];
  const suggestedRecipes = result.suggested_recipes || [];

  const handleSaveRecipe = async (recipe: SuggestedRecipe) => {
    try {
      setSavingRecipe(recipe.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Autenticação necessária",
          description: "Faz login para guardar receitas favoritas.",
          variant: "destructive",
        });
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
      toast({
        title: "Receita guardada!",
        description: `"${recipe.name}" foi adicionada aos favoritos.`,
      });
    } catch (error: any) {
      console.error("Erro ao guardar receita:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível guardar a receita.",
        variant: "destructive",
      });
    } finally {
      setSavingRecipe(null);
    }
  };
  
  const macroData = [
    { name: "Proteínas", value: result.protein_g, color: "hsl(145 63% 42%)" },
    { name: "Carboidratos", value: result.carbs_g, color: "hsl(25 95% 53%)" },
    { name: "Gorduras", value: result.fat_g, color: "hsl(35 100% 60%)" },
  ];

  const totalMacros = result.protein_g + result.carbs_g + result.fat_g;
  const macroPercentages = {
    protein: totalMacros > 0 ? ((result.protein_g / totalMacros) * 100).toFixed(1) : "0",
    carbs: totalMacros > 0 ? ((result.carbs_g / totalMacros) * 100).toFixed(1) : "0",
    fat: totalMacros > 0 ? ((result.fat_g / totalMacros) * 100).toFixed(1) : "0",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho com tipo de análise */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {isIngredients ? (
              <ChefHat className="w-6 h-6 text-primary" />
            ) : (
              <Utensils className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isIngredients && (
                <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs font-semibold rounded-full">
                  🥬 INGREDIENTES
                </span>
              )}
              {!isIngredients && (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                  🍽️ REFEIÇÃO
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{mealName}</h2>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {isIngredients ? "Análise de ingredientes" : `Porção: ${result.portion_size}`}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Confiança: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Receitas Sugeridas (para ingredientes crus) */}
      {isIngredients && suggestedRecipes.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/30">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-secondary" />
            Receitas Angolanas Sugeridas
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Com base nos ingredientes identificados, aqui estão receitas angolanas que podes fazer para atingir o teu objetivo:
          </p>
          <div className="space-y-4">
            {suggestedRecipes.map((recipe, index) => (
              <Card key={index} className="p-5 bg-background border-border hover:border-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="text-lg font-bold text-foreground">{recipe.name}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.time_minutes} min
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                
                <div className="p-3 bg-primary/5 rounded-lg mb-3">
                  <p className="text-sm text-primary font-medium">
                    💡 {recipe.why}
                  </p>
                </div>

                {/* Ingredientes da foto */}
                {recipe.ingredients_from_photo && recipe.ingredients_from_photo.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-2">✅ Da tua foto:</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients_from_photo.map((ing, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredientes adicionais */}
                {recipe.additional_ingredients && recipe.additional_ingredients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-2">🛒 Precisas também de:</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.additional_ingredients.map((ing, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passos da receita */}
                {recipe.steps && recipe.steps.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-2">📝 Como preparar:</p>
                    <ol className="space-y-1">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Nutrição */}
                {recipe.nutrition_per_portion && (
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Calorias</p>
                      <p className="font-bold text-primary">{recipe.nutrition_per_portion.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Proteínas</p>
                      <p className="font-bold text-secondary">{recipe.nutrition_per_portion.protein_g}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Carbos</p>
                      <p className="font-bold text-accent">{recipe.nutrition_per_portion.carbs_g}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Gorduras</p>
                      <p className="font-bold text-orange-500">{recipe.nutrition_per_portion.fat_g}g</p>
                    </div>
                  </div>
                )}

                {/* Botão Guardar */}
                <Button
                  variant={savedRecipes.has(recipe.name) ? "secondary" : "outline"}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => handleSaveRecipe(recipe)}
                  disabled={savingRecipe === recipe.name || savedRecipes.has(recipe.name)}
                >
                  {savingRecipe === recipe.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A guardar...
                    </>
                  ) : savedRecipes.has(recipe.name) ? (
                    <>
                      <Heart className="w-4 h-4 fill-current" />
                      Guardada nos Favoritos
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Guardar nos Favoritos
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Calorias em destaque (apenas para refeições) */}
      {!isIngredients && result.estimated_calories > 0 && (
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Calorias Totais</p>
              <p className="text-4xl font-bold">{result.estimated_calories}</p>
              <p className="text-sm opacity-90 mt-1">kcal</p>
            </div>
            <Flame className="w-16 h-16 opacity-20" />
          </div>
        </Card>
      )}

      {/* Gráfico de Macros (apenas se houver macros) */}
      {totalMacros > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isIngredients ? "Macronutrientes dos Ingredientes" : "Distribuição de Macronutrientes"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}g`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Proteínas</span>
                  <span className="text-sm font-bold text-secondary">{macroPercentages.protein}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${macroPercentages.protein}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{result.protein_g}g</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Carboidratos</span>
                  <span className="text-sm font-bold text-primary">{macroPercentages.carbs}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${macroPercentages.carbs}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{result.carbs_g}g</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Gorduras</span>
                  <span className="text-sm font-bold text-accent">{macroPercentages.fat}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${macroPercentages.fat}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{result.fat_g}g</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ingredientes (se disponível) */}
      {ingredients && ingredients.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isIngredients ? "Ingredientes Detectados na Foto" : "Ingredientes Identificados"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">{ingredient.name}</span>
                <span className="text-sm text-muted-foreground">{ingredient.calories} kcal</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* O que comer / não comer */}
      {(result.what_to_eat || result.what_not_to_eat) && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.what_to_eat && result.what_to_eat.length > 0 && (
            <Card className="p-6 border-secondary/50">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                O Que Comer
              </h3>
              <ul className="space-y-2">
                {result.what_to_eat.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-secondary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {result.what_not_to_eat && result.what_not_to_eat.length > 0 && (
            <Card className="p-6 border-destructive/50">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                O Que Não Comer
              </h3>
              <ul className="space-y-2">
                {result.what_not_to_eat.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Receitas Angolanas Alternativas (para refeições) */}
      {!isIngredients && result.angolan_recipes && result.angolan_recipes.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            Receitas Alternativas 100% Angolanas
          </h3>
          <div className="space-y-4">
            {result.angolan_recipes.map((recipe, index) => (
              <div key={index} className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-bold text-foreground mb-1">{recipe.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>
                <p className="text-sm text-accent font-medium">
                  💡 {recipe.why}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recomendações */}
      {suggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recomendações Personalizadas</h3>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Botão Desbloquear Benefícios */}
      {onUnlockBenefits && (
        <Card className="p-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-primary/50 cursor-pointer hover:shadow-lg transition-shadow" onClick={onUnlockBenefits}>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              🚀 Desbloquear Todos os Benefícios
            </h3>
            <p className="text-sm text-muted-foreground">
              Descubra tudo que o METAFIT pode fazer por ti e escolhe o melhor plano
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MealAnalysisResult;
