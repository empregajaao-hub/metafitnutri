import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Link as LinkIcon, Info, MessageSquare, Zap, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserPick = {
  id: string;
  fullName: string;
  phone: string;
};

export const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/");
  const [targetAudience, setTargetAudience] = useState("all");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserPick[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserPick | null>(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (targetAudience !== "individual") {
      setUserQuery("");
      setUserResults([]);
      setSelectedUser(null);
    }
  }, [targetAudience]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (targetAudience !== "individual") return;
      const q = userQuery.trim();
      if (q.length < 2) {
        setUserResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", phone')
        .or(`"Nome Completo".ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(8);

      if (cancelled) return;

      if (error) {
        setUserResults([]);
        return;
      }

      const mapped: UserPick[] =
        data?.map((p: any) => ({
          id: p.id,
          fullName: p["Nome Completo"] || "N/A",
          phone: p.phone || "",
        })) || [];
      setUserResults(mapped);
    };

    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [targetAudience, userQuery]);

  const resolvedTargetAudience = useMemo(() => {
    if (targetAudience !== "individual") return targetAudience;
    return selectedUser ? `user:${selectedUser.id}` : "";
  }, [targetAudience, selectedUser]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preenche o título e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (targetAudience === "individual" && !selectedUser) {
      toast({
        title: "Erro",
        description: "Escolhe um utilizador para enviar a notificação.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilizador não autenticado");
      }

      // 1. Save to database for in-app display
      const { error } = await supabase
        .from("notifications")
        .insert({
          title: title.trim(),
          message: message.trim(),
          target_audience: resolvedTargetAudience,
          sent_by: user.id,
        });

      if (error) throw error;

      // 2. Send real push notifications to devices (FCM/APNs via Edge Function)
      const { data: pushResult, error: pushError } = await supabase.functions.invoke("send-admin-push", {
        body: {
          title: title.trim(),
          message: message.trim(),
          target_audience: resolvedTargetAudience,
          url: url.trim() || "/",
        },
      });

      const pushInfo = pushResult
        ? ` (${pushResult.sent || 0} push enviados)`
        : pushError
        ? " (push falhou)"
        : "";

      toast({
        title: "Notificação Enviada ✅",
        description: `Mensagem enviada para ${
          targetAudience === "all" ? "todos os utilizadores" :
          targetAudience === "premium" ? "utilizadores premium" :
          targetAudience === "free" ? "utilizadores grátis" :
          targetAudience === "essential" ? "Plano Individual" :
          targetAudience === "evolution" ? "Plano Familiar" :
          targetAudience === "personal_trainer" ? "Plano Profissional" :
          selectedUser?.fullName || "utilizador"
        }${pushInfo}.`,
      });
      
      setTitle("");
      setMessage("");
      setUrl("/");
      setUserQuery("");
      setUserResults([]);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const templates = [
    {
      id: "feature",
      title: "Nova Funcionalidade",
      message: "🎉 Novidade! Acabamos de adicionar novas receitas angolanas ao METAFIT. Experimenta agora!",
      url: "/",
      icon: <Zap className="w-4 h-4" />,
      label: "Anunciar Novidade"
    },
    {
      id: "reminder",
      title: "Lembrete Diário",
      message: "💪 Não te esqueças de registar as tuas refeições hoje para manter o teu progresso!",
      url: "/meals",
      icon: <Bell className="w-4 h-4" />,
      label: "Lembrete de Uso"
    },
    {
      id: "promo",
      title: "Promoção Especial",
      message: "🎁 Promoção especial! Subscreve o plano anual com 20% de desconto esta semana.",
      url: "/subscription",
      icon: <Gift className="w-4 h-4" />,
      label: "Promoção Especial"
    },
    {
      id: "support",
      title: "Suporte Personalizado",
      message: "Olá! Notei que ainda não completaste a tua anamnese. Posso ajudar-te com alguma dúvida?",
      url: "/anamnesis",
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Apoio ao Utilizador"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Enviar Notificação Push</h2>
            <p className="text-sm text-muted-foreground">As notificações serão enviadas para os dispositivos móveis.</p>
          </div>
        </div>

        <div className="space-y-5">
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
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger id="audience" className="bg-background/50">
                  <SelectValue placeholder="Selecionar público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Utilizadores</SelectItem>
                  <SelectItem value="premium">Utilizadores Premium (Pagos)</SelectItem>
                  <SelectItem value="free">Apenas Utilizadores Grátis</SelectItem>
                  <SelectItem value="essential">Plano Individual</SelectItem>
                  <SelectItem value="evolution">Plano Familiar</SelectItem>
                  <SelectItem value="personal_trainer">Plano Profissional</SelectItem>
                  <SelectItem value="individual">Utilizador específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {targetAudience === "individual" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="user">Pesquisar Utilizador</Label>
              <Input
                id="user"
                placeholder="Nome ou telefone (mín. 2 letras)"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setSelectedUser(null);
                }}
                className="bg-background/50"
              />

              {selectedUser ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{selectedUser.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.phone || "Sem telefone"}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="text-primary hover:text-primary/80"
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                userResults.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden bg-background shadow-sm">
                    {userResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b border-border last:border-0"
                        onClick={() => setSelectedUser(u)}
                      >
                        <div className="text-sm font-medium text-foreground">{u.fullName}</div>
                        {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> URL de Destino (opcional)
            </Label>
            <Input
              id="url"
              placeholder="Ex: /subscription ou /meals"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background/50"
            />
            <p className="text-[10px] text-muted-foreground">
              O utilizador será redirecionado para este caminho ao clicar na notificação.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Escreve a tua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none bg-background/50"
            />
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground">
                Dica: Mensagens curtas e diretas têm maior taxa de clique.
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {message.length} caracteres
              </p>
            </div>
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={sending || !message.trim() || !title.trim() || (targetAudience === "individual" && !selectedUser)}
            className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                A Enviar...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Notificação Agora
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Modelos Rápidos
          </h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                onClick={() => {
                  setTitle(template.title);
                  setMessage(template.message);
                  setUrl(template.url);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {template.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{template.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{template.title}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-primary/5 border-primary/10">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Dicas de Admin</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              As notificações push funcionam mesmo com a app fechada.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Evite enviar mais de 2 notificações por dia para não incomodar.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Use emojis para tornar a mensagem mais amigável.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              O campo URL permite levar o utilizador direto para uma oferta.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
