import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Users, CreditCard, Activity, TrendingUp, CheckCircle, Clock } from "lucide-react";

const mockMonthlyData = [
  { month: "Jan", users: 120, revenue: 2400 },
  { month: "Fev", users: 150, revenue: 2800 },
  { month: "Mar", users: 180, revenue: 3200 },
  { month: "Abr", users: 220, revenue: 3800 },
  { month: "Mai", users: 280, revenue: 4500 },
  { month: "Jun", users: 350, revenue: 5200 },
];

const mockPlanDistribution = [
  { name: "Grátis", value: 45, color: "#e5e7eb" },
  { name: "Individual", value: 30, color: "#3b82f6" },
  { name: "Familiar", value: 18, color: "#1e40af" },
  { name: "Profissional", value: 7, color: "#1e3a8a" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema MetaFitNutri</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Utilizadores"
          value="1,234"
          description="Utilizadores registados"
          icon={Users}
          trend={{ value: 12, direction: "up" }}
          variant="default"
        />
        <StatCard
          title="Receita Total"
          value="45,280 Kz"
          description="Pagamentos aprovados"
          icon={CreditCard}
          trend={{ value: 8, direction: "up" }}
          variant="success"
        />
        <StatCard
          title="Análises Realizadas"
          value="8,456"
          description="Refeições analisadas"
          icon={Activity}
          trend={{ value: 15, direction: "up" }}
          variant="default"
        />
        <StatCard
          title="Subscrições Ativas"
          value="456"
          description="Planos em vigor"
          icon={CheckCircle}
          trend={{ value: 5, direction: "up" }}
          variant="success"
        />
        <StatCard
          title="Pagamentos Pendentes"
          value="23"
          description="À espera de revisão"
          icon={Clock}
          trend={{ value: 3, direction: "down" }}
          variant="warning"
        />
        <StatCard
          title="Taxa de Conversão"
          value="37%"
          description="Grátis para Premium"
          icon={TrendingUp}
          trend={{ value: 2, direction: "up" }}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 p-6 border border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Crescimento de Utilizadores</h2>
            <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "0.65rem",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Utilizadores"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 border border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Distribuição de Planos</h2>
            <p className="text-sm text-muted-foreground mt-1">Utilizadores por plano</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockPlanDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockPlanDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "0.65rem",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6 border border-border/50">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Receita Mensal</h2>
          <p className="text-sm text-muted-foreground mt-1">Tendência de receita nos últimos 6 meses</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockMonthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "0.65rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="var(--primary)" radius={[8, 8, 0, 0]} name="Receita (Kz)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
