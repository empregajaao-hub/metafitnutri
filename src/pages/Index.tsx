import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Target, ChefHat, TrendingDown, Heart, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallPromptAndroid from "@/components/InstallPromptAndroid";
import InstallInstructionsIOS from "@/components/InstallInstructionsIOS";
import FreePlanModal from "@/components/FreePlanModal";
import AIAssistant from "@/components/AIAssistant";
import logo from "@/assets/logo.png";
import benefitPhotoAnalysis from "@/assets/benefit-photo-analysis.jpg";
import benefitWorkoutPlans from "@/assets/benefit-workout-plans.jpg";
import benefitNutritionTracking from "@/assets/benefit-nutrition-tracking.jpg";
import benefitPersonalizedGoals from "@/assets/benefit-personalized-goals.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Navbar />
      <InstallPromptAndroid />
      <InstallInstructionsIOS />
      <FreePlanModal />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <img 
            src={logo} 
            alt="AngoNutri" 
            className="h-20 md:h-24 mx-auto mb-6"
          />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Angolano • Receitas Locais • Pagamento via Multicaixa</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Tira uma foto.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Recebe os macronutrientes.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            O AngoNutri analisa as tuas refeições e sugere planos personalizados para atingir o teu objetivo — perder peso, ganhar peso ou manter a forma.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/upload')}
              className="group"
            >
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Tirar Foto Agora
            </Button>
            <Button 
              variant="outline-primary" 
              size="xl"
              onClick={() => navigate('/pricing')}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with Beautiful Images */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Benefícios que Transformam a Tua Vida
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Junta-te a milhares de pessoas que estão alcançando seus objetivos de saúde
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="overflow-hidden hover:shadow-glow transition-smooth group">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={benefitPhotoAnalysis} 
                alt="Análise fotográfica de refeições" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">📸 Análise Fotográfica Instantânea</h3>
                <p className="text-white/90 text-sm">
                  Tire uma foto do seu prato e receba análise nutricional completa em segundos
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-glow transition-smooth group">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={benefitWorkoutPlans} 
                alt="Planos de treino personalizados" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">💪 Planos de Treino Personalizados</h3>
                <p className="text-white/90 text-sm">
                  Treinos adaptados aos seus objetivos e nível de condicionamento físico
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-glow transition-smooth group">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={benefitNutritionTracking} 
                alt="Acompanhamento nutricional detalhado" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">📊 Acompanhamento Nutricional Detalhado</h3>
                <p className="text-white/90 text-sm">
                  Monitore suas calorias, macros e progresso com dashboards intuitivos
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-glow transition-smooth group">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={benefitPersonalizedGoals} 
                alt="Objetivos personalizados" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-1">🎯 Metas Personalizadas para Você</h3>
                <p className="text-white/90 text-sm">
                  Estabeleça e alcance seus objetivos com orientação profissional personalizada
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que dizem os nossos utilizadores
          </h2>
          <p className="text-muted-foreground text-lg">
            Centenas de angolanos já estão a atingir os seus objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground mb-4">
              "O AngoNutri ajudou-me a perder 8kg em 2 meses! A análise das refeições é super rápida e as receitas angolanas são perfeitas."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">MC</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Maria Costa</p>
                <p className="text-sm text-muted-foreground">Luanda</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground mb-4">
              "Finalmente uma app de nutrição que entende a nossa comida! O pagamento via Multicaixa é muito conveniente."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-semibold">JS</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">João Santos</p>
                <p className="text-sm text-muted-foreground">Benguela</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground mb-4">
              "Excelente para quem treina! Os planos de refeições são adaptados aos produtos que temos aqui em Angola."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">AF</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Ana Ferreira</p>
                <p className="text-sm text-muted-foreground">Huambo</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-primary p-8 md:p-12 text-center max-w-3xl mx-auto">
          <Heart className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-6">
            Junta-te a centenas de angolanos que já estão a atingir os seus objetivos de saúde.
          </p>
          <Button 
            variant="outline" 
            size="xl"
            onClick={() => navigate('/onboarding')}
            className="bg-background text-primary hover:bg-background/90 border-0"
          >
            Começar Gratuitamente
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="AngoNutri" className="h-10" />
              <div className="text-left">
                <p className="font-semibold text-foreground">AngoNutri</p>
                <p className="text-sm text-muted-foreground">Nutrição inteligente feita em Angola</p>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-primary transition-smooth">
                Sobre
              </button>
              <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-smooth">
                Privacidade
              </button>
              <button onClick={() => navigate('/support')} className="hover:text-primary transition-smooth">
                Suporte
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 AngoNutri. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
