import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ChefHat, 
  Camera, 
  Search, 
  Loader2, 
  Flame, 
  Clock, 
  Utensils,
  History as HistoryIcon,
  Plus,
  Info,
  ChevronRight,
  Sparkles,
  Upload,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";

const AngolanRecipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [recipeDescription, setRecipeDescription] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserGoal(profile.Objetivo);
      }
    } else {
      navigate("/auth");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const generateRecipe = async () => {
    if (!recipeDescription && selectedImages.length === 0) {
      toast({
        title: "Informação necessária",
        description: "Por favor, descreva os ingredientes ou tire uma foto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: { 
          imagesBase64: selectedImages,
          description: recipeDescription,
          goal: userGoal || 'maintain'
        }
      });

      if (error) throw error;
      setGeneratedRecipe(data);
      toast({
        title: "Receita Gerada!",
        description: "Aqui está a sua sugestão de comida angolana saudável.",
      });
    } catch (error: any) {
      console.error("Error generating recipe:", error);
      toast({
        title: "Erro ao gerar receita",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getGoalLabel = (goal: string | null) => {
    switch (goal) {
      case 'lose': return 'Perder Peso';
      case 'gain': return 'Ganhar Peso';
      case 'maintain': return 'Manter Peso';
      default: return 'Objetivo Geral';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-md sticky top-0 z-30 border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="rounded-full h-9 w-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Receitas Angolanas</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Personalizadas para: {getGoalLabel(userGoal)}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/history')} 
            className="rounded-full h-9 w-9 text-primary"
          >
            <HistoryIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Intro Card */}
        <Card variant="glass" className="p-5 border-none bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-12 -mt-12" />
          <div className="relative z-10 flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">O que vamos cozinhar hoje?</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Gere receitas angolanas saudáveis baseadas nos seus ingredientes ou no seu objetivo de saúde.
              </p>
            </div>
          </div>
        </Card>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Descreva os ingredientes disponíveis
            </label>
            <div className="relative">
              <textarea
                placeholder="Ex: Tenho peixe fresco, beringela, óleo de palma e fuba de milho..."
                className="w-full min-h-[100px] bg-card/30 border-border/50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <label className="cursor-pointer h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Camera className="w-5 h-5 text-primary" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Selected Images Preview */}
          <AnimatePresence>
            {selectedImages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative shrink-0">
                    <img 
                      src={img} 
                      alt="Ingrediente" 
                      className="w-20 h-20 rounded-xl object-cover border border-white/10"
                    />
                    <button 
                      onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            className="w-full h-12 rounded-2xl font-bold gap-2 shadow-glow"
            disabled={isGenerating}
            onClick={generateRecipe}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando Receita Angolana...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Receita Saudável
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {generatedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Ingredients Analysis */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Análise de Ingredientes Crus
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {generatedRecipe.identified_ingredients?.map((ing: any, idx: number) => (
                  <Card key={idx} variant="glass" className="p-3 border-none flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Info className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{ing.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-medium">{ing.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                      {ing.estimated_quantity}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main Recipe */}
            <Card variant="glass" className="p-0 overflow-hidden border-none bg-card/40">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 bg-primary/20 text-primary border-none hover:bg-primary/30">
                      Sugestão do Chef
                    </Badge>
                    <h2 className="text-xl font-black text-white">{generatedRecipe.main_recipe?.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{generatedRecipe.main_recipe?.nutrition_per_portion?.calories} kcal</span>
                    </div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">por porção</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed italic">
                  "{generatedRecipe.main_recipe?.description}"
                </p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Tempo</p>
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold">{generatedRecipe.main_recipe?.time_minutes} min</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Dificuldade</p>
                    <span className="text-xs font-bold text-white capitalize">{generatedRecipe.main_recipe?.difficulty}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Porções</p>
                    <span className="text-xs font-bold text-white">{generatedRecipe.main_recipe?.portions}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Ingredientes Detalhados</h4>
                    <ul className="space-y-2">
                      {generatedRecipe.main_recipe?.ingredients_detailed?.map((ing: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>
                            <span className="font-bold text-white">{ing.ingredient}</span>: {ing.preparation} ({ing.quantity_grams}g)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Modo de Preparação</h4>
                    <ol className="space-y-3">
                      {generatedRecipe.main_recipe?.steps?.map((step: string, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-white/80 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Objective Analysis */}
                <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Análise para {getGoalLabel(userGoal)}
                    </h4>
                  </div>
                  
                  {userGoal === 'lose' && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/80 leading-relaxed">
                        {generatedRecipe.main_recipe?.analysis?.for_loss?.assessment}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedRecipe.main_recipe?.analysis?.for_loss?.modifications?.map((m: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-primary/30 text-primary/80">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userGoal === 'maintain' && (
                    <p className="text-xs text-white/80 leading-relaxed">
                      {generatedRecipe.main_recipe?.analysis?.for_maintain?.assessment}
                    </p>
                  )}

                  {userGoal === 'gain' && (
                    <p className="text-xs text-white/80 leading-relaxed">
                      {generatedRecipe.main_recipe?.analysis?.for_gain?.assessment}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Alternative Recipes */}
            {generatedRecipe.alternative_recipes?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                  Outras Opções Rápidas
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {generatedRecipe.alternative_recipes.map((alt: any, idx: number) => (
                    <Card key={idx} variant="glass" className="p-4 border-none bg-card/30 flex items-center justify-between group hover:bg-card/50 transition-colors cursor-pointer">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{alt.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {alt.time_minutes} min
                          </span>
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {alt.nutrition_per_portion?.calories} kcal
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default AngolanRecipes;
