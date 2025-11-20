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
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const iban = "0055 0000 8438 8152 1019 5";
  const accountName = "REPAIR LUBATEC";

  const plans = {
    monthly: { price: "5.000 Kz", amount: 5000 },
    annual: { price: "40.000 Kz", amount: 40000 },
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
      const { error } = await supabase.from("payments").insert({
        user_id: user.id,
        plan: selectedPlan,
        amount: plans[selectedPlan].amount,
        payment_method: "bank_transfer",
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Pagamento Submetido!",
        description: "Vamos verificar o teu pagamento e activar a tua subscrição em breve.",
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
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            Pagamento
          </h1>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Escolhe o Teu Plano
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`p-4 rounded-lg border-2 transition-smooth ${
                  selectedPlan === "monthly"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="text-sm text-muted-foreground mb-1">Mensal</p>
                <p className="text-2xl font-bold text-primary">5.000 Kz</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </button>

              <button
                onClick={() => setSelectedPlan("annual")}
                className={`p-4 rounded-lg border-2 transition-smooth relative ${
                  selectedPlan === "annual"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="absolute -top-2 right-2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                  -33%
                </div>
                <p className="text-sm text-muted-foreground mb-1">Anual</p>
                <p className="text-2xl font-bold text-primary">40.000 Kz</p>
                <p className="text-xs text-muted-foreground">/ano</p>
              </button>
            </div>

            {selectedPlan === "annual" && (
              <div className="bg-accent/10 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-accent font-semibold">
                  🎉 Poupa 20.000 Kz por ano!
                </p>
              </div>
            )}
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Transferência Bancária
            </h2>

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
                  Após fazer a transferência, carrega o comprovativo
                </Label>
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