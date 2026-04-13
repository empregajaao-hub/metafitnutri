import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Award, Trash2, Phone, User, Filter, MoreVertical, Mail, ShieldCheck, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  full_name: string | null;
  email?: string;
  phone?: string | null;
  created_at: string;
  total_analyses: number;
}

interface AdminUsersProps {
  users: User[];
  onRefresh: () => void;
}

export const AdminUsers = ({ users, onRefresh }: AdminUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "active":
        return b.total_analyses - a.total_analyses;
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
      ["Nome", "Telefone", "Email", "Data Registo", "Análises"],
      ...sortedUsers.map(u => [
        u.full_name || "N/A",
        u.phone || "N/A",
        u.email || "N/A",
        new Date(u.created_at).toLocaleDateString("pt-PT"),
        u.total_analyses
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

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

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
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
          
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

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
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Atividade
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Registo
                </th>
                <th className="text-center py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-110 transition-transform">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-foreground font-semibold text-sm">{user.full_name || "Utilizador Sem Nome"}</p>
                        <div className="flex items-center gap-3 mt-1">
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
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-sm font-bold text-foreground">{user.total_analyses}</span>
                        <span className="text-[10px] text-muted-foreground">análises</span>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] py-0 h-5 bg-green-500/5 text-green-600 border-green-500/20">
                        Ativo
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.created_at).toLocaleDateString("pt-PT")}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        há {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                <AlertDialogTitle>Tens a certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isto irá permanentemente remover
                                  o utilizador <strong>{user.full_name || "N/A"}</strong> e todos os seus dados do sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id, user.full_name || "Utilizador")}
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
            <h3 className="text-lg font-medium text-foreground">Nenhum utilizador encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Tenta ajustar os teus termos de pesquisa.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
              Limpar pesquisa
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
