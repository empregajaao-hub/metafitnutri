import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Apple, 
  Play, 
  CheckCircle2, 
  Camera,
  TrendingDown,
  Scale,
  TrendingUp,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Flame,
  Target,
  Award,
  Heart,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const appleStoreUrl = "https://apps.apple.com/ao/app/metafit-nutri/id6756487211";
  const androidUrl = "https://metafitnutri.vercel.app/";

  const objectives = [
    {
      icon: <TrendingDown className="w-12 h-12" />,
      title: "Perder Peso",
      subtitle: "Emagreça com Saúde",
      description: "Planos personalizados com receitas angolanas que ajudam a atingir o déficit calórico ideal.",
      color: "from-emerald-500/10 to-emerald-600/10",
      borderColor: "border-emerald-500/20",
      badge: "PERDER PESO",
      badgeColor: "bg-emerald-500/15 text-emerald-700"
    },
    {
      icon: <Scale className="w-12 h-12" />,
      title: "Manter a Forma",
      subtitle: "Equilíbrio Perfeito",
      description: "Mantenha seu peso ideal com planos de manutenção e acompanhamento contínuo.",
      color: "from-blue-500/10 to-blue-600/10",
      borderColor: "border-blue-500/20",
      badge: "MANTER FORMA",
      badgeColor: "bg-blue-500/15 text-blue-700"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Ganhar Massa",
      subtitle: "Músculos Definidos",
      description: "Ganhe massa muscular com treinos intensos e nutrição otimizada para crescimento.",
      color: "from-orange-500/10 to-orange-600/10",
      borderColor: "border-orange-500/20",
      badge: "GANHAR MASSA",
      badgeColor: "bg-orange-500/15 text-orange-700"
    }
  ];

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Tire uma Foto",
      description: "Fotografe sua refeição"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Análise Precisa",
      description: "Análise em segundos"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Saiba o Impacto",
      description: "E o que fazer"
    }
  ];

  const benefits = [
    {
      icon: <Flame className="w-6 h-6" />,
      title: "METAS DE CALORIAS",
      description: "Planos personalizados para o seu objetivo."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "COMA MELHOR",
      description: "Sabe o que comer e evitar para ter resultados."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "ACOMPANHE SEU PROGRESSO",
      description: "Relatórios simples para ver sua evolução."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "ALCANCE SEUS OBJETIVOS",
      description: "Perca peso ou ganhe massa com saúde."
    }
  ];

  const testimonials = [
    {
      name: "Joana Silva",
      weight: "-12kg",
      objective: "Perder Peso",
      text: "Perdi 12kg em 3 meses sem sofrer. As receitas angolanas fazem toda a diferença!"
    },
    {
      name: "Carlos Mendes",
      weight: "+8kg",
      objective: "Ganhar Massa",
      text: "Ganhei 8kg de músculo. O app é perfeito para quem quer crescer de forma inteligente."
    },
    {
      name: "Rita Costa",
      weight: "Estável",
      objective: "Manter Forma",
      text: "Mantenho meu peso ideal há 6 meses. Finalmente encontrei o equilíbrio!"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20 bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Left Side - Text */}
              <div>
                {/* Logo e Tagline */}
                <div className="mb-12">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>100% Angolano • Feito para Si</span>
                  </div>
                </div>
                
                {/* Headline Principal */}
                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-black leading-tight">
                  ESSA COMIDA <br />
                  <span className="text-primary">ENGORDA OU</span><br />
                  <span className="text-primary">EMAGRECE?</span>
                </h1>
                
                {/* Subheadline */}
                <p className="text-xl text-gray-700 mb-4 font-bold">
                  Descubra em Segundos
                </p>
                <p className="text-lg text-gray-600 mb-12 leading-relaxed font-light">
                  Tire uma foto ao seu prato e receba análise instantânea. Sabe exatamente se vai ajudar a perder peso, manter a forma ou ganhar massa muscular.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto rounded-xl gap-3 shadow-lg text-base font-bold group bg-primary hover:bg-primary/90 px-8 py-6"
                      onClick={() => window.open(appleStoreUrl, '_blank')}
                    >
                      <Apple className="w-6 h-6" />
                      <div className="text-left">
                        <div className="text-xs uppercase font-bold opacity-90 leading-none">Descarregar na</div>
                        <div className="text-lg font-black leading-none">App Store</div>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto rounded-xl gap-3 shadow-lg text-base font-bold bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 text-gray-900 px-8 py-6"
                      onClick={() => window.open(androidUrl, '_blank')}
                    >
                      <Play className="w-6 h-6 fill-current" />
                      <div className="text-left">
                        <div className="text-xs uppercase font-bold opacity-90 leading-none">Disponível no</div>
                        <div className="text-lg font-black leading-none">Google Play</div>
                      </div>
                    </Button>
                  </motion.div>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-6 text-gray-700 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Grátis para começar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Sem cartão de crédito</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <img 
                    src="/assets/mockup-conversion-hero.png" 
                    alt="Análise de Refeições" 
                    className="w-full max-w-sm rounded-3xl shadow-2xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 Objetivos Principais */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4 text-black"
            >
              Qual é o Seu Objetivo?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              O METAFIT Nutri adapta-se ao seu objetivo pessoal com planos únicos.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {objectives.map((obj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-8 bg-gradient-to-br ${obj.color} border-2 ${obj.borderColor} h-full hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white`}>
                  <div className={`w-16 h-16 rounded-2xl ${obj.badgeColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary`}>
                    {obj.icon}
                  </div>
                  
                  <div className={`inline-block px-3 py-1 rounded-full ${obj.badgeColor} text-xs font-black mb-4`}>
                    {obj.badge}
                  </div>
                  
                  <h3 className="text-2xl font-black mb-2 text-black">{obj.title}</h3>
                  <p className="text-primary font-bold mb-4">{obj.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {obj.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4 text-black"
            >
              Como Funciona?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              Três passos simples para transformar sua saúde.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-black mb-2 text-black">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios Principais */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4 text-black"
            >
              Por Que Escolher o METAFIT?
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 bg-white border-2 border-gray-200 h-full hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black mb-2 text-black">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social - Testimoniais */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4 text-black"
            >
              Histórias de Transformação Real
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              Angolanos que já transformaram suas vidas.
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
                <Card className="p-8 bg-white border-2 border-gray-200 h-full hover:shadow-lg transition-all duration-300">
                  <div className="mb-6">
                    <div className="text-5xl font-black text-primary mb-2">{testimonial.weight}</div>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                      {testimonial.objective}
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="font-bold text-sm text-black">{testimonial.name}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">5K+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-gray-600">Utilizadores Ativos</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">4.9★</div>
              <div className="text-sm font-bold uppercase tracking-widest text-gray-600">Avaliação</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">100%</div>
              <div className="text-sm font-bold uppercase tracking-widest text-gray-600">Angolano</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">24/7</div>
              <div className="text-sm font-bold uppercase tracking-widest text-gray-600">Suporte</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="p-12 md:p-24 border-none bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg relative overflow-hidden">
              <div className="relative z-10 text-center">
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight text-black">
                  BAIXE AGORA E TRANSFORME <br />
                  <span className="text-primary">SUA SAÚDE TODOS OS DIAS!</span>
                </h2>
                <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Grátis para começar. Sem cartão de crédito. Resultados garantidos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="rounded-xl gap-3 text-lg font-black px-10 py-8"
                      onClick={() => window.open(appleStoreUrl, '_blank')}
                    >
                      <Apple className="w-7 h-7" />
                      App Store
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="rounded-xl gap-3 text-lg font-black px-10 py-8 border-2 border-gray-300"
                      onClick={() => window.open(androidUrl, '_blank')}
                    >
                      <Play className="w-7 h-7 fill-current" />
                      Google Play
                    </Button>
                  </motion.div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Grátis para Começar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>5K+ Utilizadores</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                © 2026 METAFIT Nutri. Orgulhosamente criado em Angola 🇦🇴
              </p>
              <p className="text-xs text-gray-500">
                100% ANGOLANO • FEITO PARA SI
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
