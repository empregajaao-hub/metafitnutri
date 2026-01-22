import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload as UploadIcon, Target, TrendingUp, Scale, ArrowLeft, Sparkles, Utensils, Activity, FileImage } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import MealAnalysisResult from "@/components/MealAnalysisResult";
import imageCompression from 'browser-image-compression';

type Goal = "lose" | "maintain" | "gain" | null;

const Upload = () => {
  const [step, setStep] = useState<"upload" | "goal" | "result">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<{name: string, size: string, dimensions: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missingFields } = useProfileCompletion();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Para tirar/enviar foto, faz login ou cria uma conta.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero pb-20">
        <div className="container mx-auto px-4 py-10">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso restrito</h1>
            <p className="text-muted-foreground mb-6">
              Para analisar refeições por foto, é obrigatório ter uma conta.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" onClick={() => navigate("/auth")}>Entrar / Criar conta</Button>
              <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleCameraButtonClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (e.target) {
      e.target.value = "";
    }
    
    if (!file) {
      console.log("Nenhuma foto capturada.");
      return;
    }

    try {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
        return;
      }

      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, selecione uma imagem menor que 20MB.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Processando foto...",
        description: "Otimizando imagem para análise.",
      });

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg' as const
      };

      const compressedFile = await imageCompression(file, options);
      
      const img = new Image();
      const objectUrl = URL.createObjectURL(compressedFile);
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = objectUrl;
      });

      setImagePreview({
        name: file.name,
        size: `${(compressedFile.size / 1024).toFixed(1)} KB (otimizado de ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
        dimensions: `${img.width} x ${img.height}px`
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setStep("goal");
        URL.revokeObjectURL(objectUrl);
        
        toast({
          title: "Foto otimizada!",
          description: "Agora escolha seu objetivo.",
        });
      };
      
      reader.readAsDataURL(compressedFile);
      
    } catch (error) {
      console.error("Erro ao capturar imagem:", error);
      toast({
        title: "Erro ao processar foto",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };


  const handleGoalSelect = async (goal: Goal) => {
    if (!goal || !selectedImage) return;
    
    setSelectedGoal(goal);
    await analyzeImage(goal, selectedImage);
  };

  const analyzeImage = async (goal: Goal, imageBase64: string) => {
    try {
      setAnalyzing(true);
      setStep("result");
      
      toast({
        title: "Analisando a foto…",
        description: "Isto pode levar alguns segundos.",
      });

      if (!imageBase64 || !goal) {
        throw new Error("Dados incompletos para análise");
      }

      console.log("Enviando análise para edge function...");
      
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { imageBase64, goal }
      });

      if (error) {
        console.error("Erro da edge function:", error);
        throw error;
      }

      // Check if data contains an error response
      if (data?.error) {
        console.error("Erro retornado:", data.error);
        throw new Error(data.error);
      }

      if (!data) {
        throw new Error("Resposta vazia do servidor");
      }

      console.log("Análise recebida com sucesso");
      setResult(data);
      
      toast({
        title: "Análise concluída!",
        description: "Veja os resultados abaixo.",
      });

    } catch (error) {
      console.error("Erro ao analisar refeição:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Não foi possível analisar a foto. Tente novamente.";
      
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
      
      setStep("goal");
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    try {
      setStep("upload");
      setSelectedImage(null);
      setSelectedGoal(null);
      setResult(null);
      setAnalyzing(false);
      setImagePreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      
      console.log("Estado resetado com sucesso");
    } catch (error) {
      console.error("Erro ao resetar:", error);
    }
  };

  return (
    <>
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

        <ProfileCompletionBanner missingFields={missingFields} />

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Seção Informativa */}
          {step === "upload" && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-primary" />
                Como Funciona o METAFIT
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">1. Tire uma Foto</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture ou envie uma foto do seu prato
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                    <Target className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">2. Defina seu Objetivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha se quer perder, manter ou ganhar peso
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">3. Receba Análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Veja calorias, macros e recomendações personalizadas
                  </p>
                </div>
              </div>
              
              {/* Informação sobre tipos de foto */}
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm text-foreground font-semibold mb-1">🍽️ Comida Pronta</p>
                  <p className="text-xs text-muted-foreground">
                    Envie foto do seu prato preparado para análise nutricional completa com calorias e macros.
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-sm text-foreground font-semibold mb-1">🥬 Ingredientes Crus</p>
                  <p className="text-xs text-muted-foreground">
                    Envie foto dos ingredientes e receba sugestões de receitas angolanas para o seu objetivo!
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">📊 Análise Inteligente:</strong> O METAFIT detecta automaticamente se é uma refeição pronta ou ingredientes crus, 
                  e fornece análise nutricional ou receitas personalizadas ao seu objetivo.
                </p>
              </div>
            </Card>
          )}

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
                   <div 
                     className="border-2 border-dashed border-border rounded-lg p-8 md:p-6 hover:border-primary transition-smooth cursor-pointer group bg-gradient-to-br from-primary/5 to-transparent"
                     onClick={!analyzing ? handleCameraButtonClick : undefined}
                   >
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="camera-input"
                      disabled={analyzing}
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 md:w-12 md:h-12 bg-gradient-primary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth shadow-soft">
                        <Camera className="w-8 h-8 md:w-6 md:h-6 text-primary-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg md:text-base font-semibold text-foreground mb-1">
                          Tirar Foto
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Use a câmera para fotografar seu prato
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botão Enviar da Galeria */}
                   <div 
                     className="border-2 border-dashed border-border rounded-lg p-8 md:p-6 hover:border-primary transition-smooth cursor-pointer group bg-gradient-to-br from-secondary/5 to-transparent"
                     onClick={!analyzing ? handleGalleryButtonClick : undefined}
                   >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="file-input"
                      disabled={analyzing}
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 md:w-12 md:h-12 bg-gradient-secondary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth shadow-soft">
                        <UploadIcon className="w-8 h-8 md:w-6 md:h-6 text-secondary-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg md:text-base font-semibold text-foreground mb-1">
                          Enviar da Galeria
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Selecione uma foto da sua galeria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, HEIC • Máx: 20MB
                </p>
              </div>
            </Card>
          )}

          {/* Step 2: Goal Selection */}
          {step === "goal" && (
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Qual é o Teu Objetivo?
                  </h2>
                  <p className="text-muted-foreground">
                    Escolhe o teu objetivo para uma análise personalizada
                  </p>
                </div>

                {/* Image Preview */}
                {selectedImage && (
                  <div className="relative max-w-xs mx-auto">
                    <img 
                      src={selectedImage} 
                      alt="Foto selecionada" 
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                    />
                    {imagePreview && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <FileImage className="w-3 h-3" />
                          <span className="truncate">{imagePreview.name}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">{imagePreview.size}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGoalSelect("lose")}
                    disabled={analyzing}
                  >
                    <TrendingUp className="w-8 h-8 text-primary rotate-180" />
                    <span className="font-semibold text-lg">Perder Peso</span>
                    <span className="text-sm text-muted-foreground">
                      Reduzir gordura corporal
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGoalSelect("maintain")}
                    disabled={analyzing}
                  >
                    <Scale className="w-8 h-8 text-secondary" />
                    <span className="font-semibold text-lg">Manter Peso</span>
                    <span className="text-sm text-muted-foreground">
                      Manter peso atual
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGoalSelect("gain")}
                    disabled={analyzing}
                  >
                    <TrendingUp className="w-8 h-8 text-accent" />
                    <span className="font-semibold text-lg">Ganhar Massa</span>
                    <span className="text-sm text-muted-foreground">
                      Aumentar massa muscular
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Result */}
          {step === "result" && (
            <div className="space-y-6">
              {analyzing ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                      Analisando a tua refeição...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Isto pode levar alguns segundos
                    </p>
                  </div>
                </Card>
              ) : result ? (
                <MealAnalysisResult result={result} />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Não foi possível analisar a imagem. Por favor, tente novamente.
                  </p>
                  <Button onClick={handleReset} className="mt-4">
                    Tentar Novamente
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      <AIAssistant />
      <MobileBottomNav />
      </div>
    </>
  );
};

export default Upload;
