import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, ChefHat, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const History = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: mealsData } = await supabase
        .from("meal_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: recipesData } = await supabase
        .from("recipes_generated")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMeals(mealsData || []);
      setRecipes(recipesData || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meal_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMeals(meals.filter((m) => m.id !== id));
      toast({
        title: "Eliminado!",
        description: "Análise de refeição eliminada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from("recipes_generated")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRecipes(recipes.filter((r) => r.id !== id));
      toast({
        title: "Eliminado!",
        description: "Receita eliminada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Meu Histórico
        </h1>

        <Tabs defaultValue="meals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="meals">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Refeições Analisadas
            </TabsTrigger>
            <TabsTrigger value="recipes">
              <ChefHat className="w-4 h-4 mr-2" />
              Receitas Geradas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="space-y-4">
            {meals.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Ainda não analisaste nenhuma refeição.
                </p>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="hero"
                  className="mt-4"
                >
                  Analisar Primeira Refeição
                </Button>
              </Card>
            ) : (
              meals.map((meal) => (
                <Card key={meal.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meal.created_at).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Calorias
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {meal.estimated_calories}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Proteínas
                      </p>
                      <p className="text-xl font-bold text-secondary">
                        {meal.protein_g}g
                      </p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Carboidratos
                      </p>
                      <p className="text-xl font-bold text-accent">
                        {meal.carbs_g}g
                      </p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Gorduras
                      </p>
                      <p className="text-xl font-bold text-orange-500">
                        {meal.fat_g}g
                      </p>
                    </div>
                  </div>

                  {meal.portion_size && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Porção: {meal.portion_size} • Confiança:{" "}
                      {(meal.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            {recipes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Ainda não geraste nenhuma receita.
                </p>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="hero"
                  className="mt-4"
                >
                  Gerar Primeira Receita
                </Button>
              </Card>
            ) : (
              recipes.map((recipe) => (
                <Card key={recipe.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(recipe.created_at).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      ⏱️ {recipe.time_minutes} min • 📊 {recipe.difficulty}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {recipe.ingredients?.map((ing: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Calorias</p>
                      <p className="font-bold text-primary">
                        {recipe.calories_per_portion}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Proteínas</p>
                      <p className="font-bold text-secondary">
                        {recipe.protein_g}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Carbos</p>
                      <p className="font-bold text-accent">{recipe.carbs_g}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Gorduras</p>
                      <p className="font-bold text-orange-500">
                        {recipe.fat_g}g
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;