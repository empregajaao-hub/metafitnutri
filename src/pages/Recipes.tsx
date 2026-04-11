import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload as UploadIcon, ChefHat, ArrowLeft, Sparkles, Search, Utensils, Info } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={step === "initial" ? () => navigate("/") : handleReset} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Gerador de Receitas</h1>
        </div>

        {step === "initial" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="p-6 border-dashed border-2 border-primary/20 bg-primary/5">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ChefHat className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">O que tens na cozinha?</h2>
                  <p className="text-sm text-muted-foreground">Tira uma foto ou descreve os ingredientes para gerarmos receitas angolanas saudáveis.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleCameraButtonClick} className="gap-2">
                    <Camera className="w-4 h-4" /> Foto
                  </Button>
                  <Button variant="outline" onClick={handleGalleryButtonClick} className="gap-2">
                    <UploadIcon className="w-4 h-4" /> Galeria
                  </Button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageCapture} />
              </div>
            </Card>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary" /> Ou descreve aqui:
              </label>
              <Textarea 
                placeholder="Ex: Mandioca, peixe seco, óleo de palma, cebola..." 
                className="min-h-[120px] bg-muted/30"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
              />
              <Button className="w-full gap-2" onClick={handleGenerateFromText} disabled={!ingredientsText.trim()}>
                <Sparkles className="w-4 h-4" /> Gerar Receitas
              </Button>
            </div>

            <Card className="p-4 bg-blue-500/5 border-blue-500/20 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-muted-foreground">
                As receitas serão adaptadas ao teu objetivo de <strong>{userGoal === 'lose' ? 'Perder Peso' : userGoal === 'gain' ? 'Ganhar Massa' : 'Manter Peso'}</strong> e incluem análise de ingredientes crus.
              </p>
            </Card>
          </motion.div>
        )}

        {step === "goal" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Tudo pronto!</h2>
              <p className="text-sm text-muted-foreground">
                Vou analisar os teus ingredientes e sugerir as melhores receitas angolanas para o teu objetivo.
              </p>
              {selectedImage && (
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Button className="w-full h-12 text-lg font-bold" onClick={handleStartAnalysis}>
                Começar Análise
              </Button>
              <Button variant="ghost" onClick={handleReset}>Voltar</Button>
            </Card>
          </motion.div>
        )}

        {step === "result" && (
          <div className="space-y-6">
            {analyzing ? (
              <Card className="p-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-lg font-medium animate-pulse">A criar as tuas receitas...</p>
                <p className="text-sm text-muted-foreground">Isto pode levar até 30 segundos.</p>
              </Card>
            ) : result ? (
              <MealAnalysisResult result={result} />
            ) : null}
            {!analyzing && (
              <Button variant="outline" className="w-full" onClick={handleReset}>Nova Pesquisa</Button>
            )}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Recipes;
