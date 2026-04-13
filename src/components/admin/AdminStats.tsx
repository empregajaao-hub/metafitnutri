import { Card } from "@/components/ui/card";
import { Users, Activity, CreditCard, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalAnalyses: number;
    totalRevenue?: number;
    pendingPayments?: number;
    activeSubscriptions?: number;
    conversionRate?: number;
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: "Total Utilizadores",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
      borderColor: "border-blue-500/20",
      description: "Utilizadores registados",
      trend: "+12%",
      trendPositive: true,
    },
    {
      title: "Análises Realizadas",
      value: stats.totalAnalyses,
      icon: Activity,
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600",
      borderColor: "border-orange-500/20",
      description: "Refeições analisadas",
      trend: "+8%",
      trendPositive: true,
    },
    {
      title: "Receita Total",
      value: `${(stats.totalRevenue || 0).toLocaleString()} Kz`,
      icon: CreditCard,
      bgColor: "bg-green-500/10",
      textColor: "text-green-600",
      borderColor: "border-green-500/20",
      description: "Pagamentos aprovados",
      trend: "+15%",
      trendPositive: true,
    },
    {
      title: "Subscrições Ativas",
      value: stats.activeSubscriptions || 0,
      icon: CheckCircle,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600",
      borderColor: "border-purple-500/20",
      description: "Planos em vigor",
      trend: "+5%",
      trendPositive: true,
    },
    {
      title: "Pagamentos Pendentes",
      value: stats.pendingPayments || 0,
      icon: Clock,
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-500/20",
      description: "A aguardar revisão",
      trend: stats.pendingPayments && stats.pendingPayments > 0 ? "⚠️ Ação Necessária" : "Nenhum",
      trendPositive: !stats.pendingPayments || stats.pendingPayments === 0,
    },
    {
      title: "Taxa de Conversão",
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-600",
      borderColor: "border-pink-500/20",
      description: "Grátis para Premium",
      trend: "+3%",
      trendPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className={`p-6 hover:shadow-lg transition-all duration-300 border ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm group cursor-pointer hover:scale-105 transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center border ${stat.borderColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              stat.trendPositive
                ? "bg-green-500/10 text-green-600"
                : "bg-orange-500/10 text-orange-600"
            }`}>
              {stat.trend}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {stat.title}
            </p>
            <p className={`text-3xl font-bold ${stat.textColor} mb-2`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>

          {/* Decorative element */}
          <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -z-10`} />
        </Card>
      ))}
    </div>
  );
};
