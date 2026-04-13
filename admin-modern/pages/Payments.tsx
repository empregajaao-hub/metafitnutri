import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreVertical,
  DollarSign,
  TrendingUp,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/StatCard";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  plan: "essential" | "evolution" | "personal_trainer";
  status: "pending" | "approved" | "rejected";
  date: string;
  receipt?: string;
}

const mockPayments: Payment[] = [
  {
    id: "P001",
    userId: "1",
    userName: "João Silva",
    userPhone: "+244 923 456 789",
    amount: 5000,
    plan: "evolution",
    status: "approved",
    date: "2024-04-10",
    receipt: "receipt_001.pdf",
  },
  {
    id: "P002",
    userId: "2",
    userName: "Maria Santos",
    userPhone: "+244 912 345 678",
    amount: 2500,
    plan: "essential",
    status: "pending",
    date: "2024-04-12",
    receipt: "receipt_002.pdf",
  },
  {
    id: "P003",
    userId: "4",
    userName: "Ana Oliveira",
    userPhone: "+244 945 678 901",
    amount: 15000,
    plan: "personal_trainer",
    status: "approved",
    date: "2024-04-08",
    receipt: "receipt_003.pdf",
  },
  {
    id: "P004",
    userId: "3",
    userName: "Pedro Costa",
    userPhone: "+244 934 567 890",
    amount: 2500,
    plan: "essential",
    status: "rejected",
    date: "2024-04-11",
    receipt: "receipt_004.pdf",
  },
  {
    id: "P005",
    userId: "5",
    userName: "Carlos Ferreira",
    userPhone: "+244 956 789 012",
    amount: 2500,
    plan: "essential",
    status: "pending",
    date: "2024-04-13",
    receipt: "receipt_005.pdf",
  },
];

const getPlanLabel = (plan: string) => {
  const plans = {
    essential: "Individual",
    evolution: "Familiar",
    personal_trainer: "Profissional",
  };
  return plans[plan as keyof typeof plans] || plan;
};

const getStatusBadge = (status: string) => {
  const statuses = {
    approved: { label: "Aprovado", variant: "default" as const, color: "bg-success/10 text-success border-success/20" },
    pending: { label: "Pendente", variant: "secondary" as const, color: "bg-warning/10 text-warning border-warning/20" },
    rejected: { label: "Rejeitado", variant: "destructive" as const, color: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  return statuses[status as keyof typeof statuses] || { label: status, variant: "secondary" as const, color: "" };
};

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = mockPayments.filter(
    (payment) =>
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userPhone.includes(searchTerm) ||
      payment.id.includes(searchTerm)
  );

  const stats = {
    approved: mockPayments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: mockPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    approvalRate: (
      (mockPayments.filter((p) => p.status === "approved").length / mockPayments.length) *
      100
    ).toFixed(1),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Pagamentos</h1>
        <p className="text-muted-foreground">Gestão de comprovativos e aprovações</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ganhos Aprovados"
          value={`${stats.approved.toLocaleString()} Kz`}
          description="Total de pagamentos aprovados"
          icon={DollarSign}
          trend={{ value: 12, direction: "up" }}
          variant="success"
        />
        <StatCard
          title="Em Análise"
          value={`${stats.pending.toLocaleString()} Kz`}
          description={`${mockPayments.filter((p) => p.status === "pending").length} pagamentos`}
          icon={Clock}
          trend={{ value: 3, direction: "down" }}
          variant="warning"
        />
        <StatCard
          title="Taxa de Aprovação"
          value={`${stats.approvalRate}%`}
          description="Comprovativos aprovados"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Search */}
      <Card className="p-6 border border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Procurar por nome, telefone ou ID de pagamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPayments.map((payment) => {
                const statusInfo = getStatusBadge(payment.status);
                return (
                  <tr key={payment.id} className="hover:bg-muted/20 transition-smooth group">
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-foreground">{payment.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {payment.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{payment.userName}</p>
                          <p className="text-xs text-muted-foreground">{payment.userPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-foreground">{getPlanLabel(payment.plan)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-foreground">
                        {payment.amount.toLocaleString()} Kz
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("pt-PT")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        {payment.receipt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ver comprovativo"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {payment.status === "pending" && (
                              <>
                                <DropdownMenuItem className="text-success">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.receipt && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Descarregar Comprovativo
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16 bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum pagamento encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Tenta ajustar os teus termos de pesquisa.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
