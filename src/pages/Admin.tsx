import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Bell, CreditCard } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminUserDetails } from "@/components/admin/AdminUserDetails";

interface Stats {
  totalUsers: number;
  totalAnalyses: number;
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
      // Optional (free): browser notification while the admin panel is open
      // Note: This is NOT WhatsApp/email; it relies on the browser and permissions.
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
          return "Plano Essencial";
        case "evolution":
          return "Plano Evolução";
        case "personal_trainer":
          return "Personal Trainer";
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

            // Browser notification (free) – only works if the browser allowed it
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification(title, { body: description });
              }
            }
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

      setStats({
        totalUsers: usersCount || 0,
        totalAnalyses: totalAnalysesCount || 0,
      });

      // Generate mock monthly data
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
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilizadores
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamentos
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

            <TabsContent value="users" className="mt-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Lista</TabsTrigger>
                  <TabsTrigger value="details">Ficha completa</TabsTrigger>
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
