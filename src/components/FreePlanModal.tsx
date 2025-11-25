import { useState, useEffect } from "react";
import { X, Crown, Check, Upload, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const FreePlanModal = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const modalShown = localStorage.getItem('free-plan-modal-shown');
    const freeUsageCount = parseInt(localStorage.getItem('free-usage-count') || '0');
    
    // Mostrar após 1 uso gratuito
    if (!modalShown && freeUsageCount >= 1) {
      const timer = setTimeout(() => {
        setShowModal(true);
        localStorage.setItem('free-plan-modal-shown', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleViewPlans = () => {
    setShowModal(false);
    navigate('/pricing');
  };

  const plans = [
    {
      name: "Mensal",
      price: "5.000 Kz",
      period: "/mês",
      features: [
        "Análise ilimitada de refeições",
        "Receitas 100% angolanas",
        "Plano personalizado semanal",
        "Suporte prioritário",
      ],
      popular: false,
    },
    {
      name: "Anual",
      price: "50.000 Kz",
      period: "/ano",
      savings: "Poupa 10.000 Kz",
      features: [
        "Tudo do plano mensal",
        "2 meses grátis",
        "Acesso antecipado a novidades",
        "Consulta nutricional grátis",
      ],
      popular: true,
    },
  ];

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Gosta do METAFIT?
            </DialogTitle>
            <button
              onClick={() => setShowModal(false)}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gradient-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-2">
              🎉 Usaste a tua análise gratuita!
            </p>
            <p className="text-sm text-muted-foreground">
              Escolhe um plano para continuar a analisar refeições e receber receitas angolanas personalizadas.
            </p>
          </div>

          <div className="space-y-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-4 relative ${
                  plan.popular ? 'border-primary shadow-soft' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-primary">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-xs text-secondary font-medium mt-1">
                      {plan.savings}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <Upload className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Métodos de pagamento
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Multicaixa Express, Transferência Bancária ou ATM.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">IBAN:</span> 005500008438815210195
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Nome:</span> Repair Lubatec
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anexe o recibo (jpg, png, pdf) após efetuar o pagamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-secondary/10 rounded-lg p-4 border border-secondary/20">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Precisa de ajuda?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    WhatsApp: <a href="https://wa.me/244921346544" className="text-secondary hover:underline font-medium">921 346 544</a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email: <a href="mailto:angonutri@gmail.com" className="text-secondary hover:underline font-medium">angonutri@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleViewPlans} className="flex-1">
              Ver Planos Completos
            </Button>
            <Button onClick={() => setShowModal(false)} variant="ghost">
              Mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreePlanModal;
