import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [selectedPlan, setSelectedPlan] = useState<"mensal" | "premium" | "anual">("mensal");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const iban = "005500008438815210195";
  const accountName = "Repair Lubatec";

  const plans = {
    mensal: { 
      name: "Mensal",
      subtitle: "Fit na Responsa",
      price: "2.500 Kz", 
      amount: 2500,
      dbPlan: "monthly"
    },
    premium: { 
      name: "Premium",
      subtitle: "Atleta",
      price: "5.000 Kz", 
      amount: 5000,
      dbPlan: "monthly"
    },
    anual: { 
      name: "Anual",
      subtitle: "Fit do Ano Todo",
      price: "50.000 Kz", 
      amount: 50000,
      savings: "Poupa 10.000 Kz",
      dbPlan: "annual"
    },
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "IBAN copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile) {
      toast({
        title: "Erro",
        description: "Por favor, carrega o comprovativo de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Here you would upload the receipt to storage
      // For now, we'll just create the payment record
      const { error } = await supabase.from("payments").insert([{
        user_id: user.id,
        plan: plans[selectedPlan].dbPlan as "monthly" | "annual",
        amount: plans[selectedPlan].amount,
        payment_method: "bank_transfer",
        status: "pending",
      }]);

      if (error) throw error;

      toast({
        title: "Pagamento Submetido!",
        description: "Vamos verificar o teu pagamento e activar a tua subscrição em menos de 1 hora.",
      });

      navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Pagamento
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center text-sm">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
                💳 Multicaixa Express e ATM
              </span>
              <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-semibold">
                ⚡ Ativação em menos de 1 hora
              </span>
            </div>
          </div>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Escolhe o Teu Plano
            </h2>

            <div className="grid gap-3 mb-6">
              <button
                onClick={() => setSelectedPlan("mensal")}
                className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                  selectedPlan === "mensal"
                    ? "border-primary bg-primary/5 shadow-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">{plans.mensal.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">{plans.mensal.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{plans.mensal.price}</p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("premium")}
                className={`p-4 rounded-lg border-2 transition-smooth text-left relative ${
                  selectedPlan === "premium"
                    ? "border-primary bg-primary/5 shadow-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">
                  Mais Popular
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">{plans.premium.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">{plans.premium.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{plans.premium.price}</p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("anual")}
                className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                  selectedPlan === "anual"
                    ? "border-primary bg-primary/5 shadow-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-foreground">{plans.anual.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">{plans.anual.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{plans.anual.price}</p>
                    <p className="text-xs text-muted-foreground">/ano</p>
                  </div>
                </div>
              </button>
            </div>

            {selectedPlan === "anual" && (
              <div className="bg-accent/10 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-accent font-semibold">
                  🎉 {plans.anual.savings}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Instruções para Pagamento via Multicaixa Express ou ATM
            </h2>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                <span className="font-semibold">💡 Dica:</span> Podes fazer o pagamento via <span className="font-semibold">Multicaixa Express</span> (app ou balcão) ou <span className="font-semibold">ATM</span> usando o IBAN abaixo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">IBAN</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={iban}
                    readOnly
                    className="flex-1 font-mono text-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(iban)}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Nome da Conta
                </Label>
                <Input
                  value={accountName}
                  readOnly
                  className="mt-1 font-semibold"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Valor a Transferir
                </Label>
                <Input
                  value={plans[selectedPlan].price}
                  readOnly
                  className="mt-1 text-2xl font-bold text-primary"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Carregar Comprovativo
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="receipt">
                  Após fazer o pagamento via Multicaixa Express ou ATM, carrega o comprovativo
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  A tua subscrição será ativada <span className="font-semibold text-primary">em menos de 1 hora</span> após verificação.
                </p>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth cursor-pointer">
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    {receiptFile ? (
                      <p className="text-sm text-foreground font-semibold">
                        {receiptFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Clica para carregar o comprovativo
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG ou PDF (máx. 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSubmitPayment}
                variant="hero"
                className="w-full"
                disabled={!receiptFile || uploading}
              >
                {uploading ? "Enviando..." : "Submeter Pagamento"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-2">
              📱 Precisa de Ajuda?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Contacta o nosso suporte via WhatsApp
            </p>
            <Button
              variant="outline"
              onClick={() =>
                window.open("https://wa.me/244921346544", "_blank")
              }
            >
              WhatsApp: 921 346 544
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;