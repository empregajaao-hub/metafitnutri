import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send } from "lucide-react";
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

      const { error } = await supabase
        .from("notifications")
        .insert({
          title: title.trim(),
          message: message.trim(),
          target_audience: resolvedTargetAudience,
          sent_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Notificação Enviada",
        description: `A mensagem foi enviada para ${
          targetAudience === "all" ? "todos os utilizadores" :
          targetAudience === "premium" ? "utilizadores premium" :
          targetAudience === "free" ? "utilizadores grátis" :
          targetAudience === "monthly" ? "utilizadores mensais" :
          targetAudience === "annual" ? "utilizadores anuais" :
          selectedUser?.fullName || "utilizador"
        }.`,
      });
      
      setTitle("");
      setMessage("");
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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Enviar Notificações</h2>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Título da notificação"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="audience">Público-Alvo</Label>
          <Select value={targetAudience} onValueChange={setTargetAudience}>
            <SelectTrigger id="audience">
              <SelectValue placeholder="Selecionar público" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Utilizadores</SelectItem>
              <SelectItem value="premium">Utilizadores Premium (Mensal + Anual)</SelectItem>
              <SelectItem value="free">Apenas Utilizadores Grátis</SelectItem>
              <SelectItem value="monthly">Apenas Utilizadores Mensais</SelectItem>
              <SelectItem value="annual">Apenas Utilizadores Anuais</SelectItem>
              <SelectItem value="individual">Utilizador específico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {targetAudience === "individual" && (
          <div className="space-y-2">
            <Label htmlFor="user">Utilizador</Label>
            <Input
              id="user"
              placeholder="Pesquisar por nome ou telefone (mín. 2 letras)"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setSelectedUser(null);
              }}
            />

            {selectedUser ? (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">{selectedUser.fullName}</p>
                {selectedUser.phone && (
                  <p className="text-muted-foreground">{selectedUser.phone}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedUser(null)}
                >
                  Trocar utilizador
                </Button>
              </div>
            ) : (
              userResults.length > 0 && (
                <div className="rounded-md border border-border overflow-hidden">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-smooth"
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
          disabled={sending || !message.trim() || !title.trim() || (targetAudience === "individual" && !selectedUser)}
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
            onClick={() => {
              setTitle("Nova Funcionalidade");
              setMessage("🎉 Novidade! Acabamos de adicionar novas receitas angolanas ao METAFIT. Experimenta agora!");
            }}
          >
            Anunciar novas funcionalidades
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => {
              setTitle("Lembrete Diário");
              setMessage("💪 Não te esqueças de registar as tuas refeições hoje para manter o teu progresso!");
            }}
          >
            Lembrete de uso da app
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => {
              setTitle("Promoção Especial");
              setMessage("🎁 Promoção especial! Subscreve o plano anual com 20% de desconto esta semana.");
            }}
          >
            Promoção especial
          </Button>
        </div>
      </div>
    </Card>
  );
};
