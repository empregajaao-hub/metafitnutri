import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminNotifications = () => {
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreve uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    // Simulate sending notification
    setTimeout(() => {
      toast({
        title: "Notificação Enviada",
        description: `A mensagem foi enviada para ${
          targetAudience === "all" ? "todos os utilizadores" :
          targetAudience === "premium" ? "utilizadores premium" :
          "utilizadores grátis"
        }.`,
      });
      setMessage("");
      setSending(false);
    }, 1500);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Enviar Notificações</h2>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="audience">Público-Alvo</Label>
          <Select value={targetAudience} onValueChange={setTargetAudience}>
            <SelectTrigger id="audience">
              <SelectValue placeholder="Selecionar público" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Utilizadores</SelectItem>
              <SelectItem value="premium">Apenas Utilizadores Premium</SelectItem>
              <SelectItem value="free">Apenas Utilizadores Grátis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            placeholder="Escreve a tua mensagem aqui..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {message.length} caracteres
          </p>
        </div>

        <Button
          onClick={handleSendNotification}
          disabled={sending || !message.trim()}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {sending ? "A Enviar..." : "Enviar Notificação"}
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Mensagens Sugeridas</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => setMessage("🎉 Novidade! Acabamos de adicionar novas receitas angolanas ao AngoNutri. Experimenta agora!")}
          >
            Anunciar novas funcionalidades
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => setMessage("💪 Não te esqueças de registar as tuas refeições hoje para manter o teu progresso!")}
          >
            Lembrete de uso da app
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => setMessage("🎁 Promoção especial! Subscreve o plano anual com 20% de desconto esta semana.")}
          >
            Promoção especial
          </Button>
        </div>
      </div>
    </Card>
  );
};
