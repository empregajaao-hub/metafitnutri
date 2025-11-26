import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Utensils, TrendingUp, Target, Flame } from "lucide-react";

interface MealAnalysisResultProps {
  result: {
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
  };
  onUnlockBenefits?: () => void;
}

const MealAnalysisResult = ({ result, onUnlockBenefits }: MealAnalysisResultProps) => {
  const mealName = result.meal || result.description || "Refeição";
  const suggestions = result.suggestions || [];
  const ingredients = result.ingredients || result.items || [];
  
  const macroData = [
    { name: "Proteínas", value: result.protein_g, color: "hsl(145 63% 42%)" },
    { name: "Carboidratos", value: result.carbs_g, color: "hsl(25 95% 53%)" },
    { name: "Gorduras", value: result.fat_g, color: "hsl(35 100% 60%)" },
  ];

  const totalMacros = result.protein_g + result.carbs_g + result.fat_g;
  const macroPercentages = {
    protein: ((result.protein_g / totalMacros) * 100).toFixed(1),
    carbs: ((result.carbs_g / totalMacros) * 100).toFixed(1),
    fat: ((result.fat_g / totalMacros) * 100).toFixed(1),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho com prato identificado */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{mealName}</h2>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Porção: {result.portion_size}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Confiança: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Calorias em destaque */}
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

      {/* Gráfico de Macros */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Macronutrientes</h3>
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

      {/* Ingredientes (se disponível) */}
      {ingredients && ingredients.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Ingredientes Identificados</h3>
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

      {/* Receitas Angolanas Alternativas */}
      {result.angolan_recipes && result.angolan_recipes.length > 0 && (
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
