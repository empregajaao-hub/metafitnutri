import { Card } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, Zap, AlertCircle } from "lucide-react";

interface AdminAnalyticsProps {
  monthlyData: Array<{ month: string; users: number; analyses: number }>;
}

export const AdminAnalytics = ({ monthlyData }: AdminAnalyticsProps) => {
  const planDistribution = [
    { name: "Grátis", value: 45, color: "#94a3b8" },
    { name: "Individual", value: 35, color: "#3b82f6" },
    { name: "Familiar", value: 15, color: "#8b5cf6" },
    { name: "Profissional", value: 5, color: "#ec4899" },
  ];

  const COLORS = ["#94a3b8", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50 bg-gradient-to-br from-blue-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Novos Utilizadores</p>
          </div>
          <p className="text-2xl font-bold text-foreground">+128</p>
          <p className="text-xs text-blue-600 mt-1">+18% vs mês anterior</p>
        </Card>

        <Card className="p-4 border-border/50 bg-gradient-to-br from-orange-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Análises Totais</p>
          </div>
          <p className="text-2xl font-bold text-foreground">1,247</p>
          <p className="text-xs text-orange-600 mt-1">+24% vs mês anterior</p>
        </Card>

        <Card className="p-4 border-border/50 bg-gradient-to-br from-green-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Taxa Crescimento</p>
          </div>
          <p className="text-2xl font-bold text-foreground">+22%</p>
          <p className="text-xs text-green-600 mt-1">Mês em análise</p>
        </Card>

        <Card className="p-4 border-border/50 bg-gradient-to-br from-purple-500/5 to-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Engagement</p>
          </div>
          <p className="text-2xl font-bold text-foreground">87%</p>
          <p className="text-xs text-purple-600 mt-1">Utilizadores ativos</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Trend */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Crescimento de Utilizadores
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Analyses Trend */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Análises Realizadas
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Bar dataKey="analyses" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">Distribuição de Planos</h3>
          <p className="text-xs text-muted-foreground mt-1">Percentagem de utilizadores por plano</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex justify-center items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {planDistribution.map((plan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-sm font-medium text-foreground">{plan.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{plan.value}%</p>
                  <p className="text-xs text-muted-foreground">{Math.round(plan.value * 1.5)} utilizadores</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 border-border/50 bg-gradient-to-r from-primary/5 via-card/50 to-card/50 backdrop-blur-sm border-primary/10">
        <h3 className="text-lg font-bold text-foreground mb-4">📊 Insights Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Crescimento</p>
            <p className="text-sm text-foreground">O crescimento de utilizadores acelerou 18% este mês, indicando maior interesse na plataforma.</p>
          </div>
          <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
            <p className="text-xs font-semibold text-orange-600 uppercase mb-1">Engajamento</p>
            <p className="text-sm text-foreground">As análises de refeições aumentaram 24%, mostrando maior utilização das funcionalidades.</p>
          </div>
          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">Recomendação</p>
            <p className="text-sm text-foreground">Considera aumentar a promoção do plano Familiar para capturar mais receita.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
