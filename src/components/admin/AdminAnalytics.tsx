import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface AdminAnalyticsProps {
  monthlyData: Array<{ month: string; users: number; analyses: number }>;
}

export const AdminAnalytics = ({ monthlyData }: AdminAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Users Trend */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Evolução de Utilizadores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Novos Utilizadores" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Analyses per Month */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Análises por Mês</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="analyses" fill="#F97316" name="Análises" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
