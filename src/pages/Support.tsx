import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Clock, Phone, Shield, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Camera, Smartphone, User, Lock, Trash2, ArrowLeft, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Support = () => {
  const navigate = useNavigate();
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
    window.open("https://wa.me/244921346544?text=Olá! Preciso de ajuda com o METAFIT Nutri.", "_blank");
  };

  const faqs = [
    {
      question: "O que é o METAFIT Nutri?",
      answer: "O METAFIT Nutri é uma aplicação gratuita de análise nutricional que usa inteligência artificial para analisar as tuas refeições através de fotos. Basta tirares uma foto do teu prato e a app calcula automaticamente as calorias, proteínas, carboidratos e gorduras. A app é 100% gratuita, sem compras dentro da app ou subscrições."
    },
    {
      question: "A app é realmente gratuita?",
      answer: "Sim! O METAFIT Nutri é completamente gratuito. Não existem planos pagos, subscrições mensais, ou compras dentro da aplicação. Todas as funcionalidades incluindo análises ilimitadas de refeições, planos alimentares personalizados e guias de treino estão disponíveis para todos os utilizadores sem qualquer custo."
    },
    {
      question: "Porque é que a app precisa de acesso à câmara?",
      answer: "A câmara é usada exclusivamente para te permitir fotografar as tuas refeições para análise nutricional e capturar fotos de progresso do teu corpo. Também podes usar a câmara para tirar fotos que queiras partilhar com um nutricionista dentro da app. Nunca acedemos à câmara sem a tua permissão explícita e apenas quando tu escolhes tirar uma foto."
    },
    {
      question: "Porque é que a app precisa de acesso às fotos/galeria?",
      answer: "Precisamos de acesso à tua galeria para que possas selecionar fotos de refeições já tiradas anteriormente para análise nutricional. Também podes guardar os resultados das análises e fotos de progresso no teu dispositivo. Apenas acedemos às fotos que tu escolhes explicitamente partilhar - nunca acedemos a toda a tua galeria automaticamente."
    },
    {
      question: "Como funciona a análise de fotos com IA?",
      answer: "É simples: tira uma foto da tua refeição usando a câmara do telemóvel. A nossa inteligência artificial analisa os alimentos presentes no prato e calcula automaticamente os valores nutricionais, incluindo calorias, proteínas, carboidratos e gorduras. A análise é processada de forma segura e as tuas fotos são protegidas com encriptação."
    },
    {
      question: "Os planos alimentares são personalizados?",
      answer: "Sim! Os planos alimentares são adaptados ao teu objetivo pessoal (perder peso, manter ou ganhar massa muscular), às tuas preferências alimentares, e utilizam ingredientes locais para facilitar a preparação das refeições."
    },
    {
      question: "Preciso de internet para usar a app?",
      answer: "Precisas de ligação à internet para analisar fotos e gerar receitas, pois a análise é feita através da nossa IA nos servidores. No entanto, podes consultar o teu histórico de análises e planos alimentares guardados mesmo sem internet."
    },
    {
      question: "A app está disponível para iPhone e Android?",
      answer: "Sim! O METAFIT Nutri está disponível para dispositivos iOS (iPhone/iPad) e Android. Podes descarregar gratuitamente na App Store ou Google Play Store."
    },
    {
      question: "Os meus dados estão seguros?",
      answer: "Absolutamente! A tua privacidade é a nossa prioridade máxima. Todos os dados são encriptados usando protocolos de segurança padrão da indústria e armazenados de forma segura. Nunca vendemos, partilhamos ou divulgamos as tuas informações pessoais a terceiros para fins de marketing ou publicidade. As fotos das refeições são processadas de forma segura."
    },
    {
      question: "Como elimino a minha conta e dados?",
      answer: "Tens controlo total sobre os teus dados. Para eliminar a tua conta, vai a Perfil → Definições → Apagar Conta. Todos os teus dados serão permanentemente eliminados dos nossos servidores, incluindo análises de refeições, fotos de progresso e informações pessoais. Esta ação não pode ser revertida."
    },
    {
      question: "Posso usar a app sem criar conta?",
      answer: "Sim! Podes usar a funcionalidade de análise de refeições do METAFIT Nutri sem criar uma conta. No entanto, para guardar o teu histórico de análises, criar planos alimentares personalizados e acompanhar o teu progresso ao longo do tempo, recomendamos criar uma conta gratuita."
    },
    {
      question: "Como contacto o suporte?",
      answer: "Podes contactar a nossa equipa de suporte por email em repairlubatec@gmail.com ou via WhatsApp (+244 921 346 544). Normalmente respondemos dentro de 24 horas em dias úteis. Também podes usar o formulário de contacto nesta página."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Smartphone className="h-10 w-10 text-emerald-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                METAFIT Nutri
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">
              Centro de Suporte
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A tua aplicação gratuita de nutrição inteligente com IA. Analisa refeições com uma foto, acompanha os teus macros e alcança os teus objetivos de saúde.
            </p>
          </div>

          {/* App Description */}
          <Card className="p-6 mb-8 bg-emerald-50 border-emerald-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Sobre o METAFIT Nutri</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              O METAFIT Nutri é uma aplicação móvel completamente gratuita que usa inteligência artificial avançada para te ajudar a acompanhar a tua nutrição sem esforço. 
              Basta tirares uma foto da tua refeição, e a nossa IA identifica instantaneamente os alimentos e calcula calorias, proteínas, carboidratos e gorduras.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Análise com IA</p>
                  <p className="text-xs text-gray-500">Valores nutricionais instantâneos a partir de fotos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Planos Personalizados</p>
                  <p className="text-xs text-gray-500">Planos alimentares adaptados aos teus objetivos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">100% Gratuito</p>
                  <p className="text-xs text-gray-500">Sem subscrições ou custos ocultos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Privacidade em Primeiro</p>
                  <p className="text-xs text-gray-500">Os teus dados estão encriptados e seguros</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* WhatsApp */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-emerald-300 cursor-pointer" onClick={openWhatsApp}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Resposta rápida via mensagem
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Phone className="w-4 h-4 mr-2" />
                  +244 921 346 544
                </Button>
              </div>
            </Card>

            {/* Email */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-emerald-300 cursor-pointer" onClick={() => window.location.href = "mailto:repairlubatec@gmail.com"}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Email
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Para questões detalhadas
                </p>
                <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <Mail className="w-4 h-4 mr-2" />
                  repairlubatec@gmail.com
                </Button>
              </div>
            </Card>

            {/* Response Time */}
            <Card className="p-6 border-2">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tempo de Resposta
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">WhatsApp: até 2 horas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Email: até 24 horas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Seg-Sex: 08:00-20:00</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* How We Can Help */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Como Podemos Ajudar</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border">
                <User className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Conta e Perfil</h3>
                  <p className="text-sm text-gray-500">Login, registo, recuperação de conta, atualização de dados pessoais</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border">
                <Camera className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Câmara e Fotos</h3>
                  <p className="text-sm text-gray-500">Permissões, upload de imagens, análise de refeições, fotos de progresso</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Privacidade e Segurança</h3>
                  <p className="text-sm text-gray-500">Proteção de dados, eliminação de conta, RGPD, encriptação</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border">
                <Smartphone className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Problemas Técnicos</h3>
                  <p className="text-sm text-gray-500">Erros, bugs, desempenho da aplicação, compatibilidade</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <HelpCircle className="inline h-6 w-6 mr-2" />
                Perguntas Frequentes
              </h2>
              <p className="text-gray-500">
                Encontra respostas às dúvidas mais comuns sobre o METAFIT Nutri
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:border-emerald-300 transition-colors overflow-hidden"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h4>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === index && (
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <Send className="inline h-5 w-5 mr-2" />
                Enviar Mensagem
              </h3>
              <p className="text-gray-500">
                Não encontraste a resposta? Envia-nos uma mensagem diretamente.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
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
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
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

          {/* Data Safety Section */}
          <Card className="p-6 mb-8 border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacidade e Segurança dos Dados</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  O METAFIT Nutri está comprometido em proteger a tua privacidade e dados pessoais. Aqui está o que deves saber:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Todos os dados pessoais são encriptados usando protocolos padrão da indústria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Nunca vendemos ou partilhamos as tuas informações com terceiros para publicidade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>As fotos de refeições são processadas de forma segura e tu controlas se as guardas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Podes eliminar a tua conta e todos os dados a qualquer momento nas definições</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>O acesso à câmara e fotos é usado apenas quando escolhes explicitamente tirar ou selecionar fotos</span>
                  </li>
                </ul>
                <Link 
                  to="/privacy" 
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors mt-4 text-sm"
                >
                  <span className="underline">Ler Política de Privacidade completa</span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Account Deletion Info */}
          <Card className="p-6 mb-8 border-2 border-red-100 bg-red-50">
            <div className="flex items-start gap-4">
              <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Conta</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tens controlo total sobre os teus dados. Para eliminar permanentemente a tua conta e todos os dados associados:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>Abre a app METAFIT Nutri</li>
                  <li>Vai a Perfil → Definições</li>
                  <li>Clica em "Apagar Conta"</li>
                  <li>Confirma a eliminação</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2">
                  Esta ação é irreversível e elimina todos os teus dados incluindo histórico de análises e fotos.
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy Link */}
          <div className="text-center mb-8">
            <Link 
              to="/privacy" 
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="underline">Política de Privacidade</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-8">
            <p className="font-medium text-gray-700 mb-1">METAFIT Nutri</p>
            <p>Aplicação 100% gratuita de nutrição inteligente</p>
            <p className="mt-2">© {new Date().getFullYear()} METAFIT. Todos os direitos reservados.</p>
            <p className="mt-4">
              <Link to="/support-en" className="text-emerald-600 hover:underline">
                English Support Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;