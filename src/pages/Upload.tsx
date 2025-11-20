import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload as UploadIcon, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [activeTab, setActiveTab] = useState("meal");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    toast({
      title: "Analisando a foto…",
      description: "Isto pode levar alguns segundos.",
    });

    // Simulate API call with mock data
    setTimeout(() => {
      const mockResult = {
        meal_id: "m_" + Math.random().toString(36).substr(2, 9),
        estimated_calories: 560,
        protein_g: 24,
        carbs_g: 65,
        fat_g: 20,
        portion_size: "1 prato (estimado 420g)",
        confidence: 0.82,
        suggestions: {
          for_loss: "Reduza a porção de carboidratos para metade e acrescente vegetais verdes. Substitua arroz por arroz integral.",
          for_gain: "Adicione uma fonte extra de proteína (ex.: ovo ou iogurte natural) e uma porção extra de carboidratos complexos.",
        },
      };

      setResult(mockResult);
      setAnalyzing(false);
      toast({
        title: "Análise concluída!",
        description: "Veja os resultados abaixo.",
      });
    }, 2000);
  };

  const goal = localStorage.getItem("angonutri_goal") || "maintain";

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Analise a Sua Refeição</h1>
            <p className="text-muted-foreground">
              Tire uma foto da comida pronta ou dos ingredientes para análise nutricional
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="meal">Comida Pronta</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
            </TabsList>

            <TabsContent value="meal" className="space-y-6">
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="meal-upload"
                      disabled={analyzing}
                    />
                    <label htmlFor="meal-upload" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth">
                          <Camera className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground mb-1">
                            Tirar ou Carregar Foto
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tire uma foto da sua refeição pronta
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {analyzing && (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">Analisando a foto…</p>
                    </div>
                  )}

                  {result && !analyzing && (
                    <Card className="bg-muted/50 p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Resultados da Análise</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Calorias</p>
                          <p className="text-2xl font-bold text-primary">{result.estimated_calories}</p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                        <div className="bg-card p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Proteínas</p>
                          <p className="text-2xl font-bold text-secondary">{result.protein_g}g</p>
                        </div>
                        <div className="bg-card p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Carboidratos</p>
                          <p className="text-2xl font-bold text-accent">{result.carbs_g}g</p>
                        </div>
                        <div className="bg-card p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Gorduras</p>
                          <p className="text-2xl font-bold text-orange-500">{result.fat_g}g</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                          Porção estimada: {result.portion_size} • Confiança: {(result.confidence * 100).toFixed(0)}%
                        </p>
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <p className="text-sm font-medium text-primary mb-2">
                            {goal === "lose" ? "Sugestão para perder peso:" : goal === "gain" ? "Sugestão para ganhar peso:" : "Sugestão para manter peso:"}
                          </p>
                          <p className="text-sm text-foreground">
                            {goal === "lose" ? result.suggestions.for_loss : goal === "gain" ? result.suggestions.for_gain : "Mantenha esta porção equilibrada."}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button variant="default" className="flex-1">
                          Guardar Refeição
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Ver Receitas Semelhantes
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-6">
              <Card className="p-8">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="ingredients-upload"
                  />
                  <label htmlFor="ingredients-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth">
                        <UploadIcon className="w-8 h-8 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground mb-1">
                          Carregar Fotos dos Ingredientes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tire fotos dos ingredientes crus que tem disponíveis
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Vamos sugerir receitas adaptadas ao seu objetivo usando ingredientes locais
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Upload;
