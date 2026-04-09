import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ChevronRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import genderMale from "@/assets/gender-male.png";
import genderFemale from "@/assets/gender-female.png";
import video1Asset from "@/assets/onboarding-video-1.mp4.asset.json";
import video2Asset from "@/assets/onboarding-video-2.mp4.asset.json";
import video3Asset from "@/assets/onboarding-video-3.mp4.asset.json";

type Gender = "feminino" | "masculino" | null;
type Goal = "lose" | "maintain" | "gain" | null;

const TOTAL_STEPS = 12;

const videoUrls = [video1Asset.url, video2Asset.url, video3Asset.url];

// Map steps to video index
const stepVideoMap: Record<number, number> = {
  2: 0, 3: 1, 4: 0, 5: 2, 6: 1, 7: 0, 8: 2, 9: 1, 10: 0, 11: 2,
};

const Anamnesis = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load saved onboarding progress
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem("metafit_onboarding_progress");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };
  const savedData = loadSaved();

  const [gender, setGender] = useState<Gender>(savedData?.gender || null);
  const [age, setAge] = useState(savedData?.age || 25);
  const [weight, setWeight] = useState(savedData?.weight || 70);
  const [height, setHeight] = useState(savedData?.height || 170);
  const [goal, setGoal] = useState<Goal>(savedData?.goal || null);
  const [targetWeight, setTargetWeight] = useState(savedData?.targetWeight || 65);
  const [activityLevel, setActivityLevel] = useState(savedData?.activityLevel || "");

  const [healthConditions, setHealthConditions] = useState<string[]>(savedData?.healthConditions || []);
  const [otherCondition, setOtherCondition] = useState(savedData?.otherCondition || "");
  const [dietRestrictions, setDietRestrictions] = useState<string[]>(savedData?.dietRestrictions || []);
  const [otherDiet, setOtherDiet] = useState(savedData?.otherDiet || "");
  const [sleepHours, setSleepHours] = useState(savedData?.sleepHours || "");
  const [stressLevel, setStressLevel] = useState(savedData?.stressLevel || "");
  const [referralSource, setReferralSource] = useState(savedData?.referralSource || "");
  const [referralDetail, setReferralDetail] = useState(savedData?.referralDetail || "");

  // Auto-save progress on every change
  useEffect(() => {
    const data = { gender, age, weight, height, goal, targetWeight, activityLevel, healthConditions, otherCondition, dietRestrictions, otherDiet, sleepHours, stressLevel, referralSource, referralDetail, step };
    localStorage.setItem("metafit_onboarding_progress", JSON.stringify(data));
  }, [gender, age, weight, height, goal, targetWeight, activityLevel, healthConditions, otherCondition, dietRestrictions, otherDiet, sleepHours, stressLevel, referralSource, referralDetail, step]);
  

  useEffect(() => {
    checkAuth();
  }, []);

  // Update targetWeight when goal/weight changes
  useEffect(() => {
    if (goal === "lose") setTargetWeight(Math.max(40, weight - 5));
    else if (goal === "gain") setTargetWeight(weight + 5);
    else setTargetWeight(weight);
  }, [goal]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profile) {
      if (profile.Idade) setAge(profile.Idade);
      if (profile.peso) setWeight(profile.peso);
      if (profile.Altura) setHeight(profile.Altura);
      if (profile.Objetivo) setGoal(profile.Objetivo as Goal);
      if (profile["Nivel de Atividade"]) setActivityLevel(profile["Nivel de Atividade"]);
    }
  };

  const goNext = () => { if (step < TOTAL_STEPS) { setDirection(1); setStep(step + 1); } };
  const goBack = () => { if (step > 1) { setDirection(-1); setStep(step - 1); } };

  const toggleHealth = (c: string) => setHealthConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleDiet = (r: string) => setDietRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("profiles").update({
        Idade: age, peso: weight, Altura: height,
        Objetivo: goal || "maintain",
        "Nivel de Atividade": activityLevel || "moderate",
        gender: gender || null,
      }).eq("id", user.id);
      if (error) throw error;
      toast({ title: "Perfil completo! 🎉", description: "O seu plano personalizado está pronto." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!gender;
      case 2: return age >= 12 && age <= 80;
      case 3: return weight >= 30 && weight <= 250;
      case 4: return height >= 100 && height <= 230;
      case 5: return !!goal;
      case 6: return goal === "maintain" || (targetWeight >= 30 && targetWeight <= 200 && targetWeight !== weight);
      case 7: return !!activityLevel;
      case 8: return true;
      case 9: return true;
      case 10: return !!sleepHours && !!stressLevel;
      case 11: return !!referralSource;
      case 12: return true;
      default: return false;
    }
  };

  const kgDiff = Math.abs(weight - targetWeight);
  // Weeks estimate: ~0.5kg/week for loss, ~0.3kg/week for gain
  const weeksEstimate = goal === "lose" ? Math.ceil(kgDiff / 0.5) : goal === "gain" ? Math.ceil(kgDiff / 0.3) : 0;

  const calculateCalories = () => {
    const bmr = gender === "feminino"
      ? 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age)
      : 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    const multipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
    };
    const tdee = bmr * (multipliers[activityLevel] || 1.55);
    
    // Adjust deficit/surplus based on kg target
    if (goal === "lose") {
      // More aggressive deficit for more kg, capped at 25%
      const deficitPct = Math.min(0.25, 0.15 + (kgDiff * 0.01));
      return Math.round(tdee * (1 - deficitPct));
    }
    if (goal === "gain") {
      const surplusPct = Math.min(0.20, 0.10 + (kgDiff * 0.01));
      return Math.round(tdee * (1 + surplusPct));
    }
    return Math.round(tdee);
  };

  const calories = calculateCalories();
  const protein = Math.round(weight * (goal === "gain" ? 2.0 : 1.6));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const currentVideoIdx = stepVideoMap[step];
  const currentVideoUrl = currentVideoIdx !== undefined ? videoUrls[currentVideoIdx] : null;

  // Reusable tap-to-select option (no checkbox)
  const SelectOption = ({ selected, label, desc, onClick, emoji }: { selected: boolean; label: string; desc?: string; onClick: () => void; emoji?: string }) => (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
        selected ? "bg-primary/15 border-2 border-primary" : "bg-white/10 border-2 border-white/20"
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
        selected ? "bg-primary" : "border-2 border-white/40"
      }`}>
        {selected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      {emoji && <span className="text-xl">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-white">{label}</p>
        {desc && <p className="text-xs text-white/60">{desc}</p>}
      </div>
    </motion.button>
  );

  // Multi-select option
  const MultiOption = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        selected ? "bg-primary/15 border-2 border-primary" : "bg-white/10 border-2 border-white/20"
      }`}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
        selected ? "bg-primary" : "border-2 border-white/40"
      }`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-white">{label}</span>
    </motion.button>
  );

  return (
    <div className="h-[100dvh] bg-[#0a1628] text-white flex flex-col overflow-hidden relative">
      {/* Video Background */}
      {currentVideoUrl && (
        <motion.div
          key={currentVideoUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <video
            ref={videoRef}
            src={currentVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/70 to-transparent" />
        </motion.div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 shrink-0 relative z-10">
        {step > 1 ? (
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        ) : <div className="w-9 h-9" />}
        <div className="flex-1 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 overflow-hidden relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Step 1: Gender */}
            {step === 1 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Escolha o seu Género</h1>
                  <p className="text-white/60 text-sm">Para calibrar o seu plano personalizado.</p>
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
                        gender === g.id ? "bg-primary/20 border-2 border-primary shadow-glow" : "bg-white/5 border-2 border-white/20"
                      }`}
                    >
                      <motion.img
                        src={g.img} alt={g.label}
                        className="w-28 h-28 object-contain"
                        animate={gender === g.id ? { y: [0, -5, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                      <span className={`font-bold text-sm ${gender === g.id ? "text-primary" : "text-white"}`}>{g.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 2: Age */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é a sua idade?</h1>
                  <p className="text-white/60 text-sm">Para calcular o seu metabolismo.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div key={age} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                    <span className="text-5xl font-bold text-primary">{age}</span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider value={[age]} onValueChange={(v) => setAge(v[0])} min={12} max={80} step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
                    <div className="flex justify-between mt-2 text-xs text-white/40"><span>12</span><span>80</span></div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 3: Weight */}
            {step === 3 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é o seu peso actual?</h1>
                  <p className="text-white/60 text-sm">Para calcular as suas necessidades.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div key={weight} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{weight}<span className="text-lg text-white/50 ml-1">kg</span></span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider value={[weight]} onValueChange={(v) => setWeight(v[0])} min={30} max={200} step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
                    <div className="flex justify-between mt-2 text-xs text-white/40"><span>30 kg</span><span>200 kg</span></div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 4: Height */}
            {step === 4 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é a sua altura?</h1>
                  <p className="text-white/60 text-sm">Essencial para o cálculo do IMC.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <motion.div key={height} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{height}<span className="text-lg text-white/50 ml-1">cm</span></span>
                  </motion.div>
                  <div className="w-full px-2">
                    <Slider value={[height]} onValueChange={(v) => setHeight(v[0])} min={100} max={230} step={1}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
                    <div className="flex justify-between mt-2 text-xs text-white/40"><span>100 cm</span><span>230 cm</span></div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 5: Goal */}
            {step === 5 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Qual é o seu objectivo?</h1>
                  <p className="text-white/60 text-sm">Vamos adaptar tudo ao seu objectivo.</p>
                </div>
                <div className="space-y-3">
                  {([
                    { id: "lose" as Goal, label: "Perder Peso", desc: "Reduzir gordura de forma saudável", emoji: "📉" },
                    { id: "maintain" as Goal, label: "Manter Peso", desc: "Equilíbrio e manutenção", emoji: "⚖️" },
                    { id: "gain" as Goal, label: "Ganhar Massa", desc: "Aumentar massa muscular", emoji: "💪" },
                  ]).map((g) => (
                    <SelectOption key={g.id} selected={goal === g.id} label={g.label} desc={g.desc} emoji={g.emoji} onClick={() => setGoal(g.id)} />
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 6: Target Weight (NEW) */}
            {step === 6 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {goal === "lose" ? "Quantos kg quer perder?" : goal === "gain" ? "Quantos kg quer ganhar?" : "Peso ideal"}
                  </h1>
                  <p className="text-white/60 text-sm">
                    {goal === "maintain" ? "O seu objectivo é manter o peso actual." : "Defina o seu peso alvo para ajustarmos tudo."}
                  </p>
                </div>
                {goal !== "maintain" ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-white/40 mb-1">Actual</p>
                        <p className="text-2xl font-bold text-white/70">{weight} kg</p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-primary text-2xl"
                      >→</motion.div>
                      <div className="text-center">
                        <p className="text-xs text-primary mb-1">Meta</p>
                        <motion.p key={targetWeight} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                          className="text-4xl font-bold text-primary">{targetWeight} kg</motion.p>
                      </div>
                    </div>
                    <div className="w-full px-2">
                      <Slider
                        value={[targetWeight]}
                        onValueChange={(v) => setTargetWeight(v[0])}
                        min={goal === "lose" ? Math.max(40, weight - 50) : weight + 1}
                        max={goal === "lose" ? weight - 1 : Math.min(200, weight + 30)}
                        step={1}
                        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/10 border border-primary/30 rounded-xl p-3 w-full text-center"
                    >
                      <p className="text-sm text-white/80">
                        {goal === "lose" ? "📉" : "💪"} {kgDiff} kg em ~<span className="font-bold text-primary">{weeksEstimate} semanas</span>
                      </p>
                      <p className="text-xs text-white/50 mt-1">Meta realista e saudável</p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center"
                    >
                      <span className="text-4xl">⚖️</span>
                    </motion.div>
                    <p className="text-white/60 text-sm text-center">Vamos focar no equilíbrio nutricional perfeito para si.</p>
                  </div>
                )}
                <div />
              </div>
            )}

            {/* Step 7: Activity Level */}
            {step === 7 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Nível de Actividade</h1>
                  <p className="text-white/60 text-sm">Quantas vezes treina por semana?</p>
                </div>
                <div className="space-y-2">
                  {([
                    { id: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
                    { id: "light", label: "Ligeiro", desc: "1-3 dias/semana" },
                    { id: "moderate", label: "Moderado", desc: "3-5 dias/semana" },
                    { id: "active", label: "Activo", desc: "6-7 dias/semana" },
                    { id: "very_active", label: "Muito Activo", desc: "Atleta ou trabalho físico" },
                  ]).map((a) => (
                    <SelectOption key={a.id} selected={activityLevel === a.id} label={a.label} desc={a.desc} onClick={() => setActivityLevel(a.id)} />
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 8: Health */}
            {step === 8 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Condições de Saúde</h1>
                  <p className="text-white/60 text-sm">Toque nas que se aplicam (opcional)</p>
                </div>
                <div className="space-y-2">
                  {(["Hipertensão", "Diabetes", "Doença Cardíaca", "Artrite", "Asma", "Problemas de Tiróide"]).map((c) => (
                    <MultiOption key={c} selected={healthConditions.includes(c)} label={c} onClick={() => toggleHealth(c)} />
                  ))}
                  <Input placeholder="Outras condições..." value={otherCondition}
                    onChange={(e) => setOtherCondition(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1" />
                </div>
                <div />
              </div>
            )}

            {/* Step 9: Diet */}
            {step === 9 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Restrições Alimentares</h1>
                  <p className="text-white/60 text-sm">Toque nas que se aplicam (opcional)</p>
                </div>
                <div className="space-y-2">
                  {(["Vegetariano", "Vegano", "Intolerância à Lactose", "Sem Glúten", "Alergia a Frutos Secos", "Alergia a Marisco"]).map((r) => (
                    <MultiOption key={r} selected={dietRestrictions.includes(r)} label={r} onClick={() => toggleDiet(r)} />
                  ))}
                  <Input placeholder="Outras restrições..." value={otherDiet}
                    onChange={(e) => setOtherDiet(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1" />
                </div>
                <div />
              </div>
            )}

            {/* Step 10: Lifestyle */}
            {step === 10 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Estilo de Vida</h1>
                  <p className="text-white/60 text-sm">Para optimizar o seu plano.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/80">Horas de sono por noite</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Menos de 5h", "5-7 horas", "7-8 horas", "Mais de 8h"]).map((s) => (
                        <button key={s} onClick={() => setSleepHours(s)}
                          className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                            sleepHours === s ? "bg-primary text-white" : "bg-white/10 text-white/60 border border-white/20"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/80">Nível de stress</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Baixo", "Moderado", "Alto", "Muito Alto"]).map((s) => (
                        <button key={s} onClick={() => setStressLevel(s)}
                          className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                            stressLevel === s ? "bg-primary text-white" : "bg-white/10 text-white/60 border border-white/20"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Step 11: Referral */}
            {step === 11 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Como ouviu falar de nós?</h1>
                  <p className="text-white/60 text-sm">Ajude-nos a melhorar.</p>
                </div>
                <div className="space-y-2">
                  {([
                    { id: "tv", label: "📺 TV", needsDetail: false },
                    { id: "redes_sociais", label: "📱 Redes Sociais", needsDetail: false },
                    { id: "ginasio", label: "🏋️ Ginásio", needsDetail: true },
                    { id: "outro", label: "🔗 Outro", needsDetail: true },
                  ]).map((r) => (
                    <div key={r.id}>
                      <SelectOption selected={referralSource === r.id} label={r.label}
                        onClick={() => { setReferralSource(r.id); if (!r.needsDetail) setReferralDetail(""); }} />
                      {r.needsDetail && referralSource === r.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 ml-2">
                          <Input placeholder={r.id === "ginasio" ? "Qual ginásio?" : "Especifique..."}
                            value={referralDetail} onChange={(e) => setReferralDetail(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
                <div />
              </div>
            )}

            {/* Step 12: Summary */}
            {step === 12 && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="text-center">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-1">
                    {goal === "lose" ? "Perder" : goal === "gain" ? "Ganhar" : "Manter"}{" "}
                    <span className="text-primary">{kgDiff} kg</span>
                  </h1>
                  <p className="text-white/60 text-sm">
                    {goal !== "maintain" ? `em ~${weeksEstimate} semanas — é possível!` : "Equilíbrio nutricional perfeito."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { label: "Calorias", value: `${calories}`, highlight: true, delay: 0.1 },
                    { label: "Proteína", value: `${protein}g`, highlight: false, delay: 0.2 },
                    { label: "Carboidratos", value: `${carbs}g`, highlight: false, delay: 0.3 },
                    { label: "Gorduras", value: `${fat}g`, highlight: false, delay: 0.4 },
                  ]).map((item) => (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: item.delay }}
                      className={`p-4 rounded-2xl text-center ${
                        item.highlight ? "bg-primary/15 border border-primary/30" : "bg-white/5 border border-white/10"
                      }`}>
                      <p className="text-[11px] text-white/50 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className={`text-3xl font-bold ${item.highlight ? "text-primary" : "text-white"}`}>{item.value}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="text-center text-white/40 text-xs">
                  Plano ajustado para {goal === "lose" ? `perder ${kgDiff}kg` : goal === "gain" ? `ganhar ${kgDiff}kg` : "manter o peso"}
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="px-5 pb-6 pt-2 shrink-0 relative z-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={step === TOTAL_STEPS ? handleSubmit : goNext}
          disabled={!isStepValid() || loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isStepValid() && !loading
              ? "bg-primary text-white active:scale-[0.98] shadow-glow"
              : "bg-white/10 text-white/30 cursor-not-allowed"
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
