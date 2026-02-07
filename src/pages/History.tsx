import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, ChefHat, Trash2, Heart, Clock, ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileBottomNav from "@/components/MobileBottomNav";

const History = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
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

      const [mealsResponse, recipesResponse, favoritesResponse] = await Promise.all([
        supabase
          .from("meal_analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("recipes_generated")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("favorite_recipes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setMeals(mealsResponse.data || []);
      setRecipes(recipesResponse.data || []);
      setFavorites(favoritesResponse.data || []);
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
      const { error } = await supabase.from("meal_analyses").delete().eq("id", id);
      if (error) throw error;
      setMeals(meals.filter((m) => m.id !== id));
      toast({ title: "Eliminado!", description: "Análise removida." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase.from("recipes_generated").delete().eq("id", id);
      if (error) throw error;
      setRecipes(recipes.filter((r) => r.id !== id));
      toast({ title: "Eliminado!", description: "Receita removida." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    try {
      const { error } = await supabase.from("favorite_recipes").delete().eq("id", id);
      if (error) throw error;
      setFavorites(favorites.filter((f) => f.id !== id));
      toast({ title: "Removido!", description: "Favorito removido." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        </div>

        <Tabs defaultValue="meals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/30">
            <TabsTrigger value="meals" className="text-xs gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Refeições
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Favoritos
            </TabsTrigger>
          </TabsList>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-3">
            {meals.length === 0 ? (
              <Card className="p-8 text-center border-border/50">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Nenhuma análise ainda</p>
                <Button onClick={() => navigate("/upload")}>Analisar Refeição</Button>
              </Card>
            ) : (
              meals.map((meal) => (
                <Card key={meal.id} className="p-4 border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-muted-foreground">
                      {new Date(meal.created_at).toLocaleDateString("pt-PT", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteMeal(meal.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold text-foreground">{meal.estimated_calories}</p>
                      <p className="text-[10px] text-muted-foreground">kcal</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-semibold text-secondary">{meal.protein_g}g</p>
                      <p className="text-[10px] text-muted-foreground">Proteína</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-semibold text-accent">{meal.carbs_g}g</p>
                      <p className="text-[10px] text-muted-foreground">Carbos</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-semibold text-destructive">{meal.fat_g}g</p>
                      <p className="text-[10px] text-muted-foreground">Gordura</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-3">
            {recipes.length === 0 ? (
              <Card className="p-8 text-center border-border/50">
                <ChefHat className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Nenhuma receita gerada</p>
                <Button onClick={() => navigate("/upload")}>Gerar Receita</Button>
              </Card>
            ) : (
              recipes.map((recipe) => (
                <Card key={recipe.id} className="p-4 border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-foreground">{recipe.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(recipe.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteRecipe(recipe.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{recipe.time_minutes} min</Badge>
                    <Badge variant="outline" className="text-xs">{recipe.difficulty}</Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">{recipe.calories_per_portion}</strong> kcal</span>
                    <span><strong className="text-secondary">{recipe.protein_g}g</strong> prot</span>
                    <span><strong className="text-accent">{recipe.carbs_g}g</strong> carb</span>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-3">
            {favorites.length === 0 ? (
              <Card className="p-8 text-center border-border/50">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">Sem favoritos</p>
                <p className="text-xs text-muted-foreground mb-4">Guarde receitas que gostar!</p>
                <Button onClick={() => navigate("/upload")}>Descobrir Receitas</Button>
              </Card>
            ) : (
              favorites.map((favorite) => (
                <Card key={favorite.id} className="p-4 border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-destructive fill-current" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{favorite.recipe_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(favorite.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteFavorite(favorite.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {favorite.why_recommended && (
                    <p className="text-xs text-primary bg-primary/5 p-2 rounded mb-3">
                      💡 {favorite.why_recommended}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {favorite.time_minutes && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {favorite.time_minutes} min
                      </Badge>
                    )}
                    {favorite.difficulty && (
                      <Badge variant="outline" className="text-xs">{favorite.difficulty}</Badge>
                    )}
                  </div>

                  {favorite.ingredients && favorite.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {favorite.ingredients.slice(0, 5).map((ing: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full">
                          {ing}
                        </span>
                      ))}
                      {favorite.ingredients.length > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{favorite.ingredients.length - 5}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">{favorite.calories || 0}</strong> kcal</span>
                    <span><strong className="text-secondary">{favorite.protein_g || 0}g</strong> prot</span>
                    <span><strong className="text-accent">{favorite.carbs_g || 0}g</strong> carb</span>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default History;
