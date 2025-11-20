import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, DollarSign, TrendingUp } from "lucide-react";

interface Payment {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  status: string;
  payment_method: string;
  receipt_url: string;
  created_at: string;
  full_name: string | null;
}

interface Stats {
  totalUsers: number;
  pendingPayments: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!hasAdminRole) {
        toast({
          title: "Acesso Negado",
          description: "Não tens permissões de administrador.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Load profiles separately and merge
      const userIds = paymentsData?.map(p => p.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const paymentsWithProfiles = paymentsData?.map(payment => ({
        ...payment,
        full_name: profilesData?.find(p => p.id === payment.user_id)?.full_name || null,
      })) || [];

      setPayments(paymentsWithProfiles);

      // Load statistics
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: pendingCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { data: revenueData } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "approved");

      const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("plan", "free");

      setStats({
        totalUsers: usersCount || 0,
        pendingPayments: pendingCount || 0,
        monthlyRevenue: totalRevenue,
        activeSubscriptions: activeSubsCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApprovePayment = async (paymentId: string, userId: string, plan: string) => {
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "approved" })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Update or create user subscription
      const endDate = new Date();
      if (plan === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan === "annual") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const { error: subError } = await supabase
        .from("user_subscriptions")
        .update({
          plan: plan as "free" | "monthly" | "annual",
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq("user_id", userId);

      if (subError) throw subError;

      toast({
        title: "Pagamento Aprovado",
        description: "O utilizador agora tem acesso ao plano premium.",
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: "rejected" })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Pagamento Rejeitado",
        description: "O pagamento foi marcado como rejeitado.",
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Painel de Administração
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilizadores</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receita (Kz)</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subscrições</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeSubscriptions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Gestão de Pagamentos</h2>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {payments.filter(p => p.status === "pending").length} pendentes
            </Badge>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum pagamento registado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Utilizador
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Plano
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Valor
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Estado
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Data
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                      Comprovativo
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-foreground font-medium">
                        {payment.full_name || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.plan === "monthly" ? "Mensal" : "Anual"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-foreground font-semibold">
                        {Number(payment.amount).toLocaleString()} Kz
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            payment.status === "approved"
                              ? "default"
                              : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {payment.status === "approved"
                            ? "Aprovado"
                            : payment.status === "pending"
                            ? "Pendente"
                            : "Rejeitado"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="py-4 px-4">
                        {payment.receipt_url ? (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            Ver Comprovativo
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {payment.status === "pending" && (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApprovePayment(payment.id, payment.user_id, payment.plan)
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectPayment(payment.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Admin;
