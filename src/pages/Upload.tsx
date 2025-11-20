import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload as UploadIcon, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { imageBase64, goal }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Análise concluída!",
        description: "Veja os resultados abaixo.",
      });
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível analisar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
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
                    <Card className="bg-muted/50 p-6 space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Resultados da Análise</h3>
                      </div>

                      {/* Descrição Geral */}
                      {result.description && (
                        <div className="bg-card p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Descrição do Prato</h4>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      )}

                      {/* Totais Nutricionais */}
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

                      {/* Detalhes por Item */}
                      {result.items && result.items.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">Análise Detalhada por Elemento</h4>
                          <div className="space-y-2">
                            {result.items.map((item: any, index: number) => (
                              <div key={index} className="bg-card p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-foreground">{item.name}</h5>
                                  <span className="text-sm font-bold text-primary">{item.estimated_grams}g</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Cal</p>
                                    <p className="font-semibold">{item.calories}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Prot</p>
                                    <p className="font-semibold">{item.protein_g}g</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Carb</p>
                                    <p className="font-semibold">{item.carbs_g}g</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Gord</p>
                                    <p className="font-semibold">{item.fat_g}g</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Análise e Recomendações */}
                      {result.analysis && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                            <h4 className="text-sm font-semibold text-primary">
                              {goal === "lose" ? "Análise para Perda de Peso" : goal === "gain" ? "Análise para Ganho de Peso" : "Análise para Manutenção de Peso"}
                            </h4>
                            
                            {goal === "lose" && result.analysis.for_loss && (
                              <div className="space-y-2">
                                <p className="text-sm text-foreground">{result.analysis.for_loss.assessment}</p>
                                {result.analysis.for_loss.remove && result.analysis.for_loss.remove.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-destructive mb-1">Remover ou Reduzir:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                      {result.analysis.for_loss.remove.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.analysis.for_loss.add && result.analysis.for_loss.add.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-green-600 mb-1">Adicionar:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                      {result.analysis.for_loss.add.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.analysis.for_loss.portion_adjustments && (
                                  <p className="text-xs text-muted-foreground"><strong>Ajustes:</strong> {result.analysis.for_loss.portion_adjustments}</p>
                                )}
                              </div>
                            )}

                            {goal === "maintain" && result.analysis.for_maintain && (
                              <div className="space-y-2">
                                <p className="text-sm text-foreground">{result.analysis.for_maintain.assessment}</p>
                                {result.analysis.for_maintain.adjustments && result.analysis.for_maintain.adjustments.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-primary mb-1">Ajustes Sugeridos:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                      {result.analysis.for_maintain.adjustments.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {goal === "gain" && result.analysis.for_gain && (
                              <div className="space-y-2">
                                <p className="text-sm text-foreground">{result.analysis.for_gain.assessment}</p>
                                {result.analysis.for_gain.add && result.analysis.for_gain.add.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-green-600 mb-1">Adicionar:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                      {result.analysis.for_gain.add.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.analysis.for_gain.increase && result.analysis.for_gain.increase.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-blue-600 mb-1">Aumentar Porção:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                      {result.analysis.for_gain.increase.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.analysis.for_gain.portion_adjustments && (
                                  <p className="text-xs text-muted-foreground"><strong>Ajustes:</strong> {result.analysis.for_gain.portion_adjustments}</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Porção estimada: {result.portion_size} • Confiança: {(result.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}

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
