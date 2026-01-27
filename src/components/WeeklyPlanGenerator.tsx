import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Utensils, 
  Dumbbell, 
  Loader2, 
  Lock, 
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WeeklyPlanDisplay from "@/components/WeeklyPlanDisplay";

interface WeeklyPlanGeneratorProps {
  type: "meal" | "workout";
}

interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  activityLevel?: string;
}

export const WeeklyPlanGenerator = ({ type }: WeeklyPlanGeneratorProps) => {
  const [canGenerate, setCanGenerate] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [showPlan, setShowPlan] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check subscription
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      const plan = subscription?.plan || "free";
      setCurrentPlan(plan);
      
      // Can generate if essential, evolution or personal_trainer plan
      const canGen = plan === "essential" || plan === "evolution" || plan === "personal_trainer";
      setCanGenerate(canGen);

      // Check profile completion
      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo, Idade, peso, Altura, \"Nivel de Atividade\"")
        .eq("id", user.id)
        .single();

      const isComplete = profile && 
        profile.Objetivo && 
        profile.Idade && 
        profile.peso && 
        profile.Altura && 
        profile["Nivel de Atividade"];
      
      setIsProfileComplete(!!isComplete);
      
      // Store profile for PDF generation
      if (profile) {
        setUserProfile({
          name: profile["Nome Completo"] || undefined,
          age: profile.Idade || undefined,
          weight: profile.peso || undefined,
          height: profile.Altura || undefined,
          goal: profile.Objetivo || undefined,
          activityLevel: profile["Nivel de Atividade"] || undefined,
        });
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate || !isProfileComplete) return;

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Call the weekly plan generator edge function
      const { data, error } = await supabase.functions.invoke("generate-weekly-plan", {
        body: {
          userId: user.id,
          profile: {
            goal: profile.Objetivo,
            age: profile.Idade,
            weight: profile.peso,
            height: profile.Altura,
            activityLevel: profile["Nivel de Atividade"],
            name: profile["Nome Completo"],
          },
          planType: type, // "meal" or "workout"
        },
      });

      if (error) throw error;

      setGeneratedPlan(data);
      toast({
        title: "Plano Gerado! 🎉",
        description: `O seu plano semanal de ${type === "meal" ? "alimentação" : "treino"} foi criado com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Erro ao gerar plano",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const icon = type === "meal" ? Utensils : Dumbbell;
  const Icon = icon;
  const title = type === "meal" ? "Plano de Alimentação Semanal" : "Plano de Treino Semanal";
  const description = type === "meal" 
    ? "Gere um plano de refeições personalizado para a semana baseado no seu objetivo"
    : "Gere um plano de treino personalizado para a semana baseado no seu objetivo";

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          canGenerate && isProfileComplete
            ? "bg-gradient-to-br from-primary/20 to-secondary/20"
            : "bg-gray-100"
        }`}>
          <Icon className={`w-6 h-6 ${canGenerate && isProfileComplete ? "text-primary" : "text-gray-400"}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {title}
            {!canGenerate && <Lock className="w-4 h-4 text-muted-foreground" />}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {!isProfileComplete && (
        <Alert className="mb-4 border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Complete o teste de anamnese para poder gerar planos personalizados.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-amber-600"
              onClick={() => navigate("/anamnesis")}
            >
              Completar agora →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!canGenerate && isProfileComplete && (
        <Alert className="mb-4 border-primary/30 bg-primary/5">
          <Lock className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Esta funcionalidade requer um <strong>plano pago</strong>.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={() => navigate("/subscription")}
            >
              Ver planos →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Button
        variant={canGenerate && isProfileComplete ? "hero" : "outline"}
        className="w-full"
        disabled={!canGenerate || !isProfileComplete || isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            A gerar plano...
          </>
        ) : canGenerate && isProfileComplete ? (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Plano Semanal
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            {!isProfileComplete ? "Complete o Perfil" : "Upgrade Necessário"}
          </>
        )}
      </Button>

      {generatedPlan && (
        <div className="mt-6 pt-6 border-t">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setShowPlan(!showPlan)}
          >
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Plano Gerado
            </h4>
            <Button variant="ghost" size="sm">
              {showPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          
          {showPlan && (
            <WeeklyPlanDisplay 
              plan={generatedPlan.plan || generatedPlan}
              planType={type}
              profile={userProfile}
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default WeeklyPlanGenerator;