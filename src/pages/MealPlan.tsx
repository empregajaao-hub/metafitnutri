import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Sun, Cookie, Moon, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MealPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const mealPlan = [
    {
      meal: "Pequeno-almoço",
      time: "07:00 - 09:00",
      icon: Coffee,
      food: "Papa de milho com leite + banana + amendoim torrado",
      calories: 420,
      protein: 15,
      carbs: 65,
      fat: 12,
    },
    {
      meal: "Almoço",
      time: "12:00 - 14:00",
      icon: Sun,
      food: "Funge de bombó com calulu de peixe e feijão de óleo",
      calories: 650,
      protein: 35,
      carbs: 75,
      fat: 18,
    },
    {
      meal: "Lanche",
      time: "16:00 - 17:00",
      icon: Cookie,
      food: "Batata doce assada + ginguba (amendoim)",
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 9,
    },
    {
      meal: "Jantar",
      time: "19:00 - 21:00",
      icon: Moon,
      food: "Frango grelhado com mandioca cozida e quizaca",
      calories: 520,
      protein: 42,
      carbs: 48,
      fat: 14,
    },
  ];

  const totalCalories = mealPlan.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = mealPlan.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = mealPlan.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = mealPlan.reduce((sum, m) => sum + m.fat, 0);

  const handleExportPDF = async () => {
    setExporting(true);
    
    try {
      // Create PDF content as HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-AO">
        <head>
          <meta charset="UTF-8">
          <title>Plano de Refeições METAFIT</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: #FCF8F3; 
              padding: 40px;
              color: #1a1a2e;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #0EA5E9;
            }
            .header h1 { 
              color: #0EA5E9; 
              font-size: 28px; 
              margin-bottom: 8px;
            }
            .header p { color: #666; font-size: 14px; }
            .summary { 
              background: linear-gradient(135deg, #0EA5E9 0%, #38bdf8 100%);
              color: white;
              padding: 24px;
              border-radius: 16px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .summary-calories { font-size: 32px; font-weight: bold; }
            .summary-label { font-size: 14px; opacity: 0.9; }
            .macros { display: flex; gap: 24px; }
            .macro { text-align: center; }
            .macro-value { font-size: 20px; font-weight: bold; }
            .macro-label { font-size: 12px; opacity: 0.8; }
            .meal-card { 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 16px;
              display: flex;
              gap: 16px;
            }
            .meal-icon { 
              width: 48px; 
              height: 48px; 
              background: linear-gradient(135deg, #0EA5E9 0%, #38bdf8 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              flex-shrink: 0;
            }
            .meal-content { flex: 1; }
            .meal-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .meal-name { font-weight: 600; font-size: 16px; }
            .meal-time { color: #666; font-size: 13px; }
            .meal-calories { 
              font-size: 20px; 
              font-weight: bold; 
              color: #0EA5E9;
              text-align: right;
            }
            .meal-food { color: #333; margin-bottom: 10px; font-size: 14px; }
            .meal-macros { display: flex; gap: 16px; font-size: 13px; }
            .meal-macros span { display: flex; align-items: center; gap: 4px; }
            .protein { color: #10b981; }
            .carbs { color: #f59e0b; }
            .fat { color: #f97316; }
            .footer { 
              text-align: center; 
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #666;
              font-size: 12px;
            }
            .footer strong { color: #0EA5E9; }
            @media print {
              body { padding: 20px; }
              .meal-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍽️ Plano de Refeições METAFIT</h1>
            <p>Plano diário adaptado aos ingredientes angolanos e ao teu objetivo</p>
          </div>
          
          <div class="summary">
            <div>
              <div class="summary-label">Total Diário</div>
              <div class="summary-calories">${totalCalories.toLocaleString('pt-AO')} kcal</div>
            </div>
            <div class="macros">
              <div class="macro">
                <div class="macro-value">${totalProtein}g</div>
                <div class="macro-label">Proteínas</div>
              </div>
              <div class="macro">
                <div class="macro-value">${totalCarbs}g</div>
                <div class="macro-label">Carbos</div>
              </div>
              <div class="macro">
                <div class="macro-value">${totalFat}g</div>
                <div class="macro-label">Gorduras</div>
              </div>
            </div>
          </div>
          
          ${mealPlan.map(meal => `
            <div class="meal-card">
              <div class="meal-icon">
                ${meal.meal === 'Pequeno-almoço' ? '☕' : meal.meal === 'Almoço' ? '☀️' : meal.meal === 'Lanche' ? '🍪' : '🌙'}
              </div>
              <div class="meal-content">
                <div class="meal-header">
                  <div>
                    <div class="meal-name">${meal.meal}</div>
                    <div class="meal-time">${meal.time}</div>
                  </div>
                  <div class="meal-calories">${meal.calories} kcal</div>
                </div>
                <div class="meal-food">${meal.food}</div>
                <div class="meal-macros">
                  <span class="protein">🥩 ${meal.protein}g</span>
                  <span class="carbs">🍞 ${meal.carbs}g</span>
                  <span class="fat">🥑 ${meal.fat}g</span>
                </div>
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Gerado por <strong>METAFIT</strong> • ${new Date().toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Este plano é personalizado para o teu objetivo e pode ser ajustado.</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing as PDF
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
        
        toast({
          title: "PDF Pronto!",
          description: "Use Ctrl+P ou Cmd+P para guardar como PDF.",
        });
      } else {
        // Fallback: download as HTML
        const link = document.createElement('a');
        link.href = url;
        link.download = `Plano_Refeicoes_METAFIT_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Ficheiro Guardado!",
          description: "Abre o ficheiro HTML no navegador e imprime como PDF.",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o plano.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Plano de Refeições Angolano
            </h1>
            <p className="text-muted-foreground">
              Plano diário adaptado aos ingredientes locais e ao teu objetivo
            </p>
          </div>

          <Card className="p-6 mb-6 bg-primary/10 border-primary">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Diário
                </p>
                <p className="text-3xl font-bold text-primary">{totalCalories.toLocaleString('pt-AO')} kcal</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Proteínas</p>
                  <p className="text-xl font-bold text-secondary">{totalProtein}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carbos</p>
                  <p className="text-xl font-bold text-accent">{totalCarbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gorduras</p>
                  <p className="text-xl font-bold text-orange-500">{totalFat}g</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {mealPlan.map((meal) => {
              const Icon = meal.icon;
              return (
                <Card key={meal.meal} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {meal.meal}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {meal.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {meal.calories}
                          </p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                      </div>
                      <p className="text-foreground mb-3">{meal.food}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-secondary">
                          🥩 {meal.protein}g
                        </span>
                        <span className="text-accent">🍞 {meal.carbs}g</span>
                        <span className="text-orange-500">
                          🥑 {meal.fat}g
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Este plano é personalizado para o teu objetivo e pode ser ajustado
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Ajustar Objetivo
              </Button>
              <Button variant="hero" onClick={handleExportPDF} disabled={exporting}>
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A exportar...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default MealPlan;
