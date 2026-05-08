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
  ArrowRight,
  Flame,
  Target,
  Users,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const appleStoreUrl = "https://apps.apple.com/ao/app/metafit-nutri/id6756487211";
  const androidUrl = "https://metafitnutri.vercel.app/";

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Perdeu 12kg em 3 meses",
      image: "👩‍🦱",
      text: "O METAFIT mudou a minha vida. Finalmente posso comer comida angolana e emagrecer!"
    },
    {
      name: "João Santos",
      role: "Ganhou 8kg de músculo",
      image: "👨‍💼",
      text: "Os treinos são perfeitos para o meu estilo de vida. Muito prático e eficaz."
    },
    {
      name: "Ana Costa",
      role: "Melhorou a saúde geral",
      image: "👩‍🔬",
      text: "Adoro as receitas angolanas. Nunca pensei que podia ser tão fácil e saudável."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Hero Section com Imagem de Fundo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Background Image com Overlay */}
        <div className="absolute inset-0 -z-10">
          <img 
            src="/assets/hero-angola-fitness.jpg" 
            alt="Fitness em Angola" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary text-sm font-bold mb-8 hover:bg-primary/30 transition-all">
                <Star className="w-4 h-4 fill-primary" />
                <span>Transformando vidas em Angola 🇦🇴</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
                Saúde de <span className="text-primary">Verdade</span> com Comida de <span className="text-primary">Verdade</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl font-light">
                O METAFIT Nutri é o primeiro app de saúde 100% angolano. Coma o que ama, da forma que ama, e atinja os seus objetivos de saúde com tecnologia de ponta.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="xl" 
                    className="w-full sm:w-auto rounded-2xl gap-3 shadow-2xl text-lg font-bold group bg-primary hover:bg-primary/90"
                    onClick={() => window.open(appleStoreUrl, '_blank')}
                  >
                    <Apple className="w-6 h-6" />
                    <div className="text-left">
                      <div className="text-xs uppercase font-bold opacity-80 leading-none">Descarregar na</div>
                      <div className="text-lg font-black leading-none">App Store</div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="xl" 
                    variant="outline-primary"
                    className="w-full sm:w-auto rounded-2xl gap-3 bg-white/10 backdrop-blur-md border-white/30 hover:bg-white/20 text-white text-lg font-bold"
                    onClick={() => window.open(androidUrl, '_blank')}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <div className="text-left">
                      <div className="text-xs uppercase font-bold opacity-80 leading-none">Disponível para</div>
                      <div className="text-lg font-black leading-none">Android</div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              <div className="flex flex-wrap gap-8 text-white/80 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Grátis para começar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Resultados garantidos</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">5K+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Utilizadores Ativos</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">4.9★</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Avaliação</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">100%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Angolano</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">24/7</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Suporte</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section com Imagens */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Por Que o METAFIT é Diferente?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Tecnologia premium ao serviço da cultura e tradição angolana.
            </motion.p>
          </div>

          {/* Feature 1: Comida Angolana */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black">Receitas 100% Angolanas</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Funge, peixe grelhado, moamba, calulu... Coma os pratos que ama sem culpa. A nossa IA analisa cada refeição e adapta-a aos seus objetivos de saúde.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Receitas de chefs angolanos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Ingredientes do mercado local</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Análise nutricional instantânea</span>
                </li>
              </ul>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/assets/angolan-healthy-food.jpg" 
                alt="Comida Saudável Angolana" 
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Feature 2: Mercado Local */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <img 
                src="/assets/angolan-market-fresh.jpg" 
                alt="Mercado Angolano Fresco" 
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black">Ingredientes Locais</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Frutas e vegetais frescos do mercado. O METAFIT reconhece o que está disponível perto de ti e sugere refeições saudáveis com o que encontras.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Frutas tropicais ricas em nutrientes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Preços acessíveis e sustentáveis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte à economia local</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 3: Treinos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card className="p-8 bg-card/50 border-border/50 hover:shadow-medium transition-smooth group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">Treinos Personalizados</h4>
              <p className="text-muted-foreground leading-relaxed">
                Planos de exercício desenhados para o teu corpo, objetivo e disponibilidade. Em casa ou no ginásio.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 border-border/50 hover:shadow-medium transition-smooth group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">IA Nutricional</h4>
              <p className="text-muted-foreground leading-relaxed">
                Tira uma foto ao teu prato. A IA analisa instantaneamente calorias, proteínas, carboidratos e gorduras.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 border-border/50 hover:shadow-medium transition-smooth group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">Acompanhamento Real</h4>
              <p className="text-muted-foreground leading-relaxed">
                Vê o teu progresso em tempo real. Gráficos, histórico completo e insights sobre a tua evolução.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Histórias de Sucesso Reais
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Angolanos que transformaram as suas vidas com o METAFIT.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 bg-background/50 border-border/50 h-full hover:shadow-medium transition-smooth">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-primary font-bold">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 -z-10" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-12 md:p-20 border-none bg-gradient-to-br from-card to-card/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full -mr-48 -mt-48" />
              
              <div className="relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  Pronto para Transformar a Tua Vida?
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Junta-te a milhares de angolanos que já estão a alcançar os seus objetivos de saúde com comida que amam.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>100% Seguro e Privado</span>
                  </div>
                  <div className="hidden sm:block text-border">•</div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Grátis para Começar</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="rounded-xl gap-2 text-lg font-bold px-8"
                      onClick={() => window.open(appleStoreUrl, '_blank')}
                    >
                      <Apple className="w-6 h-6" />
                      App Store
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="rounded-xl gap-2 text-lg font-bold px-8"
                      onClick={() => window.open(androidUrl, '_blank')}
                    >
                      <Play className="w-6 h-6 fill-current" />
                      Google Play
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tighter">METAFIT</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Saúde de verdade com comida de verdade.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border/50 pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                © 2026 METAFIT Nutri. Orgulhosamente criado em Angola 🇦🇴
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
