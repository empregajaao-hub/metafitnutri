import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Sparkles, Trophy, Rocket, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Gratuito",
      subtitle: "Iniciar a Jornada",
      price: "0 Kz",
      period: "",
      features: [
        "Registo de 1 refeição por dia",
        "Contador de calorias básico",
        "Histórico de 2 dias",
        "Treinos simples",
        "Acesso à PWA",
      ],
      cta: "Começar Grátis",
      highlighted: false,
    },
    {
      name: "Mensal",
      subtitle: "Fit na Responsa",
      price: "2.500 Kz",
      period: "/mês",
      features: [
        "Registos ilimitados de refeições",
        "Histórico completo",
        "Plano alimentar básico",
        "Notificações de água, refeições e treinos",
        "Treinos organizados",
        "Acesso a desafios mensais",
      ],
      cta: "Ativar Plano Mensal",
      highlighted: false,
    },
    {
      name: "Premium",
      subtitle: "Atleta",
      price: "5.000 Kz",
      period: "/mês",
      features: [
        "Tudo do plano Mensal",
        "Plano alimentar personalizado",
        "Relatórios semanais",
        "Treinos personalizados",
        "Coach virtual",
        "Exportar plano em PDF",
      ],
      cta: "Tornar-se Premium",
      highlighted: true,
    },
    {
      name: "Anual",
      subtitle: "Fit do Ano Todo",
      price: "45.000 Kz",
      period: "/ano",
      savings: "1 a 2 meses grátis",
      features: [
        "Tudo do Premium",
        "1 a 2 meses grátis",
        "Apoio prioritário",
      ],
      cta: "Assinar Anual",
      highlighted: false,
    },
  ];

  const comparisonFeatures = [
    { name: "Registos de refeições", free: "1 por dia", mensal: "Ilimitados", premium: "Ilimitados", anual: "Ilimitados" },
    { name: "Contador de calorias", free: "Básico", mensal: "Completo", premium: "Completo", anual: "Completo" },
    { name: "Histórico", free: "2 dias", mensal: "Completo", premium: "Completo", anual: "Completo" },
    { name: "Plano alimentar", free: false, mensal: "Básico", premium: "Personalizado", anual: "Personalizado" },
    { name: "Treinos", free: "Simples", mensal: "Organizados", premium: "Personalizados", anual: "Personalizados" },
    { name: "Notificações", free: false, mensal: true, premium: true, anual: true },
    { name: "Desafios mensais", free: false, mensal: true, premium: true, anual: true },
    { name: "Relatórios semanais", free: false, mensal: false, premium: true, anual: true },
    { name: "Coach virtual", free: false, mensal: false, premium: true, anual: true },
    { name: "Exportar PDF", free: false, mensal: false, premium: true, anual: true },
    { name: "Apoio prioritário", free: false, mensal: false, premium: false, anual: true },
  ];

  const faqs = [
    {
      q: "Como faço o pagamento?",
      a: "Aceitamos pagamentos via Multicaixa Express e transferência bancária (IBAN: 005500008438815210195). Após o pagamento, envia o comprovativo via WhatsApp para ativação imediata."
    },
    {
      q: "Quando é ativada a minha subscrição?",
      a: "A ativação é feita em menos de 1 hora após recebermos o comprovativo de pagamento."
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim! Podes cancelar a qualquer momento. No plano mensal, não haverá renovação automática. No plano anual, terás acesso até o fim do período pago."
    },
    {
      q: "O que acontece se não renovar?",
      a: "A tua conta volta automaticamente para o plano gratuito, mantendo acesso básico à app."
    },
    {
      q: "Posso mudar de plano?",
      a: "Sim! Podes fazer upgrade ou downgrade a qualquer momento. Contacta-nos via WhatsApp para ajustar."
    }
  ];

  const getPlanIcon = (name: string) => {
    switch (name) {
      case "Gratuito": return <Sparkles className="w-8 h-8" />;
      case "Mensal": return <Trophy className="w-8 h-8" />;
      case "Premium": return <Rocket className="w-8 h-8" />;
      case "Anual": return <Crown className="w-8 h-8" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolhe o Teu Plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Começa a tua jornada de saúde com o AngoNutri. Planos adaptados às
            tuas necessidades.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center text-sm">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
              💳 Pagamento via Multicaixa Express e ATM
            </span>
            <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-semibold">
              ⚡ Ativação em menos de 1 hora
            </span>
          </div>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.highlighted
                  ? "border-2 border-primary shadow-glow scale-105"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold z-10">
                  Mais Popular
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3 text-primary">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-semibold">
                  {plan.subtitle}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                {plan.savings && (
                  <p className="text-xs text-accent mt-2 font-semibold">{plan.savings}</p>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/payment")}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela Comparativa */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Comparação de Planos
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Funcionalidade</th>
                      <th className="text-center p-4 font-semibold">Gratuito</th>
                      <th className="text-center p-4 font-semibold">Mensal</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">Premium</th>
                      <th className="text-center p-4 font-semibold">Anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="text-center p-4">
                          {feature.free === true ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : feature.free === false ? (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {feature.mensal === true ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : feature.mensal === false ? (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-sm">{feature.mensal}</span>
                          )}
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          {feature.premium === true ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : feature.premium === false ? (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-sm font-semibold">{feature.premium}</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {feature.anual === true ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : feature.anual === false ? (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-sm">{feature.anual}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Perguntas Frequentes
          </h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Suporte */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">
            Tens mais dúvidas? Fala connosco no WhatsApp
          </p>
          <Button
            size="lg"
            onClick={() =>
              window.open("https://wa.me/244921346544", "_blank")
            }
          >
            Contactar Suporte
          </Button>
        </div>
      </div>
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Pricing;