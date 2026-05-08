import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Apple, 
  Play, 
  CheckCircle2, 
  Camera,
  Zap, 
  Dumbbell,
  Utensils,
  TrendingUp,
  BarChart3,
  Brain,
  Users,
  ArrowRight,
  Shield,
  Clock,
  Flame,
  Droplets
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const appleStoreUrl = "https://apps.apple.com/ao/app/metafit-nutri/id6756487211";
  const androidUrl = "https://metafitnutri.vercel.app/";

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Análise de Refeições com IA",
      description: "Tire uma foto ao seu prato e a inteligência artificial analisa instantaneamente calorias, proteínas, carboidratos e gorduras com precisão clínica.",
      benefits: ["Reconhecimento visual 96% preciso", "Análise em tempo real", "Histórico completo de refeições"]
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Treinos Personalizados",
      description: "Planos de exercício desenhados especificamente para o seu corpo, objetivo e nível de fitness. Com animações 3D e guia passo a passo.",
      benefits: ["Adaptação automática ao progresso", "Exercícios com animações 3D", "Rastreamento de séries e repetições"]
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Receitas 100% Angolanas",
      description: "Banco de receitas saudáveis com ingredientes locais. Funge, peixe grelhado, moamba... tudo adaptado aos seus objetivos nutricionais.",
      benefits: ["Receitas de chefs angolanos", "Ingredientes do mercado local", "Sugestões personalizadas por objetivo"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Avançado",
      description: "Visualize seu progresso em tempo real com gráficos inteligentes. Acompanhe calorias, macronutrientes, peso e objetivos em um só lugar.",
      benefits: ["Gráficos em tempo real", "Previsões de progresso", "Alertas inteligentes"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Assistente IA Pessoal",
      description: "Seu coach virtual disponível 24/7. Responde dúvidas sobre nutrição, treino e oferece motivação personalizada baseada no seu progresso.",
      benefits: ["Respostas instantâneas", "Sugestões baseadas em IA", "Disponível sempre que precisa"]
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Acompanhamento de Progresso",
      description: "Histórico completo com insights detalhados. Veja como está evoluindo semana a semana com relatórios profissionais e previsões.",
      benefits: ["Relatórios semanais", "Análise de tendências", "Metas ajustáveis"]
    }
  ];

  const stats = [
    { value: "5K+", label: "Utilizadores Ativos", icon: <Users className="w-6 h-6" /> },
    { value: "4.9★", label: "Avaliação Média", icon: <CheckCircle2 className="w-6 h-6" /> },
    { value: "100%", label: "Angolano", icon: <Smartphone className="w-6 h-6" /> },
    { value: "24/7", label: "Suporte Ativo", icon: <Clock className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        <div className="absolute inset-0 -z-10">
          <img 
            src="/assets/hero-angola-fitness.jpg" 
            alt="Fitness em Angola" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary text-sm font-bold mb-8">
                <Zap className="w-4 h-4" />
                <span>Tecnologia de Elite para a Sua Saúde</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
                Transforme Seu Corpo com <span className="text-primary">Inteligência</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl font-light">
                O METAFIT Nutri combina IA avançada, receitas angolanas autênticas e treinos personalizados. O único app que entende verdadeiramente a realidade de Angola.
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

              <div className="flex flex-wrap gap-6 text-white/80 text-sm font-bold">
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
                  <span>Garantia de resultados</span>
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
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3 text-primary">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Funcionalidades Profissionais
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Cada recurso foi desenhado com precisão para maximizar seus resultados.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-8 bg-card/50 border-border/50 h-full hover:shadow-medium transition-smooth group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockups Section */}
      <section className="py-24 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Interface Intuitiva e Profissional
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Cada detalhe foi cuidadosamente desenhado para uma experiência premium.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <img 
                  src="/assets/mockup-dashboard.png" 
                  alt="Dashboard" 
                  className="w-full max-w-xs rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary/20 blur-3xl w-32 h-32 rounded-full -z-10" />
              </div>
            </motion.div>

            {/* Meal Analysis Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="relative">
                <img 
                  src="/assets/mockup-meal-analysis.png" 
                  alt="Análise de Refeições" 
                  className="w-full max-w-xs rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-primary/20 blur-3xl w-32 h-32 rounded-full -z-10" />
              </div>
            </motion.div>

            {/* Workout Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <img 
                  src="/assets/mockup-workout.png" 
                  alt="Treinos" 
                  className="w-full max-w-xs rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary/20 blur-3xl w-32 h-32 rounded-full -z-10" />
              </div>
            </motion.div>
          </div>

          {/* Feature Descriptions */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Dashboard Inteligente
              </h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe calorias, macronutrientes, água e progresso em tempo real com visualizações profissionais.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                IA de Análise Visual
              </h4>
              <p className="text-sm text-muted-foreground">
                Tire uma foto e receba análise nutricional instantânea com 96% de precisão clínica.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h4 className="font-bold mb-2 flex items-center justify-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Treinos Personalizados
              </h4>
              <p className="text-sm text-muted-foreground">
                Planos adaptativos com animações 3D, rastreamento de progresso e sugestões inteligentes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Tecnologia de Classe Mundial
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-card/50 border-border/50 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Segurança Máxima</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Encriptação end-to-end de todos os dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Conformidade com GDPR e regulações locais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Backup automático e recuperação de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Auditoria de segurança contínua</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-card/50 border-border/50 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">IA Avançada</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Modelos de visão computacional treinados em 100K+ imagens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Algoritmos de machine learning adaptativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Processamento em tempo real com latência &lt;2s</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Personalização contínua baseada no seu histórico</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
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
                  Comece Sua Transformação Hoje
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Junte-se a milhares de angolanos que já estão a alcançar seus objetivos de saúde com a tecnologia mais avançada do mercado.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Shield className="w-5 h-5 text-primary" />
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
                  Tecnologia de elite para sua transformação pessoal.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
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
                © 2026 METAFIT Nutri. Tecnologia Premium Feita em Angola 🇦🇴
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
