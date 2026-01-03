import { Card } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalAnalyses: number;
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: "Total Utilizadores",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-primary/10",
      textColor: "text-primary"
    },
    {
      title: "Análises Realizadas",
      value: stats.totalAnalyses,
      icon: Activity,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
