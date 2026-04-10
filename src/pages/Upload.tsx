import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload as UploadIcon, Target, TrendingUp, Scale, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import MealAnalysisResult from "@/components/MealAnalysisResult";
import ExtraIngredientsInput from "@/components/ExtraIngredientsInput";
import imageCompression from 'browser-image-compression';
import { useSubscriptionGuard } from "@/hooks/useSubscriptionGuard";
import SubscriptionWall from "@/components/SubscriptionWall";

type Goal = "lose" | "maintain" | "gain" | null;

const Upload = () => {
  const [step, setStep] = useState<"upload" | "goal" | "result">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<{name: string, size: string, dimensions: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missingFields } = useProfileCompletion();

  const { isExpired, isLoading: guardLoading } = useSubscriptionGuard();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Para analisar refeições, faz login ou cria uma conta.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="max-w-sm mx-auto text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-8">
              Cria uma conta para analisar refeições por foto.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/auth")}>Entrar / Criar conta</Button>
              <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCameraButtonClick = () => cameraInputRef.current?.click();
  const handleGalleryButtonClick = () => fileInputRef.current?.click();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Selecione uma imagem.", variant: "destructive" });
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 20MB.", variant: "destructive" });
        return;
      }

      toast({ title: "Processando...", description: "Otimizando imagem." });

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
        size: `${(compressedFile.size / 1024).toFixed(1)} KB`,
        dimensions: `${img.width} x ${img.height}px`
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setStep("goal");
        URL.revokeObjectURL(objectUrl);
        toast({ title: "Foto pronta!", description: "Escolha o seu objetivo." });
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const handleGoalSelect = async (goal: Goal) => {
    if (!goal || !selectedImage) return;
    setSelectedGoal(goal);
    await analyzeImage(goal, selectedImage, extraIngredients);
  };

  const analyzeImage = async (goal: Goal, imageBase64: string, additionalIngredients: string = "") => {
    try {
      setAnalyzing(true);
      setStep("result");
      
      toast({ title: "Analisando...", description: "Isto pode levar alguns segundos." });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("plan, is_active, end_date, trial_start_date, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const now = new Date();
      const trialStart = new Date(sub?.trial_start_date || sub?.created_at || now.toISOString());
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const hasActivePaidPlan = !!sub && sub.is_active && sub.plan !== "free" && !!sub.end_date && new Date(sub.end_date).getTime() > now.getTime();
      const isTrialActive = now.getTime() <= trialEnd.getTime();

      if (!hasActivePaidPlan && !isTrialActive) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(startOfDay);
        nextDay.setDate(nextDay.getDate() + 1);

        const { data: todaysAnalyses } = await supabase
          .from("meal_analyses")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
          .lt("created_at", nextDay.toISOString())
          .limit(2);

        if ((todaysAnalyses?.length || 0) >= 1) {
          toast({
            title: "Limite diário",
            description: "Subscreve para análises ilimitadas.",
            variant: "destructive",
          });
          navigate("/subscription");
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { imageBase64, goal, additionalIngredients: additionalIngredients || undefined }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      setResult(data);
      toast({ title: "Concluído!", description: "Veja os resultados." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setStep("goal");
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedImage(null);
    setSelectedGoal(null);
    setResult(null);
    setAnalyzing(false);
    setImagePreview(null);
    setExtraIngredients("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const goals = [
    { id: "lose", label: "Perder Peso", icon: TrendingUp, desc: "Défice calórico" },
    { id: "maintain", label: "Manter", icon: Scale, desc: "Equilíbrio" },
    { id: "gain", label: "Ganhar Massa", icon: Target, desc: "Superávit" },
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          {/* Header */}
          <Button
            variant="ghost"
            size="icon"
            onClick={step === "upload" ? () => navigate("/") : handleReset}
            className="rounded-full mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <ProfileCompletionBanner missingFields={missingFields} />

          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Analisar Refeição</h1>
                <p className="text-sm text-muted-foreground">Tire uma foto ou envie da galeria</p>
              </div>

              <div className="grid gap-4">
                <Card 
                  className="p-6 border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={handleCameraButtonClick}
                >
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Tirar Foto</h3>
                      <p className="text-sm text-muted-foreground">Use a câmera do dispositivo</p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={handleGalleryButtonClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Enviar da Galeria</h3>
                      <p className="text-sm text-muted-foreground">Selecione uma imagem</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Info */}
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Comida Pronta:</strong> Análise nutricional completa</p>
                    <p><strong className="text-foreground">Ingredientes Crus:</strong> Sugestões de receitas angolanas</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Goal Step */}
          {step === "goal" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Qual é o seu objetivo?</h1>
                <p className="text-sm text-muted-foreground">Selecione para personalizar a análise</p>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <Card className="p-3 border-border/50">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="text-xs text-muted-foreground">
                      {imagePreview && (
                        <>
                          <p className="truncate max-w-[180px]">{imagePreview.name}</p>
                          <p>{imagePreview.size} • {imagePreview.dimensions}</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Extra Ingredients */}
              <ExtraIngredientsInput 
                ingredients={extraIngredients}
                onIngredientsChange={setExtraIngredients}
              />

              {/* Goal Selection */}
              <div className="grid gap-3">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <Card
                      key={goal.id}
                      className={`p-4 border-border/50 cursor-pointer transition-all ${
                        selectedGoal === goal.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/20"
                      }`}
                      onClick={() => !analyzing && handleGoalSelect(goal.id as Goal)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{goal.label}</h3>
                          <p className="text-xs text-muted-foreground">{goal.desc}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

	          {/* Result Step */}
	          {step === "result" && (
	            <div className="space-y-6">
	              {analyzing ? (
	                <div className="flex flex-col items-center py-12">
	                  {/* Scanning animation on the actual photo */}
	                  {selectedImage && (
	                    <div className="relative w-64 h-64 rounded-[2rem] overflow-hidden mb-10 shadow-glow border-4 border-white/10">
	                      <motion.img 
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          src={selectedImage} 
                          alt="A analisar" 
                          className="w-full h-full object-cover grayscale-[0.3]" 
                        />
	                      {/* Glassy overlay */}
	                      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/20 backdrop-blur-[1px]" />
	                      
                        {/* Scan line refined */}
	                      <motion.div 
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(0,180,255,1)] z-20" 
                        />

                        {/* AI Node points */}
                        <div className="absolute inset-0 z-10 opacity-40">
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                              className="absolute w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_white]"
                              style={{ 
                                top: `${Math.random() * 80 + 10}%`, 
                                left: `${Math.random() * 80 + 10}%` 
                              }}
                            />
                          ))}
                        </div>

	                      {/* Modern corner brackets */}
	                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/60 rounded-tl-lg" />
	                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/60 rounded-tr-lg" />
	                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/60 rounded-bl-lg" />
	                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/60 rounded-br-lg" />
	                      
                        {/* Center crosshair */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <div className="w-12 h-12 border border-white/40 rounded-full" />
                          <div className="absolute w-4 h-0.5 bg-white" />
                          <div className="absolute h-4 w-0.5 bg-white" />
                        </div>
	                    </div>
	                  )}
	                  
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">IA Vision em curso</span>
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">A identificar ingredientes...</h2>
                      <p className="text-xs text-white/40 max-w-[240px] mx-auto leading-relaxed">
                        A nossa inteligência artificial está a calcular calorias e macros para o seu objetivo de <span className="text-primary font-bold">{selectedGoal === 'lose' ? 'Perda de Peso' : selectedGoal === 'gain' ? 'Ganho de Massa' : 'Manutenção'}</span>.
                      </p>
                    </div>
	                </div>
	              ) : result ? (
                <>
                  {isExpired && (
                    <SubscriptionWall feature="Análise de Refeições" />
                  )}
                  {!isExpired && <MealAnalysisResult result={result} />}
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Nova Análise
                  </Button>
                </>
              ) : (
                <Card className="p-8 text-center border-border/50">
                  <p className="text-muted-foreground mb-4">Não foi possível analisar</p>
                  <Button onClick={handleReset}>Tentar Novamente</Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AIAssistant />
      <MobileBottomNav />
    </>
  );
};

export default Upload;
