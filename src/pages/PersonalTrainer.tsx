import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users, 
  Plus, 
  Dumbbell, 
  Utensils, 
  Trash2, 
  Edit,
  User,
  Phone,
  Mail,
  FileDown,
  Crown,
  Loader2,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import { generateWorkoutPDF, generateMealPDF } from "@/utils/pdfGenerator";

interface Student {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string;
  activity_level: string | null;
  notes: string | null;
  created_at: string;
}

const PersonalTrainer = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    goal: "lose_weight",
    activity_level: "moderate",
    notes: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get trainer name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      setTrainerName(profile?.full_name || "Personal Trainer");

      // Check if user has personal_trainer subscription
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("plan, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      // Cast plan to string for comparison since TypeScript types may not be updated yet
      const userPlan = subscription?.plan as string;
      if (userPlan === "personal_trainer") {
        setHasAccess(true);
        fetchStudents();
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trainer_students")
        .select("*")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.goal) {
      toast({
        title: "Erro",
        description: "Nome e objetivo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const studentData = {
        trainer_id: user.id,
        full_name: formData.full_name,
        phone: formData.phone || null,
        email: formData.email || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        goal: formData.goal,
        activity_level: formData.activity_level || null,
        notes: formData.notes || null,
      };

      if (editingStudent) {
        const { error } = await supabase
          .from("trainer_students")
          .update(studentData)
          .eq("id", editingStudent.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Aluno atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("trainer_students")
          .insert([studentData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Aluno cadastrado com sucesso!" });
      }

      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trainer_students")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Aluno removido com sucesso!" });
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      email: "",
      age: "",
      weight: "",
      height: "",
      goal: "lose_weight",
      activity_level: "moderate",
      notes: "",
    });
    setEditingStudent(null);
    setIsAddDialogOpen(false);
  };

  const editStudent = (student: Student) => {
    setFormData({
      full_name: student.full_name,
      phone: student.phone || "",
      email: student.email || "",
      age: student.age?.toString() || "",
      weight: student.weight?.toString() || "",
      height: student.height?.toString() || "",
      goal: student.goal,
      activity_level: student.activity_level || "moderate",
      notes: student.notes || "",
    });
    setEditingStudent(student);
    setIsAddDialogOpen(true);
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "lose_weight": return "Perder Peso";
      case "gain_weight": return "Ganhar Massa";
      case "maintain": return "Manter Peso";
      default: return goal;
    }
  };

  const generateAndDownloadPDF = async (student: Student, planType: "workout" | "meal") => {
    setGeneratingPlan(`${student.id}-${planType}`);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-trainer-plan", {
        body: {
          student: {
            name: student.full_name,
            age: student.age,
            weight: student.weight,
            height: student.height,
            goal: student.goal,
            activityLevel: student.activity_level,
          },
          trainerName,
          planType,
        },
      });

      if (error) throw error;

      const studentData = {
        full_name: student.full_name,
        phone: student.phone,
        email: student.email,
        age: student.age,
        weight: student.weight,
        height: student.height,
        goal: student.goal,
        activity_level: student.activity_level,
      };

      if (planType === "workout") {
        generateWorkoutPDF(studentData, trainerName, data.plan);
      } else {
        generateMealPDF(studentData, trainerName, data.plan);
      }
      
      toast({
        title: "PDF Gerado!",
        description: `Plano de ${planType === "workout" ? "treino" : "alimentação"} descarregado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o plano. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Pacote Personal Trainer</CardTitle>
              <p className="text-muted-foreground">
                Gestão completa dos teus alunos com planos personalizados
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Cadastro de Alunos</p>
                    <p className="text-sm text-muted-foreground">
                      Regista todos os teus alunos com os seus dados e objetivos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Dumbbell className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Planos de Treino</p>
                    <p className="text-sm text-muted-foreground">
                      Gera planos de treino personalizados para cada aluno
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Planos Alimentares</p>
                    <p className="text-sm text-muted-foreground">
                      Cria planos alimentares baseados nos objetivos de cada aluno
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Partilha via WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      Envia PDFs elegantes diretamente para o WhatsApp do aluno
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-primary mb-1">5.000 Kz</p>
                <p className="text-sm text-muted-foreground">/mês</p>
              </div>

              <Button 
                variant="hero" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/payment?plan=personal_trainer")}
              >
                Ativar Pacote Personal Trainer
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ativação em menos de 1 hora após pagamento
              </p>
            </CardContent>
          </Card>
        </div>
        <AIAssistant />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Meus Alunos
            </h1>
            <p className="text-muted-foreground">
              {students.length} {students.length === 1 ? "aluno" : "alunos"} cadastrados
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Editar Aluno" : "Cadastrar Novo Aluno"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nome do aluno"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="244..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="170"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">Objetivo *</Label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value) => setFormData({ ...formData, goal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Perder Peso</SelectItem>
                      <SelectItem value="gain_weight">Ganhar Massa Muscular</SelectItem>
                      <SelectItem value="maintain">Manter Peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activity_level">Nível de Atividade</Label>
                  <Select
                    value={formData.activity_level}
                    onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentário</SelectItem>
                      <SelectItem value="light">Leve (1-2x/semana)</SelectItem>
                      <SelectItem value="moderate">Moderado (3-4x/semana)</SelectItem>
                      <SelectItem value="active">Ativo (5-6x/semana)</SelectItem>
                      <SelectItem value="very_active">Muito Ativo (Diário)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Lesões, preferências, restrições alimentares..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingStudent ? "Atualizar Aluno" : "Cadastrar Aluno"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum aluno cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Começa a adicionar os teus alunos para gerir os seus planos
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Aluno
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getGoalLabel(student.goal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editStudent(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tens a certeza que queres remover {student.full_name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(student.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Student Info */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {student.age && (
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground text-xs">Idade</p>
                        <p className="font-semibold">{student.age}</p>
                      </div>
                    )}
                    {student.weight && (
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground text-xs">Peso</p>
                        <p className="font-semibold">{student.weight} kg</p>
                      </div>
                    )}
                    {student.height && (
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground text-xs">Altura</p>
                        <p className="font-semibold">{student.height} cm</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm">
                    {student.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAndDownloadPDF(student, "workout")}
                      disabled={generatingPlan === `${student.id}-workout`}
                    >
                      {generatingPlan === `${student.id}-workout` ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 mr-1" />
                      )}
                      PDF Treino
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAndDownloadPDF(student, "meal")}
                      disabled={generatingPlan === `${student.id}-meal`}
                    >
                      {generatingPlan === `${student.id}-meal` ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 mr-1" />
                      )}
                      PDF Alimentação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AIAssistant />
      <MobileBottomNav />
    </div>
  );
};

export default PersonalTrainer;