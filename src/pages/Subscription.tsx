import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Crown, 
  Star, 
  Users,
  Upload,
  ArrowLeft,
  Clock,
  CreditCard,
  Sparkles,
  Smartphone
} from "lucide-react";
import { validateReceiptFile } from "@/lib/validations";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

interface Plan {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  features: { text: string; included: boolean }[];
  popular?: boolean;
}

const MOTIVATIONAL_MESSAGES = [
  "💪 A tua jornada para uma vida mais saudável começa agora!",
  "🥗 Alimentação saudável é o primeiro passo para o sucesso!",
  "🏋️ O teu corpo vai agradecer cada escolha saudável!",
  "🌟 Estás a fazer um investimento em ti mesmo!",
  "🎯 Cada dia é uma nova oportunidade de ser melhor!",
  "💚 Saúde é a verdadeira riqueza!",
  "🔥 Tens todo o potencial para alcançar os teus objectivos!",
  "✨ A transformação começa de dentro para fora!",
];

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [months, setMonths] = useState(1);
  const [step, setStep] = useState<"plans" | "checkout" | "countdown">("plans");
  const [paymentMethod, setPaymentMethod] = useState<"IBAN" | "MCX">("MCX");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans: Plan[] = [
    {
      id: "essential",
      name: "Plano Individual",
      price: 2500,
      icon: <Star className="w-6 h-6" />,
      features: [
        { text: "Para 1 utilizador", included: true },
        { text: "Análise de refeições ilimitadas", included: true },
        { text: "Análise de ingredientes crus com IA", included: true },
        { text: "Receitas adaptadas ao teu objectivo", included: true },
        { text: "Gerar planos de alimentação", included: true },
        { text: "Gerar planos de treino", included: true },
        { text: "Histórico completo com fotos", included: true },
      ],
    },
    {
      id: "evolution",
      name: "Plano Familiar",
      price: 5000,
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: [
        { text: "Para até 3 pessoas (tu + 2)", included: true },
        { text: "Convidar membros por email/link", included: true },
        { text: "Análise de refeições ilimitadas", included: true },
        { text: "Análise de ingredientes crus com IA", included: true },
        { text: "Receitas adaptadas ao objectivo de cada um", included: true },
        { text: "Gerar planos de alimentação", included: true },
        { text: "Gerar planos de treino", included: true },
      ],
    },
    {
      id: "personal_trainer",
      name: "Plano Profissional",
      price: 15000,
      icon: <Users className="w-6 h-6" />,
      features: [
        { text: "Para até 10 pessoas (tu + 9)", included: true },
        { text: "Convidar membros por email/link", included: true },
        { text: "Tudo do Plano Familiar", included: true },
        { text: "Gestão de alunos ilimitados", included: true },
        { text: "Gerar planos para alunos", included: true },
        { text: "Dashboard de gestão", included: true },
        { text: "Suporte prioritário", included: true },
      ],
    },
  ];

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      if (paymentMethod === "IBAN") {
        toast({
          title: "Comprovativo em revisão",
          description: "Recebemos o seu comprovativo, mas ele precisa de validação. A conta só será activada após confirmação.",
        });
      } else {
        toast({
          title: "Tempo esgotado",
          description: "Não detectamos a confirmação do pagamento. Se já pagou, a sua conta será ativada em breve.",
        });
      }
      navigate("/");
    }
  }, [step, countdown]);

  useEffect(() => {
    if (step === "countdown") {
      const messageTimer = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
      }, 5000);
      return () => clearInterval(messageTimer);
    }
  }, [step]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscription) {
        const trialStart = new Date(subscription.trial_start_date || subscription.created_at);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, 7 - daysPassed);
        
        setTrialDays(remainingDays);
        setIsTrialExpired(remainingDays <= 0 && subscription.plan === "free");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const getSelectedPlan = () => plans.find(p => p.id === selectedPlan);
  
  const getTotalPrice = () => {
    const plan = getSelectedPlan();
    if (!plan) return 0;
    return plan.price * months;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateReceiptFile(file);
      if (!validation.valid) {
        toast({
          title: "Erro",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleMCXPayment = async () => {
    if (!phoneNumber || !selectedPlan) {
      toast({
        title: "Erro",
        description: "Por favor, insira o número de telemóvel.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // 1. Criar registo de pagamento pendente
      const { error: paymentError } = await supabase
        .from("Pagamentos")
        .insert({
          user_id: user.id,
          plano: selectedPlan as "essential" | "evolution" | "personal_trainer",
          Valor: getTotalPrice(),
          estado: "pending",
          "Forma de Pag": "MCX",
        });

      if (paymentError) throw paymentError;

      // 2. Chamar a Edge Function para criar a transação no ProxyPay
      const { data, error } = await supabase.functions.invoke("create-proxypay-transaction", {
        body: {
          mobile: phoneNumber,
          amount: getTotalPrice(),
          planId: selectedPlan,
          months: months
        }
      });

      if (error) throw error;

      toast({
        title: "Pedido enviado!",
        description: "Por favor, confirme o pagamento na sua App Multicaixa Express.",
      });
      
      setStep("countdown");
    } catch (error: any) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pedido MCX.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleIBANCheckout = async () => {
    if (!receiptFile || !selectedPlan) return;
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // Upload receipt
      const fileName = `${user.id}/${Date.now()}_${receiptFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Create payment record
      const { data: createdPayment, error: paymentError } = await supabase
        .from("Pagamentos")
        .insert({
          user_id: user.id,
          plano: selectedPlan as "essential" | "evolution" | "personal_trainer",
          Valor: getTotalPrice(),
          receipt_url: fileName,
          estado: "pending",
          "Forma de Pag": "IBAN",
        })
        .select("id")
        .single();

      if (paymentError) throw paymentError;

      // Try automatic validation (OCR)
      const { data: validateData, error: validateError } = await supabase.functions.invoke(
        "validate-receipt",
        {
          body: {
            filePath: fileName,
            expectedAmount: getTotalPrice(),
            expectedIban: "005500008438815210195",
            expectedRecipient: "Repair Lubatec",
            maxAgeDays: 3,
          },
        },
      );

      if (validateError) {
        setStep("countdown");
        return;
      }

      if (validateData?.ok) {
        toast({
          title: "Comprovativo validado automaticamente",
          description: "O pagamento foi confirmado e a subscrição será activada.",
        });
        await activateSubscription();
        if (createdPayment?.id) {
          await supabase.from("Pagamentos").update({ estado: "approved" }).eq("id", createdPayment.id);
        }
        return;
      }

      toast({
        title: "Comprovativo em revisão",
        description: "Não foi possível validar automaticamente. A nossa equipa vai confirmar manualmente.",
      });
      setStep("countdown");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const activateSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const plan = getSelectedPlan();
      if (!plan) return;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      await supabase
        .from("user_subscriptions")
        .update({
          plan: plan.id as "essential" | "evolution" | "personal_trainer",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        })
        .eq("user_id", user.id);

      await supabase
        .from("Pagamentos")
        .update({ estado: "approved" })
        .eq("user_id", user.id)
        .eq("estado", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      toast({
        title: "Subscrição Activada! 🎉",
        description: `O seu plano ${plan.name} está agora ativo.`,
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (step === "countdown") {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {paymentMethod === "MCX" ? "A aguardar confirmação..." : "A processar pagamento..."}
            </h1>
            <p className="text-muted-foreground">
              {paymentMethod === "MCX" 
                ? "Por favor, autorize o pagamento na sua App Multicaixa Express."
                : "Por favor, aguarde enquanto verificamos o seu comprovativo."}
            </p>
          </div>

          <div className="mb-8">
            <div className="text-6xl font-bold text-primary mb-2">
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
            </div>
            <p className="text-sm text-muted-foreground">
              A conta será activada automaticamente após confirmação
            </p>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-lg text-foreground animate-fade-in">
              {MOTIVATIONAL_MESSAGES[currentMessage]}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "checkout") {
    const plan = getSelectedPlan();
    if (!plan) return null;

    return (
      <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setStep("plans")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="max-w-lg mx-auto">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Finalizar Pagamento</h1>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{plan.name}</span>
                  <span>{plan.price.toLocaleString()} Kz/mês</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Duração</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMonths(Math.max(1, months - 1))}
                    >
                      -
                    </Button>
                    <span className="w-16 text-center">{months} {months === 1 ? "mês" : "meses"}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMonths(months + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {getTotalPrice().toLocaleString()} Kz
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant={paymentMethod === "MCX" ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-2"
                  onClick={() => setPaymentMethod("MCX")}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs">MCX Express</span>
                </Button>
                <Button
                  variant={paymentMethod === "IBAN" ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-2"
                  onClick={() => setPaymentMethod("IBAN")}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs">Transferência</span>
                </Button>
              </div>

              {paymentMethod === "MCX" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Insira o número de telemóvel associado ao seu Multicaixa Express.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Número de Telemóvel</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="9XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full"
                    disabled={!phoneNumber || uploading}
                    onClick={handleMCXPayment}
                  >
                    {uploading ? "A enviar pedido..." : "Pagar com MCX Express"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <h3 className="font-medium mb-2">Transferir para:</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Titular:</strong> Repair Lubatec</p>
                      <div className="flex items-center gap-2">
                        <p><strong>IBAN:</strong> <span className="font-mono select-all">005500008438815210195</span></p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText("005500008438815210195");
                            toast({ title: "IBAN copiado!", description: "Colado na área de transferência." });
                          }}
                        >
                          📋 Copiar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="receipt">Anexar Comprovativo</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full h-24 border-dashed"
                      onClick={() => document.getElementById("receipt")?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        {receiptFile ? (
                          <span className="text-sm text-primary">{receiptFile.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Clique para anexar</span>
                        )}
                      </div>
                    </Button>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full"
                    disabled={!receiptFile || uploading}
                    onClick={handleIBANCheckout}
                  >
                    {uploading ? "A processar..." : "Confirmar Pagamento"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Escolha o Seu Plano
          </h1>
          <p className="text-muted-foreground">
            Invista na sua saúde com METAFIT NUTRI
          </p>
          
          {trialDays !== null && trialDays > 0 && (
            <Badge variant="secondary" className="mt-4">
              🎁 {trialDays} dias restantes de teste grátis
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 relative cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === plan.id
                  ? "ring-2 ring-primary"
                  : "hover:ring-1 hover:ring-primary/50"
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Mais Popular
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground"> Kz/mês</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full mt-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.id);
                  setStep("checkout");
                }}
              >
                Seleccionar
              </Button>
            </Card>
          ))}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Subscription;
