import { Card } from "@/components/ui/card";
import { Users, Clock, DollarSign, TrendingUp, Activity, CreditCard } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    pendingPayments: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    totalAnalyses: number;
    conversionRate: number;
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: "Total Utilizadores",
      value: stats.totalUsers,
      icon: Users,
      color: "primary",
      bgColor: "bg-primary/10",
      textColor: "text-primary"
    },
    {
      title: "Pagamentos Pendentes",
      value: stats.pendingPayments,
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600"
    },
    {
      title: "Receita Total (Kz)",
      value: stats.monthlyRevenue.toLocaleString(),
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-500/10",
      textColor: "text-green-600"
    },
    {
      title: "Subscrições Ativas",
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      color: "blue",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600"
    },
    {
      title: "Análises Realizadas",
      value: stats.totalAnalyses,
      icon: Activity,
      color: "purple",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600"
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: CreditCard,
      color: "indigo",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
