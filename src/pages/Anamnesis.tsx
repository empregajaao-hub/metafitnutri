import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  ClipboardList,
  Heart,
  Utensils,
  Moon,
  Cigarette,
  Wine,
  Pill
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    // Health conditions
    hasHypertension: false,
    hasDiabetes: false,
    hasHeartDisease: false,
    hasArthritis: false,
    hasAsthma: false,
    hasThyroidIssues: false,
    hasOtherConditions: false,
    otherConditionsText: "",
    // Dietary restrictions
    isVegetarian: false,
    isVegan: false,
    isLactoseIntolerant: false,
    isGlutenFree: false,
    hasNutAllergy: false,
    hasSeafoodAllergy: false,
    hasOtherDietRestrictions: false,
    otherDietRestrictionsText: "",
    // Lifestyle
    sleepHours: "",
    stressLevel: "",
    smokingStatus: "",
    alcoholConsumption: "",
    waterIntake: "",
    // Medications & supplements
    takesMedication: false,
    medicationDetails: "",
    takesSupplements: false,
    supplementDetails: "",
    // Goals
    targetWeight: "",
    timeframe: "",
    previousDiets: false,
    previousDietsDetails: "",
    exerciseExperience: "",
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
      setFormData(prev => ({
        ...prev,
        fullName: profile["Nome Completo"] || "",
        age: profile.Idade?.toString() || "",
        weight: profile.peso?.toString() || "",
        height: profile.Altura?.toString() || "",
        goal: (profile.Objetivo as "lose" | "maintain" | "gain") || "maintain",
        activityLevel: profile["Nivel de Atividade"] || "",
      }));
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

      // Build health conditions string
      const healthConditions = [];
      if (formData.hasHypertension) healthConditions.push("Hipertensão");
      if (formData.hasDiabetes) healthConditions.push("Diabetes");
      if (formData.hasHeartDisease) healthConditions.push("Doença Cardíaca");
      if (formData.hasArthritis) healthConditions.push("Artrite");
      if (formData.hasAsthma) healthConditions.push("Asma");
      if (formData.hasThyroidIssues) healthConditions.push("Problemas de Tiróide");
      if (formData.hasOtherConditions && formData.otherConditionsText) {
        healthConditions.push(formData.otherConditionsText);
      }

      // Build dietary restrictions string
      const dietRestrictions = [];
      if (formData.isVegetarian) dietRestrictions.push("Vegetariano");
      if (formData.isVegan) dietRestrictions.push("Vegano");
      if (formData.isLactoseIntolerant) dietRestrictions.push("Intolerância à Lactose");
      if (formData.isGlutenFree) dietRestrictions.push("Sem Glúten");
      if (formData.hasNutAllergy) dietRestrictions.push("Alergia a Frutos Secos");
      if (formData.hasSeafoodAllergy) dietRestrictions.push("Alergia a Marisco");
      if (formData.hasOtherDietRestrictions && formData.otherDietRestrictionsText) {
        dietRestrictions.push(formData.otherDietRestrictionsText);
      }

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
      case 4:
        return true; // Health conditions are optional
      case 5:
        return true; // Dietary restrictions are optional
      case 6:
        return formData.sleepHours && formData.stressLevel;
      default:
        return false;
    }
  };

  const totalSteps = 6;

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

  const sleepOptions = [
    { id: "less_5", label: "Menos de 5h" },
    { id: "5_6", label: "5-6 horas" },
    { id: "6_7", label: "6-7 horas" },
    { id: "7_8", label: "7-8 horas" },
    { id: "more_8", label: "Mais de 8h" },
  ];

  const stressOptions = [
    { id: "low", label: "Baixo", description: "Raramente me sinto stressado" },
    { id: "moderate", label: "Moderado", description: "Stress ocasional" },
    { id: "high", label: "Alto", description: "Frequentemente stressado" },
    { id: "very_high", label: "Muito Alto", description: "Stress constante" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Teste de Anamnese Completo
          </h1>
          <p className="text-muted-foreground text-sm">
            Passo {step} de {totalSteps} - Complete para receber planos personalizados
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
                <Scale className="w-4 h-4" /> Peso Actual (kg)
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

            <div className="space-y-2">
              <Label htmlFor="targetWeight" className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Peso Desejado (kg)
              </Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                placeholder="Ex: 65"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Goals & Activity */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Qual é o seu Objetivo?
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
                <Activity className="w-4 h-4" /> Nível de Actividade Física
              </Label>
              <div className="space-y-2">
                {activityLevels.map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.activityLevel === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={formData.activityLevel === level.id}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Health Conditions */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <Label className="text-lg font-semibold">Condições de Saúde</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione todas as condições aplicáveis (opcional)
            </p>
            
            <div className="space-y-3">
              {[
                { key: "hasHypertension", label: "Hipertensão (Pressão Alta)" },
                { key: "hasDiabetes", label: "Diabetes" },
                { key: "hasHeartDisease", label: "Doença Cardíaca" },
                { key: "hasArthritis", label: "Artrite ou Problemas Articulares" },
                { key: "hasAsthma", label: "Asma ou Problemas Respiratórios" },
                { key: "hasThyroidIssues", label: "Problemas de Tiróide" },
              ].map((condition) => (
                <div
                  key={condition.key}
                  onClick={() => setFormData({ ...formData, [condition.key]: !formData[condition.key as keyof typeof formData] })}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData[condition.key as keyof typeof formData]
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData[condition.key as keyof typeof formData] as boolean}
                    className="mr-3"
                  />
                  <span className="text-sm">{condition.label}</span>
                </div>
              ))}
              
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                formData.hasOtherConditions ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setFormData({ ...formData, hasOtherConditions: !formData.hasOtherConditions })}
                >
                  <Checkbox checked={formData.hasOtherConditions} className="mr-3" />
                  <span className="text-sm">Outras Condições</span>
                </div>
                {formData.hasOtherConditions && (
                  <Input
                    className="mt-2"
                    placeholder="Descreva outras condições..."
                    value={formData.otherConditionsText}
                    onChange={(e) => setFormData({ ...formData, otherConditionsText: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-blue-500" />
                <Label>Medicamentos e Suplementos</Label>
              </div>
              
              <div className={`p-3 rounded-lg border-2 mb-2 transition-colors ${
                formData.takesMedication ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setFormData({ ...formData, takesMedication: !formData.takesMedication })}
                >
                  <Checkbox checked={formData.takesMedication} className="mr-3" />
                  <span className="text-sm">Tomo medicamentos regularmente</span>
                </div>
                {formData.takesMedication && (
                  <Input
                    className="mt-2"
                    placeholder="Quais medicamentos?"
                    value={formData.medicationDetails}
                    onChange={(e) => setFormData({ ...formData, medicationDetails: e.target.value })}
                  />
                )}
              </div>

              <div className={`p-3 rounded-lg border-2 transition-colors ${
                formData.takesSupplements ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setFormData({ ...formData, takesSupplements: !formData.takesSupplements })}
                >
                  <Checkbox checked={formData.takesSupplements} className="mr-3" />
                  <span className="text-sm">Tomo suplementos</span>
                </div>
                {formData.takesSupplements && (
                  <Input
                    className="mt-2"
                    placeholder="Quais suplementos?"
                    value={formData.supplementDetails}
                    onChange={(e) => setFormData({ ...formData, supplementDetails: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Dietary Restrictions */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-green-500" />
              <Label className="text-lg font-semibold">Restrições Alimentares</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione todas as restrições aplicáveis (opcional)
            </p>
            
            <div className="space-y-3">
              {[
                { key: "isVegetarian", label: "Vegetariano (não como carne)" },
                { key: "isVegan", label: "Vegano (sem produtos animais)" },
                { key: "isLactoseIntolerant", label: "Intolerância à Lactose" },
                { key: "isGlutenFree", label: "Sem Glúten (Celíaco)" },
                { key: "hasNutAllergy", label: "Alergia a Frutos Secos" },
                { key: "hasSeafoodAllergy", label: "Alergia a Marisco/Peixe" },
              ].map((restriction) => (
                <div
                  key={restriction.key}
                  onClick={() => setFormData({ ...formData, [restriction.key]: !formData[restriction.key as keyof typeof formData] })}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData[restriction.key as keyof typeof formData]
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData[restriction.key as keyof typeof formData] as boolean}
                    className="mr-3"
                  />
                  <span className="text-sm">{restriction.label}</span>
                </div>
              ))}
              
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                formData.hasOtherDietRestrictions ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setFormData({ ...formData, hasOtherDietRestrictions: !formData.hasOtherDietRestrictions })}
                >
                  <Checkbox checked={formData.hasOtherDietRestrictions} className="mr-3" />
                  <span className="text-sm">Outras Restrições</span>
                </div>
                {formData.hasOtherDietRestrictions && (
                  <Input
                    className="mt-2"
                    placeholder="Descreva outras restrições..."
                    value={formData.otherDietRestrictionsText}
                    onChange={(e) => setFormData({ ...formData, otherDietRestrictionsText: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* Previous diets */}
            <div className="pt-4 border-t">
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                formData.previousDiets ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setFormData({ ...formData, previousDiets: !formData.previousDiets })}
                >
                  <Checkbox checked={formData.previousDiets} className="mr-3" />
                  <span className="text-sm">Já fiz dietas anteriormente</span>
                </div>
                {formData.previousDiets && (
                  <Input
                    className="mt-2"
                    placeholder="Quais dietas e resultados?"
                    value={formData.previousDietsDetails}
                    onChange={(e) => setFormData({ ...formData, previousDietsDetails: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Lifestyle */}
        {step === 6 && (
          <div className="space-y-6">
            {/* Sleep */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <Label>Quantas horas dorme por noite?</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sleepOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setFormData({ ...formData, sleepHours: option.id })}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.sleepHours === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={formData.sleepHours === option.id}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <Label>Nível de Stress</Label>
              <div className="space-y-2">
                {stressOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setFormData({ ...formData, stressLevel: option.id })}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.stressLevel === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={formData.stressLevel === option.id}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smoking & Alcohol */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cigarette className="w-4 h-4 text-gray-500" />
                  <Label className="text-sm">Tabaco</Label>
                </div>
                <select
                  value={formData.smokingStatus}
                  onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="never">Nunca fumei</option>
                  <option value="former">Ex-fumador</option>
                  <option value="occasional">Ocasional</option>
                  <option value="regular">Regular</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-purple-500" />
                  <Label className="text-sm">Álcool</Label>
                </div>
                <select
                  value={formData.alcoholConsumption}
                  onChange={(e) => setFormData({ ...formData, alcoholConsumption: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="never">Nunca bebo</option>
                  <option value="rarely">Raramente</option>
                  <option value="social">Social</option>
                  <option value="regular">Regularmente</option>
                </select>
              </div>
            </div>

            {/* Water Intake */}
            <div className="space-y-2">
              <Label>Quantos copos de água bebe por dia?</Label>
              <select
                value={formData.waterIntake}
                onChange={(e) => setFormData({ ...formData, waterIntake: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Seleccionar...</option>
                <option value="1-2">1-2 copos</option>
                <option value="3-4">3-4 copos</option>
                <option value="5-6">5-6 copos</option>
                <option value="7-8">7-8 copos</option>
                <option value="8+">Mais de 8 copos</option>
              </select>
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
          
          {step < totalSteps ? (
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