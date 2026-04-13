import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Award,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  full_name: string | null;
  email?: string;
  phone?: string | null;
  created_at: string;
  total_analyses: number;
  subscription_plan?: string;
  is_active?: boolean;
}

interface AdminUsersAdvancedProps {
  users: User[];
  onRefresh: () => void;
}

export const AdminUsersAdvanced = ({
  users,
  onRefresh,
}: AdminUsersAdvancedProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan =
      filterPlan === "all" ||
      (filterPlan === "premium" && user.subscription_plan !== "free") ||
      (filterPlan === "free" && user.subscription_plan === "free") ||
      user.subscription_plan === filterPlan;

    return matchesSearch && matchesPlan;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "active":
        return b.total_analyses - a.total_analyses;
      case "name":
        return (a.full_name || "").localeCompare(b.full_name || "");
      default:
        return 0;
    }
  });

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Utilizador Removido",
        description: `${userName} foi removido com sucesso.`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Nome", "Telefone", "Email", "Data Registo", "Análises", "Plano"],
      ...sortedUsers.map((u) => [
        u.full_name || "N/A",
        u.phone || "N/A",
        u.email || "N/A",
        new Date(u.created_at).toLocaleDateString("pt-PT"),
        u.total_analyses,
        u.subscription_plan || "N/A",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilizadores_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação Concluída",
      description: `${sortedUsers.length} utilizadores exportados.`,
    });
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === sortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sortedUsers.map((u) => u.id)));
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive === false) {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1">
          <Clock className="w-3 h-3" />
          Inativo
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
        <CheckCircle className="w-3 h-3" />
        Ativo
      </Badge>
    );
  };

  const getPlanBadge = (plan: string | undefined) => {
    const plans: Record<string, { bg: string; text: string; label: string }> = {
      free: { bg: "bg-gray-500/10", text: "text-gray-600", label: "Grátis" },
      essential: {
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        label: "Individual",
      },
      evolution: {
        bg: "bg-purple-500/10",
        text: "text-purple-600",
        label: "Familiar",
      },
      personal_trainer: {
        bg: "bg-pink-500/10",
        text: "text-pink-600",
        label: "Profissional",
      },
    };

    const planInfo = plans[plan || "free"] || plans.free;

    return (
      <Badge className={`${planInfo.bg} ${planInfo.text} border-current/20`}>
        {planInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Gestão de Utilizadores
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total de <span className="font-bold text-foreground">{users.length}</span> utilizadores registados.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Procurar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="oldest">Mais Antigos</SelectItem>
              <SelectItem value="active">Mais Ativos</SelectItem>
              <SelectItem value="name">Por Nome</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Planos</SelectItem>
              <SelectItem value="free">Grátis</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="essential">Individual</SelectItem>
              <SelectItem value="evolution">Familiar</SelectItem>
              <SelectItem value="personal_trainer">Profissional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {selectedUsers.size} utilizador(es) selecionado(s)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar Mensagem
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Notificação
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border/50"
                  />
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Atividade
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Registo
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-center py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-border/50"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-110 transition-transform">
                        {user.full_name
                          ? user.full_name.charAt(0).toUpperCase()
                          : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-foreground font-semibold text-sm">
                          {user.full_name || "Utilizador Sem Nome"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getPlanBadge(user.subscription_plan)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-sm font-bold text-foreground">
                        {user.total_analyses}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        análises
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.created_at).toLocaleDateString("pt-PT")}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        há{" "}
                        {Math.floor(
                          (Date.now() - new Date(user.created_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        dias
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(user.is_active)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center items-center">
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Opções</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Eye className="w-4 h-4 text-blue-500" />
                            Ver Perfil Completo
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Mail className="w-4 h-4 text-orange-500" />
                            Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="w-full text-left px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Remover Utilizador
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tens a certeza absoluta?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isto irá
                                  permanentemente remover o utilizador{" "}
                                  <strong>{user.full_name || "N/A"}</strong> e
                                  todos os seus dados do sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteUser(
                                      user.id,
                                      user.full_name || "Utilizador"
                                    )
                                  }
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Sim, Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border mt-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Nenhum utilizador encontrado
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tenta ajustar os teus termos de pesquisa.
            </p>
            <Button
              variant="link"
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Limpar pesquisa
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
