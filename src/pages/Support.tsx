import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, Clock, Phone } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Como Podemos Ajudar?
            </h1>
            <p className="text-lg text-muted-foreground">
              Estamos aqui para tornar a tua experiência com o AngoNutri a melhor
              possível
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-medium transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                WhatsApp
              </h3>
              <p className="text-muted-foreground mb-4">
                Fala directamente com a nossa equipa
              </p>
              <Button
                variant="hero"
                className="w-full"
                onClick={() =>
                  window.open("https://wa.me/244921346544", "_blank")
                }
              >
                <Phone className="w-4 h-4 mr-2" />
                921 346 544
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-medium transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Email
              </h3>
              <p className="text-muted-foreground mb-4">
                Envia-nos as tuas dúvidas
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  (window.location.href = "mailto:suporte@angonutri.co.ao")
                }
              >
                suporte@angonutri.co.ao
              </Button>
            </Card>
          </div>

          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Horário de Atendimento
                </h3>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 08:00 - 20:00
                </p>
                <p className="text-muted-foreground">
                  Sábado: 09:00 - 18:00
                </p>
                <p className="text-muted-foreground">Domingo: 10:00 - 16:00</p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Perguntas Frequentes
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Como funciona a análise de fotos?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tiras uma foto da tua refeição, a nossa IA analisa os alimentos
                  visíveis e estima os macronutrientes (calorias, proteínas,
                  carboidratos e gorduras).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Quanto tempo demora a activação da subscrição?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Após carregares o comprovativo de pagamento, verificamos em até
                  24 horas e activamos a tua subscrição.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Posso cancelar a subscrição?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sim, podes cancelar a qualquer momento. Contacta o suporte para
                  assistência.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  O plano angolano é personalizável?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sim! O plano adapta-se ao teu objetivo (perder peso, manter ou
                  ganhar massa) e usa ingredientes locais.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Posso usar o AngoNutri offline?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Precisas de internet para analisar fotos e gerar receitas, mas
                  podes ver o teu histórico e planos salvos offline.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;