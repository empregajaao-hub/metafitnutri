import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, Zap, Gift, MessageSquare, Info } from "lucide-react";

interface Template {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  label: string;
}

const templates: Template[] = [
  {
    id: "feature",
    title: "Nova Funcionalidade",
    message: "Novidade! Acabamos de adicionar novas receitas angolanas ao METAFIT. Experimenta agora!",
    icon: <Zap className="w-4 h-4" />,
    label: "Anunciar Novidade",
  },
  {
    id: "reminder",
    title: "Lembrete Diário",
    message: "Não te esqueças de registar as tuas refeições hoje para manter o teu progresso!",
    icon: <Bell className="w-4 h-4" />,
    label: "Lembrete de Uso",
  },
  {
    id: "promo",
    title: "Promoção Especial",
    message: "Promoção especial! Subscreve o plano anual com 20% de desconto esta semana.",
    icon: <Gift className="w-4 h-4" />,
    label: "Promoção Especial",
  },
  {
    id: "support",
    title: "Suporte Personalizado",
    message: "Olá! Notei que ainda não completaste a tua anamnese. Posso ajudar-te com alguma dúvida?",
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Apoio ao Utilizador",
  },
];

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Por favor, preenche o título e a mensagem.");
      return;
    }

    setSending(true);
    setTimeout(() => {
      alert(`Notificação enviada para ${audience}!`);
      setTitle("");
      setMessage("");
      setAudience("all");
      setSending(false);
    }, 1000);
  };

  const handleUseTemplate = (template: Template) => {
    setTitle(template.title);
    setMessage(template.message);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Notificações</h1>
        <p className="text-muted-foreground">Enviar mensagens aos utilizadores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2 p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Enviar Notificação Push</h2>
              <p className="text-sm text-muted-foreground">
                As notificações serão enviadas para os dispositivos móveis.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Title and Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Notificação</Label>
                <Input
                  id="title"
                  placeholder="Ex: Nova Receita Disponível!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Público-Alvo</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="audience" className="bg-background/50">
                    <SelectValue placeholder="Selecionar público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Utilizadores</SelectItem>
                    <SelectItem value="premium">Utilizadores Premium</SelectItem>
                    <SelectItem value="free">Apenas Utilizadores Grátis</SelectItem>
                    <SelectItem value="essential">Plano Individual</SelectItem>
                    <SelectItem value="evolution">Plano Familiar</SelectItem>
                    <SelectItem value="personal_trainer">Plano Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreve a mensagem da notificação..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-background/50 min-h-32 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {message.length} / 160 caracteres
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendNotification}
              disabled={sending}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? "A enviar..." : "Enviar Notificação"}
            </Button>
          </div>
        </Card>

        {/* Templates Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Templates Rápidos</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Clica num template para preencher automaticamente a notificação.
            </p>
            <div className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3 px-3"
                  onClick={() => handleUseTemplate(template)}
                >
                  <span className="text-primary">{template.icon}</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">{template.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {template.message}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </Card>

          {/* Tips Card */}
          <Card className="p-6 border border-border/50 bg-primary/5">
            <h3 className="font-bold text-foreground mb-3">Dicas</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>✓ Usa títulos curtos e diretos</li>
              <li>✓ Máximo 160 caracteres na mensagem</li>
              <li>✓ Inclui emojis para mais impacto</li>
              <li>✓ Evita spam - uma notificação por dia</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Recent Notifications */}
      <Card className="p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4">Notificações Recentes</h2>
        <div className="space-y-3">
          {[
            {
              title: "Bem-vindo ao METAFIT",
              audience: "Todos os Utilizadores",
              time: "Há 2 horas",
              sent: 1234,
            },
            {
              title: "Nova Receita: Frango Grelhado",
              audience: "Utilizadores Premium",
              time: "Há 5 horas",
              sent: 456,
            },
            {
              title: "Desconto de 20% em Subscrições",
              audience: "Utilizadores Grátis",
              time: "Há 1 dia",
              sent: 789,
            },
          ].map((notif, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                <p className="text-xs text-muted-foreground">
                  {notif.audience} • {notif.time}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary">{notif.sent} enviadas</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
