import { X, Crown, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadPaymentModal = ({ isOpen, onClose }: UploadPaymentModalProps) => {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onClose();
    navigate('/pricing');
  };

  const plans = [
    {
      id: "mensal",
      name: "Mensal",
      subtitle: "Fit na Responsa",
      price: "2.500 Kz",
      period: "/mês",
      features: [
        "Análises ilimitadas de refeições",
        "Receitas 100% angolanas",
        "Notificações personalizadas",
        "Histórico completo",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Atleta",
      price: "5.000 Kz",
      period: "/mês",
      features: [
        "Tudo do plano Mensal",
        "Plano alimentar personalizado",
        "Relatórios semanais detalhados",
        "Coach virtual dedicado",
      ],
      popular: true,
    },
    {
      id: "anual",
      name: "Anual",
      subtitle: "Fit do Ano Todo",
      price: "50.000 Kz",
      period: "/ano",
      savings: "Poupa 10.000 Kz (1-2 meses grátis)",
      features: [
        "Tudo do Premium",
        "1 a 2 meses grátis",
        "Apoio prioritário",
        "Acesso antecipado a novidades",
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Desbloquear Mais Análises
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gradient-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-2">
              🎉 Análise completa concluída!
            </p>
            <p className="text-sm text-muted-foreground">
              Com análise completa e receitas 100% angolanas já no plano gratuito. Assine para análises ilimitadas e benefícios exclusivos!
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
                  <p className="text-xs text-muted-foreground font-semibold mb-2">{plan.subtitle}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-xs text-secondary font-medium mt-1">
                      💰 {plan.savings}
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

          <div className="bg-gradient-secondary/10 rounded-lg p-4 border border-secondary/20">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">
                  💳 Como Pagar?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Escolhe o plano acima e paga via:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li>• Multicaixa Express</li>
                  <li>• Transferência Bancária</li>
                  <li>• ATM Referência</li>
                </ul>
                <div className="bg-background/50 rounded p-2 mb-3 space-y-1">
                  <p className="text-xs">
                    <span className="text-muted-foreground">IBAN:</span>{" "}
                    <span className="font-mono font-semibold text-foreground">005500008438815210195</span>
                  </p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Titular:</span>{" "}
                    <span className="font-semibold text-foreground">Repair Lubatec</span>
                  </p>
                </div>
                <p className="text-xs text-accent font-medium mb-2">
                  ⚡ Ativação em menos de 1 hora após envio do comprovativo!
                </p>
                <div className="space-y-1">
                  <p className="text-xs">
                    <span className="text-muted-foreground">📱 WhatsApp:</span>{" "}
                    <a href="https://wa.me/244921346544" className="text-secondary hover:underline font-medium">
                      921 346 544
                    </a>
                  </p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">✉️ Email:</span>{" "}
                    <a href="mailto:angonutri@gmail.com" className="text-secondary hover:underline font-medium">
                      angonutri@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleViewPlans} className="flex-1">
              Ver Planos e Pagar
            </Button>
            <Button onClick={onClose} variant="ghost">
              Mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPaymentModal;
