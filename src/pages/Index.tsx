import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Target, ChefHat, TrendingDown, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nutrição inteligente para Angola</span>
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
              onClick={() => navigate('/onboarding')}
              className="group"
            >
              <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Começar Agora
            </Button>
            <Button 
              variant="outline-primary" 
              size="xl"
            >
              Como Funciona
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 hover:shadow-medium transition-smooth border-border/50">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Análise Instantânea</h3>
            <p className="text-muted-foreground">
              Tira uma foto da tua refeição e recebe a contagem de calorias, proteínas, carboidratos e gorduras em segundos.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth border-border/50">
            <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
              <ChefHat className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Receitas Locais</h3>
            <p className="text-muted-foreground">
              Envia fotos dos ingredientes e recebe receitas adaptadas com produtos angolanos e conselhos nutricionais.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth border-border/50">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Planos Personalizados</h3>
            <p className="text-muted-foreground">
              Define o teu objetivo e recebe sugestões semanais de refeições com lista de compras incluída.
            </p>
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
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2024 AngoNutri. Nutrição inteligente feita em Angola.</p>
      </footer>
    </div>
  );
};

export default Index;
