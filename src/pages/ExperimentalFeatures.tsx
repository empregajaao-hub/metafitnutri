import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Camera, Upload as UploadIcon, Ruler, Activity, 
  ArrowLeft, Sparkles, Info, ShieldCheck, 
  ChevronRight, Zap, CheckCircle2, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MobileBottomNav from "@/components/MobileBottomNav";
import imageCompression from 'browser-image-compression';

const ExperimentalFeatures = () => {
  const [activeTool, setActiveTool] = useState<"height" | "bodyfat" | null>(null);
  const [step, setStep] = useState<"intro" | "upload" | "analyzing" | "result">("intro");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [referenceObject, setReferenceObject] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (e.target) e.target.value = "";
    
    const needed = activeTool === "height" ? 1 : 3;
    if (files.length + selectedImages.length > needed) {
      toast({ 
        title: "Limite de fotos", 
        description: `Precisas de apenas ${needed} foto(s) para esta ferramenta.`,
        variant: "destructive" 
      });
      return;
    }

    try {
      toast({ title: "Processando...", description: "Otimizando imagens." });
      
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg' as const
      };

      const newImages: string[] = [];
      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(compressedFile);
        });
        newImages.push(base64);
      }

      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
      
      if (updatedImages.length === needed) {
        setStep("analyzing");
        if (activeTool === "height") {
          await estimateHeight(updatedImages[0]);
        } else {
          await analyzeBodyFat(updatedImages);
        }
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao processar imagens.", variant: "destructive" });
    }
  };

  const estimateHeight = async (image: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('estimate-height', {
        body: { imageBase64: image, referenceObject }
      });
      if (error) throw error;
      setResult(data);
      setStep("result");
    } catch (error: any) {
      toast({ title: "Erro na análise", description: error.message, variant: "destructive" });
      setStep("upload");
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeBodyFat = async (images: string[]) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-body-fat', {
        body: { imagesBase64: images }
      });
      if (error) throw error;
      setResult(data);
      setStep("result");
    } catch (error: any) {
      toast({ title: "Erro na análise", description: error.message, variant: "destructive" });
      setStep("upload");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setActiveTool(null);
    setStep("intro");
    setSelectedImages([]);
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={activeTool ? reset : () => navigate("/profile")}
            className="rounded-full bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Laboratório IA</span>
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {!activeTool && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-black tracking-tight">Ferramentas Experimentais</h1>
                <p className="text-muted-foreground">Testa as nossas novas tecnologias em fase beta.</p>
              </div>

              <Card 
                className="p-6 cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => { setActiveTool("height"); setStep("intro"); }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Estimador de Altura</h3>
                    <p className="text-sm text-muted-foreground">Descobre a tua altura aproximada através de uma foto.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:border-secondary/50 transition-colors group"
                onClick={() => { setActiveTool("bodyfat"); setStep("intro"); }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Scanner de Gordura Corporal</h3>
                    <p className="text-sm text-muted-foreground">Análise visual do teu percentual de gordura (3 fotos).</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
                </div>
              </Card>

              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mt-8" />
              <p className="text-xs text-center text-muted-foreground px-4">
                Nota: Estas ferramentas são experimentais e podem ter margens de erro. Não substituem medições profissionais.
              </p>
            </motion.div>
          )}

          {activeTool === "height" && step === "intro" && (
            <motion.div key="height-intro" className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Guia de Uso: Altura
                </h2>
                <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Fica em pé junto a uma parede ou porta (objetos de referência ajudam na precisão).</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>A foto deve ser de **corpo inteiro**, da cabeça aos pés.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Pede a alguém para tirar a foto ao nível da tua cintura para evitar distorção.</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => setStep("upload")} className="w-full h-14 rounded-2xl text-lg font-bold">Entendido, vamos lá</Button>
            </motion.div>
          )}

          {activeTool === "bodyfat" && step === "intro" && (
            <motion.div key="bodyfat-intro" className="space-y-6">
              <div className="bg-secondary/5 p-6 rounded-[2rem] border border-secondary/10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-secondary" /> Guia de Uso: Gordura Corporal
                </h2>
                <p className="text-sm font-medium mb-4">Precisas de enviar **3 fotos** para uma análise completa:</p>
                <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-secondary shrink-0" />
                    <span>**Foto 1 (Frente):** Relaxado, braços ligeiramente afastados.</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-secondary shrink-0" />
                    <span>**Foto 2 (Lado):** Perfil lateral direito ou esquerdo.</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-5 h-5 text-secondary shrink-0" />
                    <span>**Foto 3 (Costas):** Vista posterior completa.</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => setStep("upload")} className="w-full h-14 rounded-2xl text-lg font-bold bg-secondary hover:bg-secondary/90">Estou pronto</Button>
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div key="upload-step" className="space-y-6">
              <div 
                className="aspect-[3/4] border-2 border-dashed border-muted-foreground/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Enviar Foto(s)</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTool === "height" ? "Seleciona 1 foto de corpo inteiro" : `Seleciona as 3 fotos (${selectedImages.length}/3 enviadas)`}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  multiple={activeTool === "bodyfat"} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-muted">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div key="analyzing-step" className="text-center py-20 space-y-6">
              <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black">A nossa IA está a analisar...</h2>
                <p className="text-muted-foreground">Isto pode demorar alguns segundos.</p>
              </div>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result-step" className="space-y-6">
              <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-background rounded-[2.5rem]">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
                    <ShieldCheck className="w-3 h-3" /> Resultado Experimental
                  </div>
                  <h2 className="text-4xl font-black">
                    {activeTool === "height" 
                      ? `${result.estimated_height_cm} cm` 
                      : `${result.body_fat_percentage}%`
                    }
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Confiança: {Math.round(result.confidence_score * 100)}%
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-2xl">
                    <p className="text-sm leading-relaxed">
                      {activeTool === "height" ? result.analysis_notes : result.body_composition_analysis}
                    </p>
                  </div>

                  {activeTool === "bodyfat" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                        <p className="text-[10px] font-black uppercase text-green-600 mb-1">Pontos Fortes</p>
                        <ul className="text-xs space-y-1">
                          {result.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[10px] font-black uppercase text-blue-600 mb-1">A Melhorar</p>
                        <ul className="text-xs space-y-1">
                          {result.improvement_areas?.map((a: string, i: number) => <li key={i}>• {a}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/10">
                <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Dicas para maior precisão:
                </h4>
                <ul className="text-sm text-amber-800/80 space-y-2">
                  {result.tips_for_accuracy?.map((tip: string, i: number) => <li key={i}>- {tip}</li>)}
                </ul>
              </div>

              <Button onClick={reset} className="w-full h-14 rounded-2xl font-bold">Voltar ao Laboratório</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ExperimentalFeatures;
