import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Users, CreditCard, Activity, TrendingUp, CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalAnalyses: 0,
    activeSubs: 0,
    pendingPayments: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Total Users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 2. Total Revenue & Pending Payments
      const { data: payments } = await supabase
        .from("Pagamentos")
        .select("Valor, estado");

      const revenue = payments
        ?.filter(p => p.estado === "approved" || p.estado === "completed")
        .reduce((sum, p) => sum + Number(p.Valor || 0), 0) || 0;

      const pending = payments?.filter(p => p.estado === "pending").length || 0;

      // 3. Total Analyses
      const { count: analysesCount } = await supabase
        .from("meal_analyses")
        .select("*", { count: "exact", head: true });

      // 4. Active Subscriptions
      const { count: activeSubsCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("plan", "free");

      // 5. Conversion Rate (Premium / Total)
      const conversion = userCount && userCount > 0 
        ? ((activeSubsCount || 0) / userCount) * 100 
        : 0;

      setStats({
        totalUsers: userCount || 0,
        totalRevenue: revenue,
        totalAnalyses: analysesCount || 0,
        activeSubs: activeSubsCount || 0,
        pendingPayments: pending,
        conversionRate: conversion,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema MetaFitNutri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Utilizadores"
          value={stats.totalUsers.toLocaleString()}
          description="Utilizadores registados"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Receita Total"
          value={`${stats.totalRevenue.toLocaleString()} Kz`}
          description="Pagamentos aprovados"
          icon={CreditCard}
          variant="success"
        />
        <StatCard
          title="Análises Realizadas"
          value={stats.totalAnalyses.toLocaleString()}
          description="Refeições analisadas"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Subscrições Ativas"
          value={stats.activeSubs.toLocaleString()}
          description="Planos em vigor"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Pagamentos Pendentes"
          value={stats.pendingPayments.toLocaleString()}
          description="À espera de revisão"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate.toFixed(1)}%`}
          description="Grátis para Premium"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Crescimento de Utilizadores</h2>
            <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses (Simulação)</p>
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

        <Card className="p-6 border border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Distribuição de Planos</h2>
            <p className="text-sm text-muted-foreground mt-1">Utilizadores por plano (Simulação)</p>
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
    </div>
  );
}
