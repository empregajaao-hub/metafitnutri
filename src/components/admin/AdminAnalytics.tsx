import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AdminAnalyticsProps {
  monthlyData: Array<{ month: string; revenue: number; users: number; analyses: number }>;
  planDistribution: Array<{ name: string; value: number }>;
}

export const AdminAnalytics = ({ monthlyData, planDistribution }: AdminAnalyticsProps) => {
  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Revenue and Users Trend */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Evolução de Receita e Utilizadores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Receita (Kz)" />
            <Line yAxisId="right" type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Novos Utilizadores" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Distribuição de Planos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
