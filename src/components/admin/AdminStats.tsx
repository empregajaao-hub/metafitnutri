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
      description: "Utilizadores registados"
    },
    {
      title: "Análises Realizadas",
      value: stats.totalAnalyses,
      icon: Activity,
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600",
      description: "Refeições analisadas"
    },
    {
      title: "Receita Total",
      value: `${(stats.totalRevenue || 0).toLocaleString()} Kz`,
      icon: CreditCard,
      bgColor: "bg-green-500/10",
      textColor: "text-green-600",
      description: "Pagamentos aprovados"
    },
    {
      title: "Subscrições Ativas",
      value: stats.activeSubscriptions || 0,
      icon: CheckCircle,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600",
      description: "Planos em vigor"
    },
    {
      title: "Pagamentos Pendentes",
      value: stats.pendingPayments || 0,
      icon: Clock,
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-600",
      description: "A aguardar revisão"
    },
    {
      title: "Taxa de Conversão",
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-600",
      description: "Grátis para Premium"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-md transition-all border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Global
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
