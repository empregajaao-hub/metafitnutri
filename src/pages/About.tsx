import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sobre o AngoNutri
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A tua jornada para uma vida mais saudável começa aqui, com
              tecnologia adaptada à realidade angolana
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  A Nossa Missão
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O AngoNutri foi criado para democratizar o acesso à nutrição de
                  qualidade em Angola. Acreditamos que todos merecem ter
                  ferramentas simples e eficazes para cuidar da sua saúde,
                  usando ingredientes locais e respeitando a nossa cultura
                  alimentar.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                IA Inteligente
              </h3>
              <p className="text-sm text-muted-foreground">
                Tecnologia avançada para analisar refeições e gerar planos
                personalizados
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Foco Local
              </h3>
              <p className="text-sm text-muted-foreground">
                Receitas e planos com ingredientes angolanos acessíveis e
                saborosos
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Comunidade
              </h3>
              <p className="text-sm text-muted-foreground">
                Suporte contínuo e uma comunidade que se apoia mutuamente
              </p>
            </Card>
          </div>

          <Card className="p-8 mb-8 bg-primary/10 border-primary">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Como Funciona?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Define o Teu Objetivo
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Perder peso, manter ou ganhar massa muscular
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Tira Fotos das Refeições
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A nossa IA analisa e mostra os macronutrientes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Recebe Planos Personalizados
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Refeições, receitas e treinos adaptados a ti
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Acompanha o Progresso
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Histórico completo e insights sobre a tua evolução
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Pronto para começar a tua jornada de saúde?
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/pricing")}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;