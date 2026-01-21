import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  ArrowRight, 
  Scale, 
  Ruler, 
  Calendar, 
  Target, 
  Activity,
  SkipForward,
  ClipboardList
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Anamnesis = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    weight: "",
    height: "",
    goal: "maintain" as "lose" | "maintain" | "gain",
    activityLevel: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Pre-fill with existing data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setFormData({
        fullName: profile["Nome Completo"] || "",
        age: profile.Idade?.toString() || "",
        weight: profile.peso?.toString() || "",
        height: profile.Altura?.toString() || "",
        goal: (profile.Objetivo as "lose" | "maintain" | "gain") || "maintain",
        activityLevel: profile["Nivel de Atividade"] || "",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Teste Ignorado",
      description: "Lembre-se: Sem o teste completo, não poderá gerar planos de alimentação e treino personalizados.",
      duration: 5000,
    });
    navigate("/");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          "Nome Completo": formData.fullName.trim(),
          "Idade": formData.age ? parseInt(formData.age) : null,
          "peso": formData.weight ? parseFloat(formData.weight) : null,
          "Altura": formData.height ? parseFloat(formData.height) : null,
          "Objetivo": formData.goal,
          "Nivel de Atividade": formData.activityLevel,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Teste Completo! 🎉",
        description: "Agora pode gerar planos personalizados de alimentação e treino!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length >= 2;
      case 2:
        return formData.age && formData.weight && formData.height;
      case 3:
        return formData.goal && formData.activityLevel;
      default:
        return false;
    }
  };

  const activityLevels = [
    { id: "sedentary", label: "Sedentário", description: "Pouco ou nenhum exercício" },
    { id: "light", label: "Ligeiro", description: "1-3 dias por semana" },
    { id: "moderate", label: "Moderado", description: "3-5 dias por semana" },
    { id: "active", label: "Activo", description: "6-7 dias por semana" },
    { id: "very_active", label: "Muito Activo", description: "Atleta ou trabalho físico intenso" },
  ];

  const goals = [
    { id: "lose", label: "Perder Peso", icon: "📉" },
    { id: "maintain", label: "Manter Peso", icon: "⚖️" },
    { id: "gain", label: "Ganhar Massa", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Teste de Anamnese
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete para receber planos personalizados
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Alert */}
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Estes dados serão usados para gerar planos de alimentação e treino personalizados.
            Sem estes dados, não poderá gerar planos.
          </AlertDescription>
        </Alert>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="O seu nome completo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Physical Data */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Idade
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="w-4 h-4" /> Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 70.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Altura (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="Ex: 175"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Objetivo
              </Label>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value as "lose" | "maintain" | "gain" })}
                className="grid grid-cols-3 gap-2"
              >
                {goals.map((goal) => (
                  <Label
                    key={goal.id}
                    htmlFor={goal.id}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.goal === goal.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={goal.id} id={goal.id} className="sr-only" />
                    <span className="text-2xl mb-1">{goal.icon}</span>
                    <span className="text-xs text-center">{goal.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Nível de Actividade
              </Label>
              <RadioGroup
                value={formData.activityLevel}
                onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                className="space-y-2"
              >
                {activityLevels.map((level) => (
                  <Label
                    key={level.id}
                    htmlFor={level.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.activityLevel === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={level.id} id={level.id} className="mr-3" />
                    <div>
                      <p className="font-medium text-sm">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              variant="hero"
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
              className="flex-1"
            >
              {loading ? "A guardar..." : "Concluir Teste"}
            </Button>
          )}
        </div>

        {/* Skip Button */}
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full mt-4 text-muted-foreground"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Ignorar por agora
        </Button>
      </Card>
    </div>
  );
};

export default Anamnesis;
