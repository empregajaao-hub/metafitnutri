import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload as UploadIcon, ChefHat, ArrowLeft, Sparkles, Search, Utensils, Info, Zap, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import MealAnalysisResult from "@/components/MealAnalysisResult";
import imageCompression from 'browser-image-compression';
import ExtraIngredientsInput from "@/components/ExtraIngredientsInput";

const Recipes = () => {
  const [step, setStep] = useState<"initial" | "goal" | "result">("initial");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ingredientsText, setIngredientsText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userGoal, setUserGoal] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserGoal();
  }, []);

  const fetchUserGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.Objetivo) {
        setUserGoal(profile.Objetivo);
      }
    }
  };

  const handleCameraButtonClick = () => cameraInputRef.current?.click();
  const handleGalleryButtonClick = () => fileInputRef.current?.click();

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;

    try {
      toast({ title: "Processando...", description: "Otimizando imagem." });
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/jpeg' as const };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setStep("goal");
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const handleGenerateFromText = () => {
    if (!ingredientsText.trim()) {
      toast({ title: "Aviso", description: "Descreve os ingredientes que tens." });
      return;
    }
    setStep("goal");
  };

  const handleStartAnalysis = async () => {
    try {
      setAnalyzing(true);
      setStep("result");
      
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { 
          imageBase64: selectedImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // Dummy image if only text
          goal: userGoal || "maintain", 
          additionalIngredients: ingredientsText 
        }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);
      setResult(data);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setStep("initial");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep("initial");
    setSelectedImage(null);
    setIngredientsText("");
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header Premium */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={step === "initial" ? () => navigate("/") : handleReset} 
            className="rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Gerador de Receitas
            </h1>
            <p className="text-xs text-white/70 mt-1 font-medium">Receitas angolanas personalizadas para ti</p>
          </div>
        </motion.div>

        {step === "initial" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6"
          >
            {/* Hero Card com Gradient */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600/30 via-cyan-600/20 to-blue-600/30 backdrop-blur-xl p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/15 blur-3xl rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10 text-center space-y-6">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
                >
                  <ChefHat className="w-10 h-10 text-slate-900" />
                </motion.div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white leading-tight">O que tens na cozinha?</h2>
                  <p className="text-sm text-white font-medium opacity-90">Tira uma foto ou descreve os ingredientes para gerarmos receitas angolanas saudáveis adaptadas ao teu objetivo</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleCameraButtonClick} 
                      className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-black shadow-lg shadow-emerald-500/30 border-0 h-11"
                    >
                      <Camera className="w-4 h-4" /> Foto
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handleGalleryButtonClick} 
                      className="w-full gap-2 border-white/40 text-white hover:bg-white/10 font-bold h-11"
                    >
                      <UploadIcon className="w-4 h-4" /> Galeria
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageCapture} />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="text-xs text-white font-black opacity-60 tracking-widest">OU</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Text Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
                <Utensils className="w-4 h-4 text-emerald-400" /> Descreve os ingredientes:
              </label>
              <Textarea 
                placeholder="Ex: Mandioca, peixe seco, óleo de palma, cebola, alho..." 
                className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-emerald-400/50 focus:ring-emerald-400/20 font-medium"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/30 border-0 h-12" 
                  onClick={handleGenerateFromText} 
                  disabled={!ingredientsText.trim()}
                >
                  <Sparkles className="w-4 h-4" /> Gerar Receitas
                </Button>
              </motion.div>
            </div>

            {/* Info Card Premium */}
            <Card className="p-4 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-blue-400/40 backdrop-blur-xl">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-blue-300" />
                </div>
                <p className="text-xs text-white font-semibold leading-relaxed">
                  As receitas serão adaptadas ao teu objetivo de <span className="font-black text-emerald-400 underline decoration-emerald-400/30 underline-offset-2">{userGoal === 'lose' ? 'Perder Peso' : userGoal === 'gain' ? 'Ganhar Massa' : 'Manter Peso'}</span> com análise completa de macronutrientes.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "goal" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="space-y-6"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600/30 via-cyan-600/20 to-blue-600/30 backdrop-blur-xl p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 blur-3xl rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10 text-center space-y-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
                >
                  <Sparkles className="w-10 h-10 text-slate-900" />
                </motion.div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white leading-tight">Tudo pronto!</h2>
                  <p className="text-sm text-white font-medium opacity-90">
                    Vou analisar os teus ingredientes e sugerir as melhores receitas angolanas para o teu objetivo.
                  </p>
                </div>

                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video rounded-2xl overflow-hidden border border-white/30 shadow-2xl shadow-emerald-500/20"
                  >
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  </motion.div>
                )}

                <div className="space-y-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-12 text-lg font-black bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-slate-950 shadow-lg shadow-emerald-500/30 border-0" 
                      onClick={handleStartAnalysis}
                    >
                      Começar Análise
                    </Button>
                  </motion.div>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full border-white/40 text-white hover:bg-white/10 font-bold"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {analyzing ? (
              <Card className="p-12 text-center space-y-4 border-0 bg-gradient-to-br from-emerald-600/30 via-cyan-600/20 to-blue-600/30 backdrop-blur-xl">
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xl font-black text-white animate-pulse">A criar as tuas receitas...</p>
                <p className="text-sm text-white font-bold opacity-70">Isto pode levar até 30 segundos.</p>
              </Card>
            ) : result ? (
              <MealAnalysisResult result={result} />
            ) : null}
            {!analyzing && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full border-white/40 text-white hover:bg-white/10 font-black h-12" 
                  onClick={handleReset}
                >
                  Nova Pesquisa
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Recipes;
