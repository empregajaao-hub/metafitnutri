import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import genderMale from "@/assets/gender-male.png";
import genderFemale from "@/assets/gender-female.png";
import onboardingFitness1 from "@/assets/onboarding-fitness-1.png";
import onboardingFitness2 from "@/assets/onboarding-fitness-2.png";
import onboardingNutrition from "@/assets/onboarding-nutrition.png";
import onboardingStrength from "@/assets/onboarding-strength.png";

type Gender = "feminino" | "masculino" | null;
type Goal = "lose" | "maintain" | "gain" | null;

const TOTAL_STEPS = 11;

// Illustration map per step
const stepIllustrations: Record<number, string> = {
  2: onboardingFitness1,
  3: onboardingStrength,
  4: onboardingFitness2,
  5: onboardingNutrition,
  6: onboardingFitness1,
  7: onboardingStrength,
  8: onboardingNutrition,
  9: onboardingFitness2,
};

const Anamnesis = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gender, setGender] = useState<Gender>(null);
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState<Goal>(null);
  const [activityLevel, setActivityLevel] = useState("");
  const [targetWeight, setTargetWeight] = useState(65);

  // Health
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState("");

  // Diet
  const [dietRestrictions, setDietRestrictions] = useState<string[]>([]);
  const [otherDiet, setOtherDiet] = useState("");

  // Lifestyle
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("");

  // Referral
  const [referralSource, setReferralSource] = useState("");
  const [referralDetail, setReferralDetail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile) {
      if (profile.Idade) setAge(profile.Idade);
      if (profile.peso) setWeight(profile.peso);
      if (profile.Altura) setHeight(profile.Altura);
      if (profile.Objetivo) setGoal(profile.Objetivo as Goal);
      if (profile["Nivel de Atividade"]) setActivityLevel(profile["Nivel de Atividade"]);
    }
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleHealth = (condition: string) => {
    setHealthConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const toggleDiet = (restriction: string) => {
    setDietRestrictions(prev =>
      prev.includes(restriction) ? prev.filter(r => r !== restriction) : [...prev, restriction]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("profiles").update({
        Idade: age,
        peso: weight,
        Altura: height,
        Objetivo: goal || "maintain",
        "Nivel de Atividade": activityLevel || "moderate",
        gender: gender || null,
      }).eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil completo! 🎉",
        description: "Agora pode usar todas as funcionalidades do METAFIT NUTRI.",
      });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!gender;
      case 2: return age >= 12 && age <= 80;
      case 3: return weight >= 30 && weight <= 250;
      case 4: return height >= 100 && height <= 230;
      case 5: return !!goal;
      case 6: return !!activityLevel;
      case 7: return true;
      case 8: return true;
      case 9: return !!sleepHours && !!stressLevel;
      case 10: return !!referralSource;
      case 11: return true;
      default: return false;
    }
  };

  const calculateCalories = () => {
    const bmr = gender === "feminino"
      ? 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age)
      : 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    const multipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
    };
    const tdee = bmr * (multipliers[activityLevel] || 1.55);
    if (goal === "lose") return Math.round(tdee - 500);
    if (goal === "gain") return Math.round(tdee + 300);
    return Math.round(tdee);
  };

  const calories = calculateCalories();
  const protein = Math.round(weight * (goal === "gain" ? 2.0 : 1.6));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  const weightDiff = Math.abs(weight - targetWeight);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  // Floating illustration for steps that have one
  const currentIllustration = stepIllustrations[step];

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header with back + progress */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 shrink-0">
        {step > 1 ? (
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
        <div className="flex-1 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i < step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col px-5 overflow-hidden relative">
        {/* Floating illustration */}
        {currentIllustration && (
          <motion.div
            key={`illust-${step}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 0.12, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none z-0"
          >
            <img src={currentIllustration} alt="" className="w-full h-full object-contain" />
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* Step 1: Gender */}
            {step === 1 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-foreground">Escolha o seu Género</h1>
                  <p className="text-muted-foreground text-sm">Isto será usado para calibrar o seu plano personalizado.</p>
                </div>
                <div className="flex gap-4 justify-center">
                  {([
                    { id: "masculino" as Gender, label: "Masculino", img: genderMale },
                    { id: "feminino" as Gender, label: "Feminino", img: genderFemale },
                  ]).map((g) => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender(g.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all w-40 ${
                        gender === g.id
                          ? "bg-primary/10 border-2 border-primary shadow-glow"
                          : "bg-card border-2 border-border"
                      }`}
                    >
                      <motion.img
                        src={g.img}
                        alt={g.label}
                        className="w-28 h-28 object-contain"
                        animate={gender === g.id ? { y: [0, -5, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                      <span className={`font-bold text-sm ${gender === g.id ? "text-primary" : "text-foreground"}`}>
                        {g.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 2: Age */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é a sua idade?</h1>
                  <p className="text-muted-foreground text-sm">A sua idade ajuda a calcular o seu metabolismo.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    key={age}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/5 border-2 border-primary/40 flex items-center justify-center"
                  >
                    <span className="text-5xl font-bold text-primary">{age}</span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider
                      value={[age]}
                      onValueChange={(v) => setAge(v[0])}
                      min={12}
                      max={80}
                      step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>12</span>
                      <span>80</span>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 3: Weight */}
            {step === 3 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é o seu peso?</h1>
                  <p className="text-muted-foreground text-sm">O peso actual para calcular as suas necessidades.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    key={weight}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/5 border-2 border-primary/40 flex items-center justify-center"
                  >
                    <span className="text-4xl font-bold text-primary">{weight}<span className="text-lg text-muted-foreground ml-1">kg</span></span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider
                      value={[weight]}
                      onValueChange={(v) => setWeight(v[0])}
                      min={30}
                      max={200}
                      step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>30 kg</span>
                      <span>200 kg</span>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 4: Height */}
            {step === 4 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é a sua altura?</h1>
                  <p className="text-muted-foreground text-sm">A altura é essencial para o cálculo do IMC.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    key={height}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/5 border-2 border-primary/40 flex items-center justify-center"
                  >
                    <span className="text-4xl font-bold text-primary">{height}<span className="text-lg text-muted-foreground ml-1">cm</span></span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider
                      value={[height]}
                      onValueChange={(v) => setHeight(v[0])}
                      min={100}
                      max={230}
                      step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>100 cm</span>
                      <span>230 cm</span>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 5: Goal */}
            {step === 5 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é o seu objectivo?</h1>
                  <p className="text-muted-foreground text-sm">Vamos adaptar o plano ao seu objectivo.</p>
                </div>
                <div className="space-y-3">
                  {([
                    { id: "lose" as Goal, label: "Perder Peso", desc: "Reduzir gordura de forma saudável", emoji: "📉" },
                    { id: "maintain" as Goal, label: "Manter Peso", desc: "Equilíbrio e manutenção", emoji: "⚖️" },
                    { id: "gain" as Goal, label: "Ganhar Massa", desc: "Aumentar massa muscular", emoji: "💪" },
                  ]).map((g) => (
                    <motion.button
                      key={g.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setGoal(g.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                        goal === g.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border-2 border-border"
                      }`}
                    >
                      <span className="text-2xl">{g.emoji}</span>
                      <div>
                        <p className="font-semibold">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{g.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 6: Activity Level */}
            {step === 6 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Nível de Actividade</h1>
                  <p className="text-muted-foreground text-sm">Quantas vezes treina por semana?</p>
                </div>
                <div className="space-y-2">
                  {([
                    { id: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
                    { id: "light", label: "Ligeiro", desc: "1-3 dias/semana" },
                    { id: "moderate", label: "Moderado", desc: "3-5 dias/semana" },
                    { id: "active", label: "Activo", desc: "6-7 dias/semana" },
                    { id: "very_active", label: "Muito Activo", desc: "Atleta ou trabalho físico" },
                  ]).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setActivityLevel(a.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                        activityLevel === a.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border-2 border-border"
                      }`}
                    >
                      <Checkbox
                        checked={activityLevel === a.id}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div>
                        <p className="font-semibold text-sm">{a.label}</p>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 7: Health Conditions */}
            {step === 7 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Condições de Saúde</h1>
                  <p className="text-muted-foreground text-sm">Seleccione as que se aplicam (opcional)</p>
                </div>
                <div className="space-y-2">
                  {([
                    "Hipertensão", "Diabetes", "Doença Cardíaca",
                    "Artrite", "Asma", "Problemas de Tiróide",
                  ]).map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleHealth(c)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                        healthConditions.includes(c)
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border-2 border-border"
                      }`}
                    >
                      <Checkbox
                        checked={healthConditions.includes(c)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-sm">{c}</span>
                    </button>
                  ))}
                  <div className="pt-2">
                    <Input
                      placeholder="Outras condições..."
                      value={otherCondition}
                      onChange={(e) => setOtherCondition(e.target.value)}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 8: Diet Restrictions */}
            {step === 8 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Restrições Alimentares</h1>
                  <p className="text-muted-foreground text-sm">Seleccione as que se aplicam (opcional)</p>
                </div>
                <div className="space-y-2">
                  {([
                    "Vegetariano", "Vegano", "Intolerância à Lactose",
                    "Sem Glúten", "Alergia a Frutos Secos", "Alergia a Marisco",
                  ]).map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleDiet(r)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                        dietRestrictions.includes(r)
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border-2 border-border"
                      }`}
                    >
                      <Checkbox
                        checked={dietRestrictions.includes(r)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-sm">{r}</span>
                    </button>
                  ))}
                  <Input
                    placeholder="Outras restrições..."
                    value={otherDiet}
                    onChange={(e) => setOtherDiet(e.target.value)}
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground mt-2"
                  />
                </div>
                <div />
              </div>
            )}

            {/* Step 9: Lifestyle */}
            {step === 9 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Estilo de Vida</h1>
                  <p className="text-muted-foreground text-sm">Dados para optimizar o seu plano.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold mb-2">Horas de sono por noite</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Menos de 5h", "5-7 horas", "7-8 horas", "Mais de 8h"]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSleepHours(s)}
                          className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                            sleepHours === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-muted-foreground border border-border"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Nível de stress</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Baixo", "Moderado", "Alto", "Muito Alto"]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStressLevel(s)}
                          className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                            stressLevel === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-muted-foreground border border-border"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 10: Como ouviu falar de nós */}
            {step === 10 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Como ouviu falar de nós?</h1>
                  <p className="text-muted-foreground text-sm">Ajude-nos a melhorar a nossa comunicação.</p>
                </div>
                <div className="space-y-2">
                  {([
                    { id: "tv", label: "📺 TV", needsDetail: false },
                    { id: "redes_sociais", label: "📱 Redes Sociais", needsDetail: false },
                    { id: "ginasio", label: "🏋️ Ginásio", needsDetail: true },
                    { id: "outro", label: "🔗 Outro", needsDetail: true },
                  ]).map((r) => (
                    <div key={r.id}>
                      <button
                        onClick={() => {
                          setReferralSource(r.id);
                          if (!r.needsDetail) setReferralDetail("");
                        }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                          referralSource === r.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-card border-2 border-border"
                        }`}
                      >
                        <Checkbox
                          checked={referralSource === r.id}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm font-medium">{r.label}</span>
                      </button>
                      {r.needsDetail && referralSource === r.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 ml-2"
                        >
                          <Input
                            placeholder={r.id === "ginasio" ? "Qual ginásio?" : "Especifique..."}
                            value={referralDetail}
                            onChange={(e) => setReferralDetail(e.target.value)}
                            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                          />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 11: Summary / Results */}
            {step === 11 && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-1">
                    {goal === "lose" ? "Perder" : goal === "gain" ? "Ganhar" : "Manter"}{" "}
                    <span className="text-primary">{weightDiff} kg</span>
                  </h1>
                  <p className="text-muted-foreground text-sm">é uma meta realista. Não é difícil!</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { label: "Calorias", value: `${calories}`, highlight: true, delay: 0.1 },
                    { label: "Proteína", value: `${protein}g`, highlight: false, delay: 0.2 },
                    { label: "Carboidratos", value: `${carbs}g`, highlight: false, delay: 0.3 },
                    { label: "Gorduras", value: `${fat}g`, highlight: false, delay: 0.4 },
                  ]).map((item) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: item.delay }}
                      className={`p-4 rounded-2xl text-center ${
                        item.highlight
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-card border border-border"
                      }`}
                    >
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`text-3xl font-bold ${item.highlight ? "text-primary" : "text-foreground"}`}>{item.value}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-muted-foreground text-xs"
                >
                  90% dos utilizadores dizem que a mudança é óbvia após usar o METAFIT NUTRI
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="px-5 pb-6 pt-2 shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={step === TOTAL_STEPS ? handleSubmit : goNext}
          disabled={!isStepValid() || loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isStepValid() && !loading
              ? "bg-primary text-primary-foreground active:scale-[0.98] shadow-glow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {loading ? "A guardar..." : step === TOTAL_STEPS ? "Começar Agora" : "Continuar"}
          {!loading && step < TOTAL_STEPS && <ChevronRight className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default Anamnesis;
