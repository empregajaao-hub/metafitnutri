import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload as UploadIcon, Target, TrendingUp, Scale, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import UploadPaymentModal from "@/components/UploadPaymentModal";
import AIAssistant from "@/components/AIAssistant";

type Goal = "lose" | "maintain" | "gain" | null;

const Upload = () => {
  const [step, setStep] = useState<"upload" | "goal" | "result">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setStep("goal");
    };
    reader.readAsDataURL(file);
  };

  const handleGoalSelect = async (goal: Goal) => {
    if (!goal || !selectedImage) return;
    
    setSelectedGoal(goal);
    
    // Se não autenticado, mostrar modal de pagamento
    if (!isAuthenticated) {
      setShowPaymentModal(true);
      return;
    }

    // Se autenticado, processar análise
    await analyzeImage(goal, selectedImage);
  };

  const analyzeImage = async (goal: Goal, imageBase64: string) => {
    setAnalyzing(true);
    setStep("result");
    
    toast({
      title: "Analisando a foto…",
      description: "Isto pode levar alguns segundos.",
    });

    try {
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
      setStep("goal");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedImage(null);
    setSelectedGoal(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={step === "upload" ? () => navigate("/") : handleReset}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "upload" ? "Voltar" : "Recomeçar"}
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Analise a Sua Refeição
                  </h2>
                  <p className="text-muted-foreground">
                    Escolha como deseja enviar a foto do seu prato
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Botão Tirar Foto */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-smooth cursor-pointer group">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="camera-input"
                    />
                    <label htmlFor="camera-input" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth">
                          <Camera className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground mb-1">
                            Tirar Foto
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Use a câmera para fotografar seu prato
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Botão Enviar da Galeria */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-smooth cursor-pointer group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth">
                          <UploadIcon className="w-8 h-8 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground mb-1">
                            Enviar da Galeria
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Escolha uma foto existente no seu telefone
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Goal Selection */}
          {step === "goal" && selectedImage && (
            <Card className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Qual é o seu objetivo?
                  </h2>
                  <p className="text-muted-foreground">
                    Escolha sua meta para receber análise personalizada
                  </p>
                </div>

                {/* Preview da imagem */}
                <div className="rounded-lg overflow-hidden max-h-48">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid gap-4">
                  <Card
                    className="p-6 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary"
                    onClick={() => handleGoalSelect("lose")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-destructive rotate-180" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground">Perder Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Déficit calórico e redução de gordura
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary"
                    onClick={() => handleGoalSelect("maintain")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Scale className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground">Manter Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Equilíbrio nutricional e manutenção
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary"
                    onClick={() => handleGoalSelect("gain")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground">Ganhar Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Superávit calórico e ganho de massa
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Result */}
          {step === "result" && (
            <Card className="p-8">
              {analyzing ? (
                <div className="text-center space-y-4 py-12">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Analisando sua refeição...</p>
                    <p className="text-sm text-muted-foreground">Isto pode levar alguns segundos</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Análise Completa</h3>
                  </div>

                  {/* Imagem do Prato */}
                  {selectedImage && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={selectedImage} 
                        alt="Prato analisado" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Descrição */}
                  {result.description && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Descrição do Prato</h4>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                  )}

                  {/* Macros */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Calorias</p>
                      <p className="text-2xl font-bold text-primary">{result.estimated_calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Proteínas</p>
                      <p className="text-2xl font-bold text-secondary">{result.protein_g}g</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Carboidratos</p>
                      <p className="text-2xl font-bold text-accent">{result.carbs_g}g</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Gorduras</p>
                      <p className="text-2xl font-bold text-orange-500">{result.fat_g}g</p>
                    </div>
                  </div>

                  {/* Análise baseada no objetivo */}
                  {result.analysis && selectedGoal && (
                    <div className="bg-primary/10 p-6 rounded-lg space-y-4">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {selectedGoal === "lose" ? "Análise para Perda de Peso" : 
                         selectedGoal === "gain" ? "Análise para Ganho de Peso" : 
                         "Análise para Manutenção de Peso"}
                      </h4>
                      
                      {selectedGoal === "lose" && result.analysis.for_loss && (
                        <div className="space-y-3">
                          <p className="text-sm text-foreground">{result.analysis.for_loss.assessment}</p>
                          {result.analysis.for_loss.remove && result.analysis.for_loss.remove.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-destructive mb-2">❌ Remover ou Reduzir:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {result.analysis.for_loss.remove.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.analysis.for_loss.add && result.analysis.for_loss.add.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-green-600 mb-2">✅ Adicionar:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {result.analysis.for_loss.add.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedGoal === "maintain" && result.analysis.for_maintain && (
                        <div className="space-y-3">
                          <p className="text-sm text-foreground">{result.analysis.for_maintain.assessment}</p>
                          {result.analysis.for_maintain.adjustments && result.analysis.for_maintain.adjustments.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-primary mb-2">💡 Ajustes Sugeridos:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {result.analysis.for_maintain.adjustments.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedGoal === "gain" && result.analysis.for_gain && (
                        <div className="space-y-3">
                          <p className="text-sm text-foreground">{result.analysis.for_gain.assessment}</p>
                          {result.analysis.for_gain.add && result.analysis.for_gain.add.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-green-600 mb-2">✅ Adicionar:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {result.analysis.for_gain.add.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4" />
                      Nova Análise
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => navigate('/pricing')}
                      className="flex-1"
                    >
                      Ver Planos
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          )}
        </div>
      </div>

      <UploadPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => {
          setShowPaymentModal(false);
          setStep("goal");
        }} 
      />
      
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Upload;
