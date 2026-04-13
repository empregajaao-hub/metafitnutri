import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChefHat,
  Eye,
  Trash2,
  MoreVertical,
  Filter,
  Clock,
  Flame,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recipe {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  prepTime: number;
  status: "approved" | "pending" | "rejected";
  createdDate: string;
  views: number;
}

const mockRecipes: Recipe[] = [
  {
    id: "R001",
    name: "Frango Grelhado com Legumes",
    category: "lunch",
    calories: 450,
    protein: 35,
    prepTime: 25,
    status: "approved",
    createdDate: "2024-04-10",
    views: 234,
  },
  {
    id: "R002",
    name: "Omelete de Espinafre",
    category: "breakfast",
    calories: 280,
    protein: 18,
    prepTime: 10,
    status: "pending",
    createdDate: "2024-04-12",
    views: 45,
  },
  {
    id: "R003",
    name: "Salada de Atum",
    category: "lunch",
    calories: 320,
    protein: 28,
    prepTime: 15,
    status: "approved",
    createdDate: "2024-04-08",
    views: 567,
  },
  {
    id: "R004",
    name: "Smoothie de Proteína",
    category: "snack",
    calories: 180,
    protein: 20,
    prepTime: 5,
    status: "approved",
    createdDate: "2024-04-11",
    views: 890,
  },
  {
    id: "R005",
    name: "Peixe com Batata Doce",
    category: "dinner",
    calories: 520,
    protein: 42,
    prepTime: 30,
    status: "rejected",
    createdDate: "2024-04-09",
    views: 123,
  },
];

const getCategoryLabel = (category: string) => {
  const categories = {
    breakfast: "Pequeno-almoço",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
  };
  return categories[category as keyof typeof categories] || category;
};

const getStatusBadge = (status: string) => {
  const statuses = {
    approved: { label: "Aprovada", color: "bg-success/10 text-success border-success/20" },
    pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
    rejected: { label: "Rejeitada", color: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  return statuses[status as keyof typeof statuses] || { label: status, color: "" };
};

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipes = mockRecipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(recipe.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mockRecipes.length,
    approved: mockRecipes.filter((r) => r.status === "approved").length,
    pending: mockRecipes.filter((r) => r.status === "pending").length,
    totalViews: mockRecipes.reduce((sum, r) => sum + r.views, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Receitas</h1>
        <p className="text-muted-foreground">Gestão de receitas geradas pela IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total de Receitas</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-success/10">
              <Badge className="bg-success/20 text-success border-0">✓</Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
          </div>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
          </div>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Procurar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => {
          const statusInfo = getStatusBadge(recipe.status);
          return (
            <Card key={recipe.id} className="border border-border/50 overflow-hidden hover:shadow-elevated transition-smooth">
              {/* Recipe Header */}
              <div className="p-6 border-b border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{recipe.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(recipe.category)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Receita
                      </DropdownMenuItem>
                      {recipe.status === "pending" && (
                        <>
                          <DropdownMenuItem className="text-success">
                            ✓ Aprovar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            ✕ Rejeitar
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Badge */}
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>

              {/* Recipe Info */}
              <div className="p-6 space-y-4">
                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Calorias</p>
                      <p className="text-sm font-semibold text-foreground">{recipe.calories}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Proteína</p>
                      <p className="text-sm font-semibold text-foreground">{recipe.protein}g</p>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {recipe.prepTime} min
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {recipe.views} visualizações
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <Card className="p-12 border border-dashed border-border text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground">Nenhuma receita encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">Tenta ajustar os teus termos de pesquisa.</p>
        </Card>
      )}
    </div>
  );
}
