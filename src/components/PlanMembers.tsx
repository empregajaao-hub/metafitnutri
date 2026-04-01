import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users, UserPlus, Trash2, Copy, CheckCircle2,
  Mail, Phone, Link2, Share2, AlertCircle, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlanMember {
  id: string;
  owner_id: string;
  member_id: string | null;
  member_email: string | null;
  member_phone: string | null;
  status: string;
  invite_token: string;
  created_at: string;
}

const PlanMembers = () => {
  const [members, setMembers] = useState<PlanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteType, setInviteType] = useState<"email" | "phone">("email");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const { toast } = useToast();

  // Determine max members based on plan
  const getMaxMembers = () => {
    if (currentPlan === "personal_trainer") return 9;
    if (currentPlan === "evolution") return 2;
    return 0;
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check current plan
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();
      
      setCurrentPlan(sub?.plan || "free");

      // Load members where user is owner
      const { data } = await supabase
        .from("plan_members")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      setMembers((data as PlanMember[]) || []);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteInput.trim()) return;
    if (members.length >= getMaxMembers()) {
      toast({
        title: "Limite atingido",
        description: `O teu plano permite no máximo ${getMaxMembers() + 1} pessoas (tu + ${getMaxMembers()}).`,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const insertData: any = {
        owner_id: user.id,
        status: "pending",
      };

      if (inviteType === "email") {
        insertData.member_email = inviteInput.trim().toLowerCase();
      } else {
        insertData.member_phone = inviteInput.trim();
      }

      const { data, error } = await supabase
        .from("plan_members")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data as PlanMember]);
      setInviteInput("");
      toast({
        title: "Convite criado! 🎉",
        description: "Partilha o link de convite com a pessoa.",
      });
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

  const handleRemoveMember = async (id: string) => {
    const { error } = await supabase
      .from("plan_members")
      .delete()
      .eq("id", id);

    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id));
      toast({ title: "Membro removido", description: "A pessoa foi removida do teu plano." });
    }
  };

  const getInviteLink = (token: string) => {
    return `${window.location.origin}/auth?invite=${token}`;
  };

  const copyLink = async (token: string) => {
    const link = getInviteLink(token);
    await navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Link copiado!", description: "Partilha este link com a pessoa convidada." });
  };

  const shareLink = async (token: string, contact: string | null) => {
    const link = getInviteLink(token);
    const text = `🎉 Foste convidado(a) para o METAFIT Plano Evolução!\n\nClica no link para criar a tua conta e começar:\n${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite METAFIT", text, url: link });
      } catch {
        await navigator.clipboard.writeText(text);
        toast({ title: "Texto copiado!", description: "Cola no WhatsApp ou mensagem." });
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Texto copiado!", description: "Cola no WhatsApp ou mensagem." });
    }
  };

  if (currentPlan !== "evolution" && currentPlan !== "personal_trainer") return null;
  if (loading) return null;

  const activeMembers = members.filter(m => m.status === "active").length;
  const slotsLeft = MAX_MEMBERS - members.length;

  return (
    <Card className="p-4 border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Gerir Membros
            <Crown className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-muted-foreground">
            {activeMembers + 1}/3 pessoas · {slotsLeft > 0 ? `${slotsLeft} vagas` : "Plano cheio"}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-primary" />
          Como funciona:
        </p>
        <ol className="list-decimal list-inside space-y-0.5 ml-1">
          <li>Adiciona o email ou telefone da pessoa</li>
          <li>Copia ou partilha o link de convite</li>
          <li>A pessoa clica no link e cria a conta</li>
          <li>Automaticamente entra no teu plano!</li>
        </ol>
      </div>

      {/* Add member form */}
      {slotsLeft > 0 && (
        <div className="space-y-3 mb-4">
          <div className="flex gap-1">
            <Button
              variant={inviteType === "email" ? "default" : "outline"}
              size="sm"
              className="text-xs gap-1"
              onClick={() => setInviteType("email")}
            >
              <Mail className="w-3 h-3" /> Email
            </Button>
            <Button
              variant={inviteType === "phone" ? "default" : "outline"}
              size="sm"
              className="text-xs gap-1"
              onClick={() => setInviteType("phone")}
            >
              <Phone className="w-3 h-3" /> Telefone
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={inviteType === "email" ? "email@exemplo.com" : "+244 900 000 000"}
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleInvite}
              disabled={sending || !inviteInput.trim()}
              size="sm"
              className="gap-1 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {sending ? "..." : "Convidar"}
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        <AnimatePresence>
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                member.status === "active"
                  ? "bg-green-500/15"
                  : "bg-amber-500/15"
              }`}>
                {member.status === "active" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Link2 className="w-4 h-4 text-amber-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.member_email || member.member_phone || "Convidado"}
                </p>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${
                    member.status === "active"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {member.status === "active" ? "Activo" : "Pendente"}
                </Badge>
              </div>

              <div className="flex gap-1">
                {member.status === "pending" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyLink(member.invite_token)}
                    >
                      {copied === member.invite_token ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => shareLink(member.invite_token, member.member_email || member.member_phone)}
                    >
                      <Share2 className="w-3.5 h-3.5 text-primary" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {members.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Ainda não convidaste ninguém</p>
            <p className="text-xs">Podes adicionar até 2 pessoas ao teu plano</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlanMembers;
