import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Bell, CreditCard, LayoutDashboard } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminUserDetails } from "@/components/admin/AdminUserDetails";

interface Stats {
  totalUsers: number;
  totalAnalyses: number;
  totalRevenue: number;
  pendingPayments: number;
  activeSubscriptions: number;
  conversionRate: number;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  total_analyses: number;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAnalyses: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeSubscriptions: 0,
    conversionRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; users: number; analyses: number }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const ensurePermission = async () => {
      try {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      } catch {
        // ignore permission errors
      }
    };

    ensurePermission();

    const getPlanLabel = (plan: string | null | undefined) => {
      switch (plan) {
        case "essential":
          return "Plano Individual";
        case "evolution":
          return "Plano Familiar";
        case "personal_trainer":
          return "Plano Profissional";
        default:
          return plan || "Plano";
      }
    };

    const channel = supabase
      .channel("admin-payments-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Pagamentos" },
        async (payload) => {
          try {
            const payment = payload.new as any;

            const { data: profile } = await supabase
              .from("profiles")
              .select('"Nome Completo", phone')
              .eq("id", payment.user_id)
              .maybeSingle();

            const userName = profile?.["Nome Completo"] || "Utilizador";
            const phone = profile?.phone ? ` • ${profile.phone}` : "";

            const title = "Novo comprovativo recebido";
            const description = `${userName}${phone} — ${getPlanLabel(payment.plano)} — ${Number(payment.Valor || 0).toLocaleString()} Kz`;

            toast({
              title,
              description,
            });

            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification(title, { body: description });
              }
            }
            
            // Refresh data when new payment arrives
            loadDashboardData();
          } catch (e) {
            console.error("Failed to handle payment realtime event", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

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
      // Load users with detailed info
      const { data: usersData } = await supabase
        .from("profiles")
        .select(`
          id,
          "Nome Completo",
          phone,
          created_at
        `)
        .order("created_at", { ascending: false });

      // Get meal analyses count per user
      const { data: analysesData } = await supabase
        .from("meal_analyses")
        .select("user_id");

      const analysesCount: Record<string, number> = analysesData?.reduce((acc, analysis) => {
        acc[analysis.user_id] = (acc[analysis.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersWithDetails = usersData?.map(u => ({
        id: u.id,
        full_name: u["Nome Completo"],
        phone: u.phone,
        created_at: u.created_at,
        email: "",
        total_analyses: analysesCount[u.id] || 0,
      })) || [];

      setUsers(usersWithDetails);

      // Load statistics
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalAnalysesCount } = await supabase
        .from("meal_analyses")
        .select("*", { count: "exact", head: true });

      // Load financial stats
      const { data: paymentsData } = await supabase
        .from("Pagamentos")
        .select("Valor, estado");

      const totalRevenue = paymentsData
        ?.filter(p => p.estado === "approved")
        .reduce((sum, p) => sum + Number(p.Valor || 0), 0) || 0;

      const pendingPayments = paymentsData
        ?.filter(p => p.estado === "pending")
        .length || 0;

      // Load active subscriptions
      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("plan", "free");

      const conversionRate = usersCount && activeSubsCount 
        ? (activeSubsCount / usersCount) * 100 
        : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalAnalyses: totalAnalysesCount || 0,
        totalRevenue,
        pendingPayments,
        activeSubscriptions: activeSubsCount || 0,
        conversionRate,
      });

      // Generate mock monthly data (in a real app, this would come from a query)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
      const mockMonthlyData = months.map((month) => ({
        month,
        users: Math.floor(Math.random() * 50) + 10,
        analyses: Math.floor(Math.random() * 200) + 50,
      }));
      setMonthlyData(mockMonthlyData);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <LayoutDashboard className="w-10 h-10 text-primary" />
              Painel Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Gere utilizadores, pagamentos e notificações do METAFIT Nutri.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/5 text-primary border-primary/20">
              Acesso Total
            </Badge>
            <Badge variant="default" className="text-sm px-3 py-1">
              Administrador
            </Badge>
          </div>
        </div>

        <AdminStats stats={stats} />

        <div className="mt-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="users" className="flex items-center gap-2 py-3">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Utilizadores</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 py-3">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Pagamentos</span>
                <span className="sm:hidden">Pagos</span>
                {stats.pendingPayments > 0 && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Análises</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
                <span className="sm:hidden">Push</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="overview">Lista Simples</TabsTrigger>
                  <TabsTrigger value="details">Ficha Detalhada</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <AdminUsers users={users} onRefresh={loadDashboardData} />
                </TabsContent>

                <TabsContent value="details" className="mt-6">
                  <AdminUserDetails />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <AdminPayments onRefresh={loadDashboardData} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AdminAnalytics monthlyData={monthlyData} />
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
