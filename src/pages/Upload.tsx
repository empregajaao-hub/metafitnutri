import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload as UploadIcon, Target, TrendingUp, Scale, ArrowLeft, Sparkles, Clock, Utensils, Activity, AlertCircle, FileImage } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import UploadPaymentModal from "@/components/UploadPaymentModal";
import AIAssistant from "@/components/AIAssistant";
import { useFreeUsageTracker } from "@/hooks/useFreeUsageTracker";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MealAnalysisResult from "@/components/MealAnalysisResult";
import imageCompression from 'browser-image-compression';

type Goal = "lose" | "maintain" | "gain" | null;

const Upload = () => {
  const [step, setStep] = useState<"upload" | "goal" | "result">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<{name: string, size: string, dimensions: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    hasReachedLimit, 
    getTimeUntilReset, 
    incrementUsage, 
    shouldApplyLimit,
    isAuthenticated,
    userPlan
  } = useFreeUsageTracker();
  const { missingFields } = useProfileCompletion();

  useEffect(() => {
    // Atualizar cronômetro a cada segundo
    const interval = setInterval(() => {
      const remaining = getTimeUntilReset();
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeRemaining("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilReset]);

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
      if (hasReachedLimit()) {
        const message = !isAuthenticated 
          ? "Você atingiu o limite de 1 análise gratuita. Aguarde 24h ou crie uma conta."
          : "Você atingiu o limite de 1 análise do plano gratuito. Aguarde 24h ou assine um plano.";
        
        toast({
          title: "Limite atingido",
          description: message,
          variant: "destructive",
        });
        return;
      }

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

      // Comprimir imagem usando browser-image-compression
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg' as const
      };

      const compressedFile = await imageCompression(file, options);
      
      // Obter dimensões da imagem
      const img = new Image();
      const objectUrl = URL.createObjectURL(compressedFile);
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = objectUrl;
      });

      // Preparar preview
      setImagePreview({
        name: file.name,
        size: `${(compressedFile.size / 1024).toFixed(1)} KB (otimizado de ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
        dimensions: `${img.width} x ${img.height}px`
      });

      // Converter para base64
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
    
    // SEMPRE processar análise primeiro (logado ou não)
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
        body: { imageBase64, goal, isAuthenticated }
      });

      if (error) {
        console.error("Erro da edge function:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Resposta vazia do servidor");
      }

      console.log("Análise recebida com sucesso");
      setResult(data);
      
      if (shouldApplyLimit()) {
        incrementUsage();
      }
      
      toast({
        title: "Análise concluída!",
        description: "Veja os resultados abaixo. Leia com calma, sem limite de tempo.",
      });

      // Modal após 20 segundos para usuários sem plano pago
      if (shouldApplyLimit()) {
        setTimeout(() => {
          setShowPaymentModal(true);
        }, 20000);
      }
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
              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">📊 Análise Completa:</strong> Identificamos o prato e cada ingrediente, 
                  calculamos calorias e macros, e fornecemos recomendações baseadas no seu objetivo de saúde.
                </p>
              </div>
            </Card>
          )}

          {/* Aviso de limite atingido */}
          {hasReachedLimit() && timeRemaining && (
            <Alert className="border-primary/50 bg-primary/5 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <p className="font-semibold text-foreground mb-1">
                  {!isAuthenticated ? "Limite de 1 análise gratuita atingido" : "Limite do plano gratuito atingido"}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Você poderá fazer outra análise em:
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-background px-3 py-1 rounded-md border border-border">
                    <span className="text-lg font-mono font-bold text-primary">{timeRemaining}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">ou</span>
                  <Button 
                    size="sm" 
                    onClick={() => setShowPaymentModal(true)}
                    className="min-h-10 shadow-soft hover:shadow-medium"
                  >
                    Assinar Plano
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Informação sobre plano gratuito */}
          {shouldApplyLimit() && step === "upload" && (
            <Alert className="border-primary/50 bg-primary/5 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <p className="font-semibold text-foreground mb-1">📊 Análise Completa no Plano Gratuito</p>
                <p className="text-sm text-muted-foreground">
                  {!isAuthenticated 
                    ? "Faça 1 análise completa por dia com receitas 100% angolanas. Leia sem limite de tempo!"
                    : "Seu plano gratuito inclui 1 análise completa por dia. Leia com calma, sem pressa!"
                  }
                  <strong className="text-foreground"> Assine um plano para análises ilimitadas!</strong>
                </p>
              </AlertDescription>
            </Alert>
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
                   <div className="border-2 border-dashed border-border rounded-lg p-8 md:p-6 hover:border-primary transition-smooth cursor-pointer group bg-gradient-to-br from-primary/5 to-transparent">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="camera-input"
                      disabled={analyzing || hasReachedLimit()}
                    />
                    <label htmlFor="camera-input" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 md:w-12 md:h-12 bg-gradient-primary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth shadow-soft">
                          <Camera className="w-8 h-8 md:w-6 md:h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-lg md:text-base font-semibold text-foreground mb-1">
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
                   <div className="border-2 border-dashed border-border rounded-lg p-8 md:p-6 hover:border-primary transition-smooth cursor-pointer group bg-gradient-to-br from-secondary/5 to-transparent">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageCapture}
                      className="hidden"
                      id="file-input"
                      disabled={analyzing || hasReachedLimit()}
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="w-16 h-16 md:w-12 md:h-12 bg-gradient-secondary rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-smooth shadow-soft">
                          <UploadIcon className="w-8 h-8 md:w-6 md:h-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="text-lg md:text-base font-semibold text-foreground mb-1">
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
            <>
              {/* Preview da Foto com Detalhes */}
              {imagePreview && (
                <Card className="p-4 mb-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-10 h-10 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{imagePreview.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">📦 {imagePreview.size}</span>
                        <span className="text-xs text-muted-foreground">📐 {imagePreview.dimensions}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
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
                    className="p-6 md:p-4 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary group"
                    onClick={() => handleGoalSelect("lose")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-10 md:h-10 bg-destructive/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-smooth">
                        <TrendingUp className="w-6 h-6 md:w-5 md:h-5 text-destructive rotate-180" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground text-lg md:text-base">Perder Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Déficit calórico e redução de gordura
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 md:p-4 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary group"
                    onClick={() => handleGoalSelect("maintain")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-smooth">
                        <Scale className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground text-lg md:text-base">Manter Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Equilíbrio nutricional e manutenção
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 md:p-4 cursor-pointer hover:shadow-medium transition-smooth border-2 hover:border-primary group"
                    onClick={() => handleGoalSelect("gain")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-10 md:h-10 bg-secondary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-smooth">
                        <TrendingUp className="w-6 h-6 md:w-5 md:h-5 text-secondary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-foreground text-lg md:text-base">Ganhar Peso</h3>
                        <p className="text-sm text-muted-foreground">
                          Superávit calórico e ganho de massa
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
            </>
          )}

          {/* Step 3: Result */}
          {step === "result" && (
            <div>
              {analyzing ? (
                <Card className="p-8">
                  <div className="text-center space-y-4 py-12">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">Analisando sua refeição...</p>
                      <p className="text-sm text-muted-foreground">Isto pode levar alguns segundos</p>
                    </div>
                  </div>
                </Card>
              ) : result ? (
                <>
                  <MealAnalysisResult 
                    result={result}
                    onUnlockBenefits={shouldApplyLimit() ? () => setShowPaymentModal(true) : undefined}
                  />
                  
                  {/* Botões de ação */}
                  <Card className="p-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1 min-h-12 shadow-soft hover:shadow-medium"
                      >
                        <Camera className="w-4 h-4" />
                        Nova Análise
                      </Button>
                    </div>
                  </Card>
                </>
              ) : null}
            </div>
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
