import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, BarChart3, Users, Bell, DollarSign } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

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
  totalAnalyses: number;
  conversionRate: number;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  plan: string;
  is_active: boolean;
  total_analyses: number;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    totalAnalyses: 0,
    conversionRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; revenue: number; users: number; analyses: number }>>([]);
  const [planDistribution, setPlanDistribution] = useState<Array<{ name: string; value: number }>>([]);
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
      // Load all payments from Pagamentos table
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("Pagamentos")
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
        id: payment.id,
        user_id: payment.user_id,
        plan: payment.plano,
        amount: payment.Valor,
        status: payment.estado || "pending",
        payment_method: payment["Forma de Pag"] || "",
        receipt_url: payment.receipt_url || "",
        created_at: payment.created_at || "",
        full_name: profilesData?.find(p => p.id === payment.user_id)?.full_name || null,
      })) || [];

      setPayments(paymentsWithProfiles);

      // Load users with detailed info
      const { data: usersData } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          created_at
        `)
        .order("created_at", { ascending: false });

      // Get subscriptions for each user
      const { data: subscriptionsData } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan, is_active");

      // Get meal analyses count per user
      const { data: analysesData } = await supabase
        .from("meal_analyses")
        .select("user_id");

      const analysesCount: Record<string, number> = analysesData?.reduce((acc, analysis) => {
        acc[analysis.user_id] = (acc[analysis.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersWithDetails = usersData?.map(user => {
        const subscription = subscriptionsData?.find(s => s.user_id === user.id);
        return {
          ...user,
          email: "",
          plan: subscription?.plan || "free",
          is_active: subscription?.is_active || false,
          total_analyses: analysesCount[user.id] || 0,
        };
      }) || [];

      setUsers(usersWithDetails);

      // Load statistics
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: pendingCount } = await supabase
        .from("Pagamentos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pending");

      const { data: revenueData } = await supabase
        .from("Pagamentos")
        .select("Valor")
        .eq("estado", "approved");

      const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.Valor), 0) || 0;

      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("plan", "free");

      const { count: totalAnalysesCount } = await supabase
        .from("meal_analyses")
        .select("*", { count: "exact", head: true });

      const conversionRate = usersCount ? (activeSubsCount || 0) / usersCount * 100 : 0;

      setStats({
        totalUsers: usersCount || 0,
        pendingPayments: pendingCount || 0,
        monthlyRevenue: totalRevenue,
        activeSubscriptions: activeSubsCount || 0,
        totalAnalyses: totalAnalysesCount || 0,
        conversionRate,
      });

      // Generate mock monthly data (in production, this would come from database aggregations)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
      const mockMonthlyData = months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        users: Math.floor(Math.random() * 50) + 10,
        analyses: Math.floor(Math.random() * 200) + 50,
      }));
      setMonthlyData(mockMonthlyData);

      // Plan distribution
      const freeCount = usersWithDetails.filter(u => u.plan === "free").length;
      const monthlyCount = usersWithDetails.filter(u => u.plan === "monthly").length;
      const annualCount = usersWithDetails.filter(u => u.plan === "annual").length;

      setPlanDistribution([
        { name: "Grátis", value: freeCount },
        { name: "Mensal", value: monthlyCount },
        { name: "Anual", value: annualCount },
      ]);

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
      // Update payment status in Pagamentos table
      const { error: paymentError } = await supabase
        .from("Pagamentos")
        .update({ estado: "approved" })
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
        .from("Pagamentos")
        .update({ estado: "rejected" })
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
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Painel de Administração
          </h1>
          <Badge variant="default" className="text-lg px-4 py-2">
            Admin
          </Badge>
        </div>

        <AdminStats stats={stats} />

        <div className="mt-8">
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilizadores
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Análises
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="mt-6">
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
                                <div className="flex items-center gap-2">
                                  <a
                                    href={payment.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                  >
                                    Ver Comprovativo
                                  </a>
                                  {(payment.receipt_url.endsWith('.jpg') || 
                                    payment.receipt_url.endsWith('.jpeg') || 
                                    payment.receipt_url.endsWith('.png')) && (
                                    <img 
                                      src={payment.receipt_url} 
                                      alt="Comprovativo"
                                      className="h-10 w-10 object-cover rounded cursor-pointer hover:scale-150 transition-transform"
                                      onClick={() => window.open(payment.receipt_url, '_blank')}
                                    />
                                  )}
                                </div>
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
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <AdminUsers users={users} onRefresh={loadDashboardData} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AdminAnalytics monthlyData={monthlyData} planDistribution={planDistribution} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <AdminNotifications />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
