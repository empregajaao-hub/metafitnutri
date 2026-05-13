import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsersAdvanced } from "@/components/admin/AdminUsersAdvanced";
import { AdminPaymentsAdvanced } from "@/components/admin/AdminPaymentsAdvanced";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminUserDetails } from "@/components/admin/AdminUserDetails";
import AdminAffiliates from "@/components/admin/AdminAffiliates";

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
  const [activeTab, setActiveTab] = useState("overview");
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
  const [lastUpdate, setLastUpdate] = useState<string>("");
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

      // Generate mock monthly data
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
      const mockMonthlyData = months.map((month) => ({
        month,
        users: Math.floor(Math.random() * 50) + 10,
        analyses: Math.floor(Math.random() * 200) + 50,
      }));
      setMonthlyData(mockMonthlyData);

      // Update last update time
      setLastUpdate(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          pendingPayments={stats.pendingPayments}
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header Section */}
            {activeTab === "overview" && (
              <AdminHeader 
                title="Dashboard Executivo"
                description="Visão completa do desempenho da plataforma METAFIT Nutri"
                lastUpdate={lastUpdate}
                alertCount={stats.pendingPayments}
              />
            )}

            {activeTab === "users" && (
              <AdminHeader 
                title="Gestão de Utilizadores"
                description="Visualize, pesquise e gerencie todos os utilizadores da plataforma com funcionalidades avançadas"
                lastUpdate={lastUpdate}
              />
            )}

            {activeTab === "payments" && (
              <AdminHeader 
                title="Gestão de Pagamentos"
                description="Valide comprovativos, gerencie transações e visualize relatórios de receita"
                lastUpdate={lastUpdate}
                alertCount={stats.pendingPayments}
              />
            )}

            {activeTab === "analytics" && (
              <AdminHeader 
                title="Análises e Estatísticas"
                description="Visualize gráficos detalhados do crescimento, engajamento e distribuição de planos"
                lastUpdate={lastUpdate}
              />
            )}

            {activeTab === "notifications" && (
              <AdminHeader 
                title="Notificações Push"
                description="Envie mensagens personalizadas aos utilizadores com templates pré-configurados"
                lastUpdate={lastUpdate}
              />
            )}

            {activeTab === "audit" && (
              <AdminHeader 
                title="Registo de Auditoria"
                description="Rastreie todas as ações administrativas e operações do sistema"
                lastUpdate={lastUpdate}
              />
            )}

            {activeTab === "affiliates" && (
              <AdminHeader
                title="Programa de Afiliados"
                description="Gere afiliados, comissões, pagamentos, ranking e configurações do programa"
                lastUpdate={lastUpdate}
              />
            )}

            {/* Content Area */}
            <div className="mt-8">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <AdminDashboard />
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  <AdminUsersAdvanced users={users} onRefresh={loadDashboardData} />
                  <AdminUserDetails />
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <AdminPaymentsAdvanced onRefresh={loadDashboardData} />
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <AdminAnalytics monthlyData={monthlyData} />
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <AdminNotifications />
              )}

              {/* Audit Tab */}
              {activeTab === "audit" && (
                <AdminAuditLog />
              )}

              {/* Affiliates Tab */}
              {activeTab === "affiliates" && (
                <AdminAffiliates />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
