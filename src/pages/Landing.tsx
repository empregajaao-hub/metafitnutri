import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Apple, 
  Play, 
  CheckCircle2, 
  Star, 
  Zap, 
  ShieldCheck, 
  UtensilsCrossed,
  Activity,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const appleStoreUrl = "https://apps.apple.com/ao/app/metafit-nutri/id6756487211";
  const androidUrl = "https://metafitnutri.vercel.app/";

  const features = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-primary" />,
      title: "Receitas 100% Angolanas",
      description: "Cozinha o que amas com ingredientes que encontras no mercado local: do funge ao peixe grelhado, tudo adaptado à tua saúde."
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "Treinos Personalizados",
      description: "Planos de exercício desenhados para o teu corpo e objetivos, seja em casa ou no ginásio."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "IA Nutricional",
      description: "Tira uma foto ao teu prato e a nossa inteligência artificial analisa instantaneamente as calorias e nutrientes."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/10 to-transparent -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                <Star className="w-4 h-4 fill-primary" />
                <span>O App #1 de Nutrição em Angola</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                Transforma a tua saúde com o sabor de <span className="text-primary">Angola</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                O METAFIT Nutri é o primeiro assistente pessoal de saúde totalmente adaptado à nossa realidade. Comida local, resultados reais.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button 
                  size="xl" 
                  className="w-full sm:w-auto rounded-2xl gap-3 shadow-glow group"
                  onClick={() => window.open(appleStoreUrl, '_blank')}
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold opacity-70 leading-none">Download na</div>
                    <div className="text-lg font-bold leading-none">App Store</div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button 
                  size="xl" 
                  variant="outline-primary"
                  className="w-full sm:w-auto rounded-2xl gap-3 bg-background/50 backdrop-blur-sm"
                  onClick={() => window.open(androidUrl, '_blank')}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold opacity-70 leading-none">Disponível para</div>
                    <div className="text-lg font-bold leading-none">Android</div>
                  </div>
                </Button>
              </div>
            </motion.div>

            {/* App Preview Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-[300px] md:max-w-[600px]"
            >
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse" />
              <img 
                src="/assets/splash-intro.png" 
                alt="Metafit Nutri App" 
                className="rounded-[2.5rem] shadow-2xl border-8 border-card relative z-10 w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Porquê escolher o METAFIT?</h2>
            <p className="text-muted-foreground">Tecnologia de ponta ao serviço da cultura angolana.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full bg-background/50 border-none hover:shadow-medium transition-smooth group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-black text-primary mb-1">100%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Angolano</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary mb-1">5k+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Utilizadores</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary mb-1">4.9</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Avaliação</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary mb-1">24/7</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-4xl mx-auto p-12 md:p-20 border-none bg-card/80 backdrop-blur-md shadow-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -mr-32 -mt-32" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para a tua melhor versão?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Junta-te a milhares de angolanos que já estão a transformar as suas vidas com o METAFIT Nutri.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Seguro e Privado</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Grátis para Começar</span>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
               <Button 
                  size="lg" 
                  className="rounded-xl gap-2"
                  onClick={() => window.open(appleStoreUrl, '_blank')}
                >
                  <Apple className="w-5 h-5" />
                  iPhone
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={() => window.open(androidUrl, '_blank')}
                >
                  <Play className="w-5 h-5 fill-current" />
                  Android
                </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">METAFIT <span className="text-primary">NUTRI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 METAFIT Nutri. Orgulhosamente feito em Angola 🇦🇴
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
