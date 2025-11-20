import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Gratuito",
      price: "0 Kz",
      period: "",
      features: [
        "1 foto por dia",
        "Análises básicas",
        "Histórico limitado",
      ],
      notIncluded: [
        "Plano semanal",
        "Guia de treinos",
        "Receitas completas",
        "Plano angolano",
      ],
      cta: "Começar Grátis",
      highlighted: false,
    },
    {
      name: "Premium Mensal",
      price: "5.000 Kz",
      period: "/mês",
      trial: "7 dias grátis",
      features: [
        "Análises ilimitadas",
        "Receitas completas",
        "Guia de treinos",
        "Plano ANGOLANO diário",
        "Notificações personalizadas",
        "Histórico completo",
        "Exportar plano em PDF",
        "Suporte por WhatsApp",
      ],
      cta: "Começar Teste Grátis",
      highlighted: true,
    },
    {
      name: "Premium Anual",
      price: "40.000 Kz",
      period: "/ano",
      savings: "Poupa 20.000 Kz por ano!",
      discount: "Desconto de 33%",
      features: [
        "Tudo do plano mensal",
        "Prioridade no suporte WhatsApp",
        "Livro digital incluído",
        "Guia de treinos avançado",
      ],
      cta: "Assinar Anual",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolhe o Teu Plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Começa a tua jornada de saúde com o AngoNutri. Planos adaptados às
            tuas necessidades.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center justify-center text-sm">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
              💳 Pagamento via Multicaixa Express e ATM
            </span>
            <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-semibold">
              ⚡ Ativação em menos de 1 hora
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.highlighted
                  ? "border-2 border-primary shadow-glow"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.trial && (
                  <p className="text-sm text-secondary font-semibold">
                    {plan.trial}
                  </p>
                )}
                {plan.discount && (
                  <p className="text-sm text-primary font-semibold">
                    {plan.discount}
                  </p>
                )}
                {plan.savings && (
                  <p className="text-sm text-accent mt-2">{plan.savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded?.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-muted-foreground line-through"
                  >
                    <span className="w-5 h-5 flex-shrink-0"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/payment")}
                variant={plan.highlighted ? "hero" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Tens dúvidas? Fala connosco no WhatsApp
          </p>
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://wa.me/244921346544", "_blank")
            }
          >
            Contactar Suporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;