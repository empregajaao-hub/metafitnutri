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
import { motion } from "framer-motion";

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
      if (!user) { navigate("/auth"); return; }

      const [mealsResponse, recipesResponse, favoritesResponse] = await Promise.all([
        supabase.from("meal_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("recipes_generated").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("favorite_recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      setMeals(mealsResponse.data || []);
      setRecipes(recipesResponse.data || []);
      setFavorites(favoritesResponse.data || []);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const { error } = await supabase.from("meal_analyses").delete().eq("id", id);
    if (!error) {
      setMeals(meals.filter(m => m.id !== id));
      toast({ title: "Eliminado!", description: "Análise removida." });
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    const { error } = await supabase.from("recipes_generated").delete().eq("id", id);
    if (!error) {
      setRecipes(recipes.filter(r => r.id !== id));
      toast({ title: "Eliminado!", description: "Receita removida." });
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    const { error } = await supabase.from("favorite_recipes").delete().eq("id", id);
    if (!error) {
      setFavorites(favorites.filter(f => f.id !== id));
      toast({ title: "Removido!", description: "Favorito removido." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Histórico</h1>
        </div>

        <Tabs defaultValue="meals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-5 bg-muted/30">
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
              <Card className="p-8 text-center border-dashed border-border/50">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Nenhuma análise ainda</p>
                <Button onClick={() => navigate("/upload")} size="sm">Analisar Refeição</Button>
              </Card>
            ) : (
              meals.map((meal, i) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden border-border/40 shadow-sm">
                    <div className="flex">
                      {/* Meal Image */}
                      {meal.image_url ? (
                        <div className="w-24 h-24 shrink-0 bg-muted/30">
                          <img
                            src={meal.image_url}
                            alt="Refeição"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 shrink-0 bg-muted/20 flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Meal Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Flame className="w-3.5 h-3.5 text-primary" />
                              <span className="text-sm font-bold text-foreground">{meal.estimated_calories} kcal</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(meal.created_at).toLocaleDateString("pt-PT", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteMeal(meal.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex gap-3 text-[10px] mt-1">
                          <span className="font-medium" style={{ color: 'hsl(142, 71%, 45%)' }}>{meal.protein_g}g prot</span>
                          <span className="font-medium text-primary">{meal.carbs_g}g carb</span>
                          <span className="font-medium" style={{ color: 'hsl(45, 93%, 47%)' }}>{meal.fat_g}g gord</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-3">
            {recipes.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border/50">
                <ChefHat className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Nenhuma receita gerada</p>
                <Button onClick={() => navigate("/upload")} size="sm">Gerar Receita</Button>
              </Card>
            ) : (
              recipes.map((recipe) => (
                <Card key={recipe.id} className="p-4 border-border/40 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{recipe.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{new Date(recipe.created_at).toLocaleDateString("pt-PT")}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteRecipe(recipe.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px]">{recipe.time_minutes} min</Badge>
                    <Badge variant="outline" className="text-[10px]">{recipe.difficulty}</Badge>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span><strong className="text-foreground">{recipe.calories_per_portion}</strong> kcal</span>
                    <span><strong style={{ color: 'hsl(142, 71%, 45%)' }}>{recipe.protein_g}g</strong> prot</span>
                    <span><strong className="text-primary">{recipe.carbs_g}g</strong> carb</span>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-3">
            {favorites.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border/50">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">Sem favoritos</p>
                <Button onClick={() => navigate("/upload")} size="sm">Descobrir Receitas</Button>
              </Card>
            ) : (
              favorites.map((favorite) => (
                <Card key={favorite.id} className="p-4 border-border/40 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5 text-destructive fill-current" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-sm">{favorite.recipe_name}</h3>
                        <p className="text-[10px] text-muted-foreground">{new Date(favorite.created_at).toLocaleDateString("pt-PT")}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteFavorite(favorite.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                  {favorite.why_recommended && (
                    <p className="text-[10px] text-primary bg-primary/5 p-2 rounded mb-2">💡 {favorite.why_recommended}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {favorite.time_minutes && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Clock className="w-2.5 h-2.5" />{favorite.time_minutes} min
                      </Badge>
                    )}
                    {favorite.difficulty && <Badge variant="outline" className="text-[10px]">{favorite.difficulty}</Badge>}
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span><strong className="text-foreground">{favorite.calories || 0}</strong> kcal</span>
                    <span><strong style={{ color: 'hsl(142, 71%, 45%)' }}>{favorite.protein_g || 0}g</strong> prot</span>
                    <span><strong className="text-primary">{favorite.carbs_g || 0}g</strong> carb</span>
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
