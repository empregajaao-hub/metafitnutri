import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLogEntry {
  id: string;
  admin: string;
  action: string;
  target: string;
  timestamp: string;
  status: "success" | "error" | "warning";
  details: string;
}

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - em produção, viria do Supabase
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: "1",
        admin: "Admin Principal",
        action: "Aprovação de Pagamento",
        target: "Utilizador #123",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        status: "success",
        details: "Pagamento de 5000 Kz aprovado para plano Individual",
      },
      {
        id: "2",
        admin: "Admin Principal",
        action: "Remoção de Utilizador",
        target: "Utilizador #456",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: "success",
        details: "Utilizador inativo removido do sistema",
      },
      {
        id: "3",
        admin: "Admin Secundário",
        action: "Envio de Notificação",
        target: "Todos os Utilizadores",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        status: "success",
        details: "Notificação push enviada para 250 utilizadores",
      },
      {
        id: "4",
        admin: "Admin Principal",
        action: "Edição de Subscrição",
        target: "Utilizador #789",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: "success",
        details: "Plano alterado de Familiar para Profissional",
      },
      {
        id: "5",
        admin: "Admin Secundário",
        action: "Rejeição de Pagamento",
        target: "Utilizador #321",
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        status: "warning",
        details: "Comprovativo não corresponde ao valor declarado",
      },
      {
        id: "6",
        admin: "Admin Principal",
        action: "Acesso ao Painel",
        target: "Painel de Administração",
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        status: "success",
        details: "Login bem-sucedido no painel administrativo",
      },
      {
        id: "7",
        admin: "Admin Secundário",
        action: "Erro de Operação",
        target: "Utilizador #654",
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
        status: "error",
        details: "Falha ao atualizar perfil do utilizador",
      },
      {
        id: "8",
        admin: "Admin Principal",
        action: "Exportação de Dados",
        target: "Relatório de Utilizadores",
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
        status: "success",
        details: "Relatório CSV com 250 utilizadores exportado",
      },
    ];
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Aprovação de Pagamento":
      case "Edição de Subscrição":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Remoção de Utilizador":
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case "Envio de Notificação":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "Acesso ao Painel":
        return <Eye className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: "success" | "error" | "warning") => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Sucesso
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            Erro
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Aviso
          </Badge>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;

    return date.toLocaleDateString("pt-PT");
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Registo de Auditoria
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Histórico completo de todas as ações administrativas
            </p>
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Logs
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Procurar por admin, utilizador ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Ações</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ação
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Administrador
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Alvo
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Detalhes
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-foreground">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 text-xs">
                        {log.admin.charAt(0)}
                      </div>
                      <span className="text-sm text-foreground">{log.admin}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {log.target}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTime(log.timestamp)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border mt-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Nenhum registo encontrado
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tenta ajustar os teus filtros.
            </p>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-border/50 bg-gradient-to-br from-green-500/5 to-card/50 backdrop-blur-sm border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Operações Bem-Sucedidas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {logs.filter((l) => l.status === "success").length}
          </p>
          <p className="text-xs text-green-600 mt-2">
            {((logs.filter((l) => l.status === "success").length / logs.length) * 100).toFixed(1)}% de sucesso
          </p>
        </Card>

        <Card className="p-5 border-border/50 bg-gradient-to-br from-yellow-500/5 to-card/50 backdrop-blur-sm border-yellow-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Avisos</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {logs.filter((l) => l.status === "warning").length}
          </p>
          <p className="text-xs text-yellow-600 mt-2">Requerem atenção</p>
        </Card>

        <Card className="p-5 border-border/50 bg-gradient-to-br from-red-500/5 to-card/50 backdrop-blur-sm border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Erros</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {logs.filter((l) => l.status === "error").length}
          </p>
          <p className="text-xs text-red-600 mt-2">Requerem investigação</p>
        </Card>
      </div>
    </div>
  );
};
