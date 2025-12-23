import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Clock, Phone, Shield, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Por favor, preenche todos os campos");
      return;
    }

    setIsSubmitting(true);
    
    // Open email with pre-filled content
    const subject = encodeURIComponent(`Suporte METAFIT - ${name}`);
    const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`);
    window.location.href = `mailto:repairlubatec@gmail.com?subject=${subject}&body=${body}`;
    
    toast.success("A abrir o email... Se não abriu, contacta-nos pelo WhatsApp.");
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/244921346544?text=Olá! Preciso de ajuda com o METAFIT.", "_blank");
  };

  const faqs = [
    {
      question: "O que é o METAFIT?",
      answer: "O METAFIT é uma aplicação gratuita de análise nutricional que usa inteligência artificial para analisar as tuas refeições através de fotos. Basta tirares uma foto do teu prato e a app calcula automaticamente as calorias, proteínas, carboidratos e gorduras."
    },
    {
      question: "O METAFIT é gratuito?",
      answer: "Sim! O METAFIT é 100% gratuito. Podes fazer análises ilimitadas de refeições, gerar planos alimentares personalizados e aceder a todas as funcionalidades sem qualquer custo."
    },
    {
      question: "Como funciona a análise de fotos?",
      answer: "É simples: tira uma foto da tua refeição usando a câmara do telemóvel. A nossa inteligência artificial analisa os alimentos presentes no prato e calcula automaticamente os valores nutricionais, incluindo calorias, proteínas, carboidratos e gorduras."
    },
    {
      question: "Os planos alimentares são personalizados?",
      answer: "Sim! Os planos alimentares são adaptados ao teu objetivo pessoal (perder peso, manter ou ganhar massa muscular) e utilizam ingredientes locais angolanos para facilitar a preparação das refeições."
    },
    {
      question: "Preciso de internet para usar a app?",
      answer: "Precisas de ligação à internet para analisar fotos e gerar receitas. No entanto, podes consultar o teu histórico de análises e planos alimentares guardados mesmo sem internet."
    },
    {
      question: "A app está disponível para iPhone e Android?",
      answer: "Sim! O METAFIT está disponível para dispositivos iOS (iPhone/iPad) e Android. Podes descarregar gratuitamente na App Store ou Google Play Store."
    },
    {
      question: "Os meus dados estão seguros?",
      answer: "Absolutamente! A tua privacidade é a nossa prioridade. Todos os dados são encriptados e armazenados de forma segura. Nunca partilhamos as tuas informações pessoais com terceiros. Consulta a nossa Política de Privacidade para mais detalhes."
    },
    {
      question: "Como elimino a minha conta?",
      answer: "Para eliminar a tua conta, vai a Perfil → Definições → Apagar Conta. Todos os teus dados serão permanentemente eliminados e esta ação não pode ser revertida."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Centro de Suporte METAFIT
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para te ajudar! Escolhe a forma de contacto preferida ou consulta as perguntas frequentes abaixo.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* WhatsApp */}
            <Card className="p-6 hover:shadow-medium transition-smooth border-2 hover:border-primary/30 cursor-pointer" onClick={openWhatsApp}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Resposta rápida via mensagem
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <Phone className="w-4 h-4 mr-2" />
                  +244 921 346 544
                </Button>
              </div>
            </Card>

            {/* Email */}
            <Card className="p-6 hover:shadow-medium transition-smooth border-2 hover:border-primary/30 cursor-pointer" onClick={() => window.location.href = "mailto:repairlubatec@gmail.com"}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Email
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Para questões detalhadas
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  repairlubatec@gmail.com
                </Button>
              </div>
            </Card>

            {/* Response Time */}
            <Card className="p-6 border-2">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tempo de Resposta
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">WhatsApp: até 2 horas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Email: até 24 horas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Seg-Sex: 08:00-20:00</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                <HelpCircle className="inline h-6 w-6 mr-2" />
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground">
                Encontra respostas às dúvidas mais comuns
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:border-primary/30 transition-colors overflow-hidden"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground pr-4">
                        {faq.question}
                      </h4>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === index && (
                      <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <Send className="inline h-5 w-5 mr-2" />
                Enviar Mensagem
              </h3>
              <p className="text-muted-foreground">
                Não encontraste a resposta? Envia-nos uma mensagem directamente.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nome *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="O teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Mensagem *
                </label>
                <Textarea
                  id="message"
                  placeholder="Descreve a tua dúvida ou problema em detalhe..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    A processar...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Privacy Link */}
          <div className="text-center">
            <Link 
              to="/privacy" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="underline">Política de Privacidade</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>METAFIT - A tua aplicação de nutrição inteligente 🇦🇴</p>
            <p className="mt-1">Desenvolvido com ❤️ para Angola</p>
          </div>
        </div>
      </div>
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default Support;