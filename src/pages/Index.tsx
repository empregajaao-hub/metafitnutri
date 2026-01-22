import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Heart, Zap, Star, Dumbbell, LineChart, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import logo from "@/assets/logo.png";
import { getTodayTestimonials, getDayName } from "@/data/rotatingContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoToUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Precisas de uma conta",
        description: "Para tirar/enviar foto, faz login ou cria uma conta primeiro.",
      });
      navigate("/auth");
      return;
    }
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Navbar />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-40 scale-110 animate-pulse"></div>
            <img 
              src={logo} 
              alt="METAFIT" 
              className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-full border-4 border-primary/30 shadow-glow relative z-10 hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Angolano • Receitas Locais</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Tira uma foto.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Recebe os macronutrientes.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            O METAFIT analisa as tuas refeições e sugere planos personalizados para atingir o teu objetivo — perder peso, ganhar peso ou manter a forma.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              variant="hero" 
              size="xl"
              onClick={handleGoToUpload}
              className="group"
            >
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Tirar Foto Agora
            </Button>
            <Button 
              variant="outline-primary" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section (text-only) */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Benefícios que Transformam a Tua Vida
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Junta-te a milhares de pessoas que estão alcançando seus objetivos de saúde
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Análise fotográfica instantânea</h3>
                <p className="text-muted-foreground">
                  Tira uma foto do teu prato e recebe estimativa de calorias e macronutrientes.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Treinos guiados + checklist</h3>
                <p className="text-muted-foreground">
                  Treinos alinhados ao teu objetivo e metas diárias para manter consistência.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <LineChart className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Histórico e progresso</h3>
                <p className="text-muted-foreground">
                  Guarda análises e acompanha evolução com mais clareza e motivação.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Metas personalizadas</h3>
                <p className="text-muted-foreground">
                  Perder, manter ou ganhar — a app adapta as recomendações ao teu objetivo.
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
          <p className="text-xs text-muted-foreground/60 mt-2">
            Depoimentos de {getDayName()}-feira
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {getTodayTestimonials().map((testimonial, idx) => (
            <Card key={idx} className="p-6 hover:shadow-medium transition-smooth">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-4">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center border border-border/50`}>
                  <span className="text-foreground font-semibold text-sm">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
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
            Começar Agora
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="METAFIT" className="h-10" />
              <div className="text-left">
                <p className="font-semibold text-foreground">METAFIT</p>
                <p className="text-sm text-muted-foreground">Nutrientes sob controle</p>
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
              © 2024 METAFIT NUTRI. Desenvolvido por Lubatec.
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
