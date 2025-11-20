import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Sun, Cookie, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MealPlan = () => {
  const navigate = useNavigate();

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
                <p className="text-3xl font-bold text-primary">1.870 kcal</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Proteínas</p>
                  <p className="text-xl font-bold text-secondary">100g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carbos</p>
                  <p className="text-xl font-bold text-accent">233g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gorduras</p>
                  <p className="text-xl font-bold text-orange-500">53g</p>
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
              <Button variant="hero">Exportar PDF</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;