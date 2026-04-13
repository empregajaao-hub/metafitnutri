import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Phone, 
  Calendar,
  Target,
  Scale,
  Ruler,
  Activity,
  User,
  ClipboardList,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Edit,
  Check,
  X,
  Send,
  ShieldCheck,
  MoreHorizontal
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDetail {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  activity_level: string | null;
  plan: string | null;
  is_active: boolean;
  end_date: string | null;
  total_analyses: number;
  payments: Array<{
    id: string;
    plano: string;
    Valor: number;
    estado: string;
    created_at: string;
  }>;
}

export const AdminUserDetails = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [notifyUser, setNotifyUser] = useState<{ id: string; name: string } | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [planConfirmOpen, setPlanConfirmOpen] = useState(false);
  const [pendingPlanChange, setPendingPlanChange] = useState<{ userId: string; userName: string; newPlan: string; months: number } | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles with subscription info
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          "Nome Completo",
          phone,
          created_at,
          Idade,
          peso,
          Altura,
          Objetivo,
          "Nivel de Atividade"
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get subscriptions
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan, is_active, end_date");

      // Get payments
      const { data: payments } = await supabase
        .from("Pagamentos")
        .select("*")
        .order("created_at", { ascending: false });

      // Get analyses count
      const { data: analyses } = await supabase
        .from("meal_analyses")
        .select("user_id");

      // Build user details
      const subscriptionsMap = new Map(subscriptions?.map(s => [s.user_id, s]) || []);
      const paymentsMap = new Map<string, any[]>();
      payments?.forEach(p => {
        const existing = paymentsMap.get(p.user_id) || [];
        existing.push(p);
        paymentsMap.set(p.user_id, existing);
      });

      const analysesCount: Record<string, number> = {};
      analyses?.forEach(a => {
        analysesCount[a.user_id] = (analysesCount[a.user_id] || 0) + 1;
      });

      const userDetails: UserDetail[] = profiles?.map(profile => {
        const sub = subscriptionsMap.get(profile.id);
        return {
          id: profile.id,
          full_name: profile["Nome Completo"],
          phone: profile.phone,
          created_at: profile.created_at,
          age: profile.Idade,
          weight: profile.peso,
          height: profile.Altura,
          goal: profile.Objetivo,
          activity_level: profile["Nivel de Atividade"],
          plan: sub?.plan || "free",
          is_active: sub?.is_active || false,
          end_date: sub?.end_date || null,
          total_analyses: analysesCount[profile.id] || 0,
          payments: paymentsMap.get(profile.id) || [],
        };
      }) || [];

      setUsers(userDetails);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return matchesSearch;
  });

  const notifyTarget = useMemo(() => {
    if (!notifyUser) return null;
    return `user:${notifyUser.id}`;
  }, [notifyUser]);

  const sendUserNotification = async () => {
    if (!notifyUser) return;
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      toast({
        title: "Erro",
        description: "Preenche o título e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setNotifySending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // 1. Save to database
      const { error } = await supabase.from("notifications").insert({
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        target_audience: notifyTarget,
        sent_by: user.id,
      });
      if (error) throw error;

      // 2. Send real push notification
      const { data: pushResult, error: pushError } = await supabase.functions.invoke("send-admin-push", {
        body: {
          title: notifyTitle.trim(),
          message: notifyMessage.trim(),
          target_audience: notifyTarget,
          url: "/",
        },
      });

      const pushInfo = pushResult?.sent ? " (Push enviado!)" : pushError ? " (Push falhou)" : "";

      toast({
        title: "Notificação enviada",
        description: `Enviada para ${notifyUser.name}${pushInfo}.`,
      });

      setNotifyUser(null);
      setNotifyTitle("");
      setNotifyMessage("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setNotifySending(false);
    }
  };

  const handlePlanChange = async () => {
    if (!pendingPlanChange) return;
    
    setSavingPlan(true);
    try {
      const { userId, newPlan, userName, months } = pendingPlanChange;
      
      // Calculate end_date based on selected months
      const endDate = newPlan !== "free" 
        ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;
      
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          plan: newPlan as any,
          is_active: newPlan !== "free",
          start_date: new Date().toISOString(),
          end_date: endDate,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Plano Atualizado",
        description: `O plano de ${userName} foi alterado para ${getPlanLabel(newPlan)}.`,
      });

      // Refresh users list
      await loadUsers();
      setEditingPlan(null);
      setPlanConfirmOpen(false);
      setPendingPlanChange(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingPlan(false);
    }
  };

  const startEditPlan = (user: UserDetail) => {
    setEditingPlan(user.id);
    setSelectedPlan(user.plan || "free");
    setSelectedMonths(1);
  };

  const confirmPlanChange = (user: UserDetail) => {
    if (selectedPlan === user.plan && selectedPlan === "free") {
      setEditingPlan(null);
      return;
    }
    setPendingPlanChange({
      userId: user.id,
      userName: user.full_name || "Utilizador",
      newPlan: selectedPlan,
      months: selectedMonths,
    });
    setPlanConfirmOpen(true);
  };

  const cancelEditPlan = () => {
    setEditingPlan(null);
    setSelectedPlan("");
  };

  const getPlanLabel = (plan: string | null) => {
    switch (plan) {
      case "essential": return "Individual (2500 Kz)";
      case "evolution": return "Familiar (5000 Kz)";
      case "personal_trainer": return "Profissional (15000 Kz)";
      default: return "Grátis";
    }
  };

  const getGoalLabel = (goal: string | null) => {
    switch (goal) {
      case "lose": return "Perder Peso";
      case "maintain": return "Manter Peso";
      case "gain": return "Ganhar Massa";
      default: return "Não definido";
    }
  };

  const getActivityLabel = (level: string | null) => {
    switch (level) {
      case "sedentary": return "Sedentário";
      case "light": return "Ligeiro";
      case "moderate": return "Moderado";
      case "active": return "Activo";
      case "very_active": return "Muito Activo";
      default: return "Não definido";
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "essential":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Individual</Badge>;
      case "evolution":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Familiar</Badge>;
      case "personal_trainer":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Profissional</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Grátis</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Fichas Detalhadas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Gestão completa de perfis e subscrições.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all">
            <Collapsible
              open={expandedUsers.has(user.id)}
              onOpenChange={() => toggleExpanded(user.id)}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                    {user.full_name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{user.full_name || "Utilizador"}</h3>
                      {getPlanBadge(user.plan)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {user.phone || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(user.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifyUser({ id: user.id, name: user.full_name || "Utilizador" });
                    }}
                  >
                    <Send className="w-3.5 h-3.5" /> Notificar
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                      {expandedUsers.has(user.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="border-t border-border/50">
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Perfil Físico */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Perfil Físico
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Idade</p>
                        <p className="text-sm font-semibold">{user.age || "N/A"} anos</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Peso</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-muted-foreground" /> {user.weight || "N/A"} kg
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Altura</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-muted-foreground" /> {user.height || "N/A"} cm
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Objetivo</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Target className="w-3 h-3 text-muted-foreground" /> {getGoalLabel(user.goal)}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Nível de Atividade</p>
                      <p className="text-sm font-semibold">{getActivityLabel(user.activity_level)}</p>
                    </div>
                  </div>

                  {/* Subscrição */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Subscrição
                    </h4>
                    {editingPlan === user.id ? (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label className="text-[10px]">Plano</Label>
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Grátis</SelectItem>
                              <SelectItem value="essential">Individual</SelectItem>
                              <SelectItem value="evolution">Familiar</SelectItem>
                              <SelectItem value="personal_trainer">Profissional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedPlan !== "free" && (
                          <div className="space-y-2">
                            <Label className="text-[10px]">Duração (Meses)</Label>
                            <Select value={selectedMonths.toString()} onValueChange={(v) => setSelectedMonths(parseInt(v))}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Mês</SelectItem>
                                <SelectItem value="3">3 Meses</SelectItem>
                                <SelectItem value="6">6 Meses</SelectItem>
                                <SelectItem value="12">12 Meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="h-8 flex-1" onClick={() => confirmPlanChange(user)}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 flex-1" onClick={cancelEditPlan}>
                            <X className="w-3.5 h-3.5 mr-1" /> Sair
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Plano Atual</p>
                            <p className="text-sm font-bold">{getPlanLabel(user.plan)}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEditPlan(user)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">{user.is_active ? 'Ativo' : 'Inativo'}</span>
                          </div>
                        </div>
                        {user.end_date && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase">Expira em</p>
                            <p className="text-sm font-semibold">{new Date(user.end_date).toLocaleDateString("pt-PT")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Histórico e Ações */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> Atividade
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium">Análises</span>
                        </div>
                        <span className="text-lg font-bold">{user.total_analyses}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground uppercase">Últimos Pagamentos</p>
                        {user.payments.length > 0 ? (
                          <div className="space-y-1.5">
                            {user.payments.slice(0, 2).map((p) => (
                              <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded bg-background/50 border border-border/30">
                                <span className="font-medium">{Number(p.Valor).toLocaleString()} Kz</span>
                                <Badge variant="outline" className={`text-[9px] h-4 px-1 ${p.estado === 'approved' ? 'text-green-600 border-green-200 bg-green-50' : 'text-orange-600 border-orange-200 bg-orange-50'}`}>
                                  {p.estado === 'approved' ? 'Aprovado' : 'Pendente'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Sem histórico de pagamentos.</p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => setNotifyUser({ id: user.id, name: user.full_name || "Utilizador" })}
                        >
                          <Send className="w-3 h-3 mr-1.5" /> Notificar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Nenhum utilizador encontrado com estes critérios.</p>
        </div>
      )}

      {/* Dialog de Notificação */}
      <Dialog open={!!notifyUser} onOpenChange={(open) => !open && setNotifyUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Notificar {notifyUser?.name}
            </DialogTitle>
            <DialogDescription>
              Esta mensagem será enviada como notificação push para o dispositivo do utilizador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Atualização do teu plano"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreve a tua mensagem aqui..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyUser(null)}>Cancelar</Button>
            <Button onClick={sendUserNotification} disabled={notifySending}>
              {notifySending ? "A enviar..." : "Enviar Notificação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Alteração de Plano */}
      <AlertDialog open={planConfirmOpen} onOpenChange={setPlanConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração de Plano</AlertDialogTitle>
            <AlertDialogDescription>
              Estás prestes a alterar o plano de <strong>{pendingPlanChange?.userName}</strong> para <strong>{getPlanLabel(pendingPlanChange?.newPlan || "")}</strong> por <strong>{pendingPlanChange?.months} mês(es)</strong>.
              Esta ação terá efeito imediato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPlanChange(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlanChange} disabled={savingPlan}>
              {savingPlan ? "A processar..." : "Confirmar Alteração"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
