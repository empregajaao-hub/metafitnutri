import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Activity, PieChart } from "lucide-react";

interface AdminAnalyticsProps {
  monthlyData: Array<{ month: string; users: number; analyses: number }>;
}

export const AdminAnalytics = ({ monthlyData }: AdminAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Trend */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Crescimento de Utilizadores
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Novos registos nos últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+15%</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  name="Novos Utilizadores" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Analyses per Month */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Atividade de Análise
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Refeições processadas pela IA</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+22%</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="analyses" 
                  fill="#F97316" 
                  radius={[4, 4, 0, 0]} 
                  name="Análises" 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold text-foreground">Distribuição de Planos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Individual</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-foreground">45%</p>
              <p className="text-xs text-muted-foreground mb-1">dos subscritores</p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-3">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Familiar</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-foreground">35%</p>
              <p className="text-xs text-muted-foreground mb-1">dos subscritores</p>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-1.5 mt-3">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Profissional</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-foreground">20%</p>
              <p className="text-xs text-muted-foreground mb-1">dos subscritores</p>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-1.5 mt-3">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
