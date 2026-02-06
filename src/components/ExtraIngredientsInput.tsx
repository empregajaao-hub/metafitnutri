import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ChefHat, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExtraIngredientsInputProps {
  onIngredientsChange: (ingredients: string) => void;
  ingredients: string;
}

const ExtraIngredientsInput = ({ onIngredientsChange, ingredients }: ExtraIngredientsInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickIngredients, setQuickIngredients] = useState<string[]>([]);

  const commonIngredients = [
    "Sal", "Óleo", "Alho", "Cebola", "Tomate", "Pimento", 
    "Limão", "Coentros", "Louro", "Piri-piri", "Açúcar", "Arroz"
  ];

  const toggleQuickIngredient = (ingredient: string) => {
    const newList = quickIngredients.includes(ingredient)
      ? quickIngredients.filter(i => i !== ingredient)
      : [...quickIngredients, ingredient];
    
    setQuickIngredients(newList);
    
    // Combina ingredientes rápidos com texto livre
    const combined = [...newList, ingredients.split(',').filter(i => i.trim() && !commonIngredients.includes(i.trim()))].join(', ');
    onIngredientsChange(combined);
  };

  const handleTextChange = (text: string) => {
    onIngredientsChange(text);
  };

  return (
    <Card className="p-4 border-dashed border-2 border-border hover:border-primary/30 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground text-sm">Tens mais ingredientes em casa?</p>
            <p className="text-xs text-muted-foreground">Adiciona ingredientes que não estão na foto</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-transform ${isExpanded ? 'rotate-45' : ''}`}>
          <Plus className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Ingredientes rápidos */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Ingredientes comuns (toque para adicionar)
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonIngredients.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => toggleQuickIngredient(ingredient)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        quickIngredients.includes(ingredient)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {ingredient}
                      {quickIngredients.includes(ingredient) && (
                        <X className="w-3 h-3 ml-1 inline" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de texto livre */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Ou escreve outros ingredientes que tens disponíveis:
                </p>
                <Textarea
                  placeholder="Ex: frango, batata-doce, espinafres, leite de coco..."
                  value={ingredients}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>

              {/* Ingredientes selecionados */}
              {(quickIngredients.length > 0 || ingredients.trim()) && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-foreground mb-1">
                    ✅ Ingredientes adicionais:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[...quickIngredients, ...ingredients.split(',').map(i => i.trim()).filter(i => i && !commonIngredients.includes(i))].filter(Boolean).join(', ') || 'Nenhum'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ExtraIngredientsInput;
