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
  X
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

      const { error } = await supabase.from("notifications").insert({
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        target_audience: notifyTarget,
        sent_by: user.id,
      });
      if (error) throw error;

      toast({
        title: "Notificação enviada",
        description: `Enviada para ${notifyUser.name}.`,
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
    if (selectedPlan === user.plan) {
      setEditingPlan(null);
      return;
    }
    setPendingPlanChange({
      userId: user.id,
      userName: user.full_name || "Utilizador",
      newPlan: selectedPlan,
    });
    setPlanConfirmOpen(true);
  };

  const cancelEditPlan = () => {
    setEditingPlan(null);
    setSelectedPlan("");
  };

  const getPlanLabel = (plan: string | null) => {
    switch (plan) {
      case "essential": return "Familiar";
      case "evolution": return "Evolução";
      case "personal_trainer": return "Personal Trainer";
      case "monthly": return "Mensal";
      case "annual": return "Anual";
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
        return <Badge variant="secondary">Familiar</Badge>;
      case "evolution":
        return <Badge>Evolução</Badge>;
      case "personal_trainer":
        return <Badge className="bg-primary/80 text-primary-foreground">Personal Trainer</Badge>;
      case "monthly":
        return <Badge variant="secondary">Mensal</Badge>;
      case "annual":
        return <Badge>Anual</Badge>;
      default:
        return <Badge variant="outline">Grátis</Badge>;
    }
  };

  const hasAnamnesisComplete = (user: UserDetail) => {
    return user.age && user.weight && user.height && user.goal && user.activity_level;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Detalhes de Utilizadores
        </h2>
        <p className="text-muted-foreground mb-4">
          Visualize todos os dados dos utilizadores incluindo anamnese e pagamentos
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Collapsible
            key={user.id}
            open={expandedUsers.has(user.id)}
            onOpenChange={() => toggleExpanded(user.id)}
          >
            <Card className="p-4 border">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.full_name || "N/A"}</p>
                        {getPlanBadge(user.plan)}
                        {hasAnamnesisComplete(user) ? (
                          <Badge variant="outline" className="text-primary border-primary">
                            <ClipboardList className="w-3 h-3 mr-1" />
                            Anamnese
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
                            Incompleto
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.created_at).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {expandedUsers.has(user.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Nota: os dados da anamnese são privados — apenas o utilizador tem acesso total; o Admin vê um resumo para suporte.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNotifyUser({ id: user.id, name: user.full_name || "Utilizador" });
                      setNotifyTitle("");
                      setNotifyMessage("");
                    }}
                  >
                    Enviar notificação
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Plan Management */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Gestão de Plano
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Plano atual:</span>
                        {getPlanBadge(user.plan)}
                      </div>
                      {user.end_date && (
                        <div className="text-sm text-muted-foreground">
                          Expira: {new Date(user.end_date).toLocaleDateString("pt-PT")}
                        </div>
                      )}
                      
                      {editingPlan === user.id ? (
                        <div className="space-y-2">
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar plano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Grátis</SelectItem>
                              <SelectItem value="essential">Familiar (2500 Kz)</SelectItem>
                              <SelectItem value="evolution">Evolução (5000 Kz)</SelectItem>
                              <SelectItem value="personal_trainer">Personal Trainer (15000 Kz)</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => confirmPlanChange(user)}
                              disabled={savingPlan}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditPlan}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditPlan(user)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Alterar Plano
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Anamnesis Data */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Dados de Anamnese
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Idade: <strong>{user.age || "N/A"}</strong> anos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <span>Peso: <strong>{user.weight || "N/A"}</strong> kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <span>Altura: <strong>{user.height || "N/A"}</strong> cm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span>Objetivo: <strong>{getGoalLabel(user.goal)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span>Actividade: <strong>{getActivityLabel(user.activity_level)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Payments History */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Histórico de Pagamentos
                    </h4>
                    {user.payments.length > 0 ? (
                      <div className="space-y-2">
                        {user.payments.slice(0, 3).map((payment) => (
                          <div 
                            key={payment.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                          >
                            <div>
                              <p className="font-medium">{payment.Valor?.toLocaleString()} Kz</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                              </p>
                            </div>
                            <Badge 
                              variant={payment.estado === "approved" ? "default" : "secondary"}
                            >
                              {payment.estado === "approved" ? "Aprovado" : 
                               payment.estado === "rejected" ? "Rejeitado" : "Pendente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem pagamentos registados</p>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum utilizador encontrado.</p>
        </div>
      )}

      <Dialog open={!!notifyUser} onOpenChange={(open) => !open && setNotifyUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notificação para {notifyUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notify-title">Título</Label>
              <Input
                id="notify-title"
                placeholder="Título da notificação"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notify-message">Mensagem</Label>
              <Textarea
                id="notify-message"
                placeholder="Escreve a mensagem..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNotifyUser(null)}>
                Cancelar
              </Button>
              <Button
                onClick={sendUserNotification}
                disabled={notifySending || !notifyTitle.trim() || !notifyMessage.trim()}
              >
                {notifySending ? "A enviar..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={planConfirmOpen} onOpenChange={setPlanConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres alterar o plano de <strong>{pendingPlanChange?.userName}</strong> para{" "}
              <strong>{getPlanLabel(pendingPlanChange?.newPlan || "")}</strong>?
              {pendingPlanChange?.newPlan !== "free" && (
                <span className="block mt-2 text-sm">
                  O plano será ativado por 30 dias a partir de hoje.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPlanChange(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePlanChange} disabled={savingPlan}>
              {savingPlan ? "A guardar..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
