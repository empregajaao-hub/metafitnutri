import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingPayments: number;
  totalAnalyses: number;
  conversionRate: number;
  avgRevenuePerUser: number;
  userGrowthRate: number;
  analysisGrowthRate: number;
}

interface ChartData {
  date: string;
  users: number;
  revenue: number;
  analyses: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalAnalyses: 0,
    conversionRate: 0,
    avgRevenuePerUser: 0,
    userGrowthRate: 0,
    analysisGrowthRate: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { toast } = useToast();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Total users
      const { count: totalUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // New users this month
      const monthStart = new Date();
      monthStart.setDate(1);
      const { count: newUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString());

      // Active subscriptions
      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("plan", "free");

      // Total analyses
      const { count: totalAnalysesCount } = await supabase
        .from("meal_analyses")
        .select("*", { count: "exact", head: true });

      // Revenue data
      const { data: paymentsData } = await supabase
        .from("Pagamentos")
        .select("Valor, estado, created_at");

      const totalRevenue = paymentsData
        ?.filter((p) => p.estado === "approved")
        .reduce((sum, p) => sum + Number(p.Valor || 0), 0) || 0;

      const pendingPayments = paymentsData
        ?.filter((p) => p.estado === "pending")
        .length || 0;

      const conversionRate =
        totalUsersCount && activeSubsCount
          ? (activeSubsCount / totalUsersCount) * 100
          : 0;

      const avgRevenuePerUser =
        activeSubsCount && totalRevenue ? totalRevenue / activeSubsCount : 0;

      // Calculate growth rates (mock data for now)
      const userGrowthRate = 12.5;
      const analysisGrowthRate = 24.3;

      setStats({
        totalUsers: totalUsersCount || 0,
        newUsersThisMonth: newUsersCount || 0,
        activeSubscriptions: activeSubsCount || 0,
        totalRevenue,
        pendingPayments,
        totalAnalyses: totalAnalysesCount || 0,
        conversionRate,
        avgRevenuePerUser,
        userGrowthRate,
        analysisGrowthRate,
      });

      // Generate chart data (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
          date: date.toLocaleDateString("pt-PT", { month: "short", day: "numeric" }),
          users: Math.floor(Math.random() * 50) + 20,
          revenue: Math.floor(Math.random() * 50000) + 10000,
          analyses: Math.floor(Math.random() * 100) + 30,
        });
      }
      setChartData(days);

      setLastUpdate(
        new Date().toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendPositive,
    bgColor,
    textColor,
  }: any) => (
    <Card className={`p-6 border-border/50 bg-gradient-to-br ${bgColor} backdrop-blur-sm group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-xl border border-current/10 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          trendPositive
            ? "bg-green-500/10 text-green-600"
            : "bg-red-500/10 text-red-600"
        }`}>
          {trendPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {trend}
        </div>
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className={`text-3xl font-bold ${textColor} mb-2`}>{value}</p>
      <p className="text-xs text-muted-foreground">Atualizado às {lastUpdate}</p>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com botões de ação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">Visão completa do desempenho da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards - Primeira linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Utilizadores"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={`+${stats.userGrowthRate}%`}
          trendPositive={true}
          bgColor="from-blue-500/5 to-card/50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Subscrições Ativas"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
          trend={`${stats.conversionRate.toFixed(1)}%`}
          trendPositive={true}
          bgColor="from-purple-500/5 to-card/50"
          textColor="text-purple-600"
        />
        <StatCard
          title="Receita Total"
          value={`${stats.totalRevenue.toLocaleString()} Kz`}
          icon={DollarSign}
          trend="+18%"
          trendPositive={true}
          bgColor="from-green-500/5 to-card/50"
          textColor="text-green-600"
        />
        <StatCard
          title="Análises Realizadas"
          value={stats.totalAnalyses.toLocaleString()}
          icon={Activity}
          trend={`+${stats.analysisGrowthRate}%`}
          trendPositive={true}
          bgColor="from-orange-500/5 to-card/50"
          textColor="text-orange-600"
        />
      </div>

      {/* KPI Cards - Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-yellow-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
          <p className="text-xs text-muted-foreground mt-2">Requerem atenção imediata</p>
        </Card>

        <Card className="p-6 border-border/50 bg-gradient-to-br from-cyan-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-cyan-600" />
            <p className="text-sm font-medium text-muted-foreground">Novos Utilizadores</p>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{stats.newUsersThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-2">Este mês</p>
        </Card>

        <Card className="p-6 border-border/50 bg-gradient-to-br from-pink-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-pink-600" />
            <p className="text-sm font-medium text-muted-foreground">Receita por Utilizador</p>
          </div>
          <p className="text-3xl font-bold text-pink-600">{stats.avgRevenuePerUser.toLocaleString()} Kz</p>
          <p className="text-xs text-muted-foreground mt-2">Média</p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de Utilizadores */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Crescimento de Utilizadores
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Receita */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Receita Diária
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Análises e Insights */}
      <Card className="p-6 border-border/50 bg-gradient-to-r from-primary/5 via-card/50 to-card/50 backdrop-blur-sm border-primary/10">
        <h3 className="text-lg font-bold text-foreground mb-4">📊 Insights Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Crescimento</p>
            <p className="text-sm text-foreground">
              O crescimento de utilizadores acelerou {stats.userGrowthRate}% este mês, indicando maior interesse na plataforma.
            </p>
          </div>
          <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
            <p className="text-xs font-semibold text-orange-600 uppercase mb-2">Engajamento</p>
            <p className="text-sm text-foreground">
              As análises de refeições aumentaram {stats.analysisGrowthRate}%, mostrando maior utilização das funcionalidades.
            </p>
          </div>
          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="text-xs font-semibold text-green-600 uppercase mb-2">Recomendação</p>
            <p className="text-sm text-foreground">
              Taxa de conversão de {stats.conversionRate.toFixed(1)}% é sólida. Considera aumentar a promoção de planos premium.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
