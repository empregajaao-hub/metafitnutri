import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload as UploadIcon, Target, TrendingUp, Scale, ArrowLeft, Sparkles, ChevronRight, Zap, Info, ShieldCheck, History, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import MealAnalysisResult from "@/components/MealAnalysisResult";
import logoImage from "@/assets/logo.png";
import ExtraIngredientsInput from "@/components/ExtraIngredientsInput";
import IngredientGallery from "@/components/IngredientGallery";
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
  const [showGallery, setShowGallery] = useState(false);
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
            <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-10 font-medium">
              Cria uma conta para analisar as tuas refeições com a nossa IA avançada.
            </p>
            <div className="flex flex-col gap-4">
              <Button onClick={() => navigate("/auth")} className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Entrar / Criar conta</Button>
              <Button variant="outline" onClick={() => navigate("/")} className="h-14 rounded-2xl font-bold">Voltar ao Início</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCameraButtonClick = () => {
    console.log("Camera button clicked, ref:", cameraInputRef.current);
    if (cameraInputRef.current) {
      try {
        cameraInputRef.current.click();
      } catch (err) {
        console.error("Erro ao abrir a câmera:", err);
        toast({
          title: "Erro ao abrir câmera",
          description: "Não foi possível aceder à câmara. Tenta usar a galeria.",
          variant: "destructive"
        });
      }
    } else {
      console.error("cameraInputRef.current é nulo");
    }
  };
  const handleGalleryButtonClick = () => fileInputRef.current?.click();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) {
      console.log("Nenhum arquivo selecionado");
      return;
    }

    try {
      console.log("Arquivo capturado:", file.name, file.type, file.size);
      
      if (!file.type.startsWith('image/')) {
        toast({ title: "Arquivo inválido", description: "Selecione uma imagem.", variant: "destructive" });
        return;
      }

      toast({ title: "Processando...", description: "Otimizando imagem para análise." });

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
        toast({ title: "Foto pronta!", description: "Agora escolhe o teu objetivo." });
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast({ 
        title: "Erro ao processar imagem", 
        description: error.message || "Tente novamente.", 
        variant: "destructive" 
      });
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { imageBase64, goal, additionalIngredients: additionalIngredients || undefined }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      if (!data || typeof data !== 'object') {
        throw new Error("A resposta da análise está vazia ou num formato inválido.");
      }
      
      setResult(data);
      toast({ title: "Análise Concluída!", description: "Vê os teus resultados personalizados." });
    } catch (error: any) {
      console.error("Erro na análise de refeição:", error);
      toast({ 
        title: "Erro na Análise", 
        description: error.message || "Ocorreu um erro ao processar a análise. Tenta novamente.", 
        variant: "destructive" 
      });
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
    setShowGallery(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSelectIngredient = (ingredient: any) => {
    const ingredientName = ingredient.name;
    setExtraIngredients(prev => {
      if (prev) return `${prev}, ${ingredientName}`;
      return ingredientName;
    });
    toast({
      title: "Ingrediente adicionado!",
      description: `${ingredientName} foi adicionado aos ingredientes extras.`
    });
  };

  const goals = [
    { id: "lose", label: "Perder Peso", icon: TrendingUp, desc: "Foco em défice calórico", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "maintain", label: "Manter Peso", icon: Scale, desc: "Equilíbrio e manutenção", color: "text-primary", bg: "bg-primary/10" },
    { id: "gain", label: "Ganhar Massa", icon: Target, desc: "Superávit para hipertrofia", color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={step === "upload" ? () => navigate("/") : handleReset}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">MetaFit IA</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/history")}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <History className="w-5 h-5" />
            </Button>
          </div>

          <ProfileCompletionBanner missingFields={missingFields} />

          <AnimatePresence mode="wait">
            {/* Upload Step */}
            {step === "upload" && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">Analisar Refeição</h1>
                  <p className="text-base text-muted-foreground font-medium">Tira uma foto e deixa a nossa IA fazer o resto.</p>
                </div>

                <div className="grid gap-5">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className="p-8 border-none bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/20 cursor-pointer group relative overflow-hidden rounded-[2.5rem]"
                      onClick={handleCameraButtonClick}
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors" />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageCapture}
                        className="hidden"
                      />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-md">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight">Tirar Foto</h3>
                          <p className="text-sm text-white/70 font-medium">Usar a câmara agora</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/40 ml-auto group-hover:text-white transition-colors" />
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card 
                      className="p-8 border-none bg-muted/50 hover:bg-muted transition-all cursor-pointer group relative overflow-hidden rounded-[2.5rem]"
                      onClick={handleGalleryButtonClick}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageCapture}
                        className="hidden"
                      />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                          <UploadIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground tracking-tight">Galeria</h3>
                          <p className="text-sm text-muted-foreground font-medium">Escolher foto guardada</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                </div>

                {/* Ingredient Gallery Section - Always visible in step upload */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 px-2">
                    <Apple className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Biblioteca Nutricional</h4>
                  </div>
                  
                  {!showGallery ? (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setShowGallery(true)}
                        className="w-full h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-secondary border-none"
                      >
                        📚 Galeria de Frutas e Legumes
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="bg-muted/20 p-4 rounded-[2.5rem] border border-primary/10">
                      <IngredientGallery onSelectIngredient={handleSelectIngredient} />
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Card className="p-6 border-none bg-primary/5 rounded-[2rem]">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary">Como funciona?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          A nossa IA identifica cada alimento, estima o peso e calcula os macronutrientes exatos para o teu objetivo.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Goal Step */}
            {step === "goal" && (
              <motion.div 
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-black text-foreground tracking-tight">Qual o teu objetivo?</h1>
                  <p className="text-base text-muted-foreground font-medium">Personaliza a análise para os teus resultados.</p>
                </div>

                {/* Image Preview - Elegant */}
                {selectedImage && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative p-4 border-none bg-background rounded-[2.5rem] overflow-hidden">
                      <div className="flex items-center gap-5">
                        <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-lg">
                          <img 
                            src={selectedImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-foreground truncate">{imagePreview?.name || "Imagem selecionada"}</p>
                          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            {imagePreview?.size} • {imagePreview?.dimensions}
                          </p>
                          <Button variant="link" onClick={handleReset} className="p-0 h-auto text-xs font-black text-primary uppercase mt-2">Trocar Foto</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Extra Ingredients */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <Info className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ingredientes Extras</h4>
                  </div>
                  <ExtraIngredientsInput 
                    ingredients={extraIngredients}
                    onIngredientsChange={setExtraIngredients}
                  />
                </div>

                {/* Goal Selection */}
                <div className="grid gap-4">
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <motion.div key={goal.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                          className={`p-6 border-none cursor-pointer transition-all rounded-[2rem] shadow-sm ${
                            selectedGoal === goal.id ? "ring-2 ring-primary bg-primary/5 shadow-lg" : "bg-muted/30 hover:bg-muted/50"
                          }`}
                          onClick={() => !analyzing && handleGoalSelect(goal.id as Goal)}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl ${goal.bg} flex items-center justify-center shadow-inner`}>
                              <Icon className={`w-6 h-6 ${goal.color}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-foreground tracking-tight">{goal.label}</h3>
                              <p className="text-sm font-medium text-muted-foreground">{goal.desc}</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ml-auto ${selectedGoal === goal.id ? "text-primary" : "text-muted-foreground/30"}`} />
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Result Step */}
            {step === "result" && (
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {analyzing ? (
                  <div className="flex flex-col items-center py-12">
                    {/* Elegant Logo at the top */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="mb-12 relative"
                    >
                      <div className="absolute inset-0 rounded-full blur-2xl bg-primary/30 animate-pulse" />
                      <img 
                        src={logoImage} 
                        alt="MetaFit Nutri" 
                        className="w-24 h-24 object-cover rounded-full border-4 border-white/20 shadow-2xl relative z-10"
                      />
                    </motion.div>

                    {/* Scanning animation on the actual photo */}
                    {selectedImage && (
                      <div className="relative w-72 h-72 rounded-[3rem] overflow-hidden mb-12 shadow-2xl border-8 border-white/10">
                        <motion.img 
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                          src={selectedImage} 
                          alt="A analisar" 
                          className="w-full h-full object-cover grayscale-[0.2]" 
                        />
                        {/* Glassy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/30 backdrop-blur-[1px]" />
                        
                        {/* Scan line refined */}
                        <motion.div 
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_30px_rgba(255,255,255,1)] z-20" 
                        />

                        {/* AI Node points */}
                        <div className="absolute inset-0 z-10 opacity-60">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                              className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                              style={{ 
                                top: `${Math.random() * 80 + 10}%`, 
                                left: `${Math.random() * 80 + 10}%` 
                              }}
                            />
                          ))}
                        </div>

                        {/* Modern corner brackets */}
                        <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white/40 rounded-tl-xl" />
                        <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white/40 rounded-tr-xl" />
                        <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white/40 rounded-bl-xl" />
                        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white/40 rounded-br-xl" />
                      </div>
                    )}

                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex gap-1">
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">IA a Processar...</h2>
                      </div>
                      <p className="text-muted-foreground font-medium max-w-[250px] mx-auto">
                        Estamos a identificar os alimentos e a calcular os macros exatos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <MealAnalysisResult result={result} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <MobileBottomNav />
      <AIAssistant />
    </>
  );
};

export default Upload;
