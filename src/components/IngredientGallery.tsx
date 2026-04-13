import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Flame, Leaf, Apple, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ingredient {
  id: string;
  name: string;
  category: "frutas" | "frutos" | "legumes";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  portion: string;
  emoji: string;
}

const ingredients: Ingredient[] = [
  // Frutas
  { id: "banana", name: "Banana", category: "frutas", calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, portion: "100g (1 média)", emoji: "🍌" },
  { id: "maca", name: "Maçã", category: "frutas", calories: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2, portion: "100g (1 média)", emoji: "🍎" },
  { id: "laranja", name: "Laranja", category: "frutas", calories: 47, protein_g: 0.9, carbs_g: 12, fat_g: 0.1, portion: "100g (1 média)", emoji: "🍊" },
  { id: "morango", name: "Morango", category: "frutas", calories: 32, protein_g: 0.8, carbs_g: 8, fat_g: 0.3, portion: "100g (10 unid)", emoji: "🍓" },
  { id: "melancia", name: "Melancia", category: "frutas", calories: 30, protein_g: 0.6, carbs_g: 8, fat_g: 0.2, portion: "100g", emoji: "🍉" },
  { id: "melao", name: "Melão", category: "frutas", calories: 34, protein_g: 0.8, carbs_g: 8, fat_g: 0.2, portion: "100g", emoji: "🍈" },
  { id: "pera", name: "Pera", category: "frutas", calories: 57, protein_g: 0.4, carbs_g: 15, fat_g: 0.1, portion: "100g (1 média)", emoji: "🍐" },
  { id: "uva", name: "Uva", category: "frutas", calories: 67, protein_g: 0.7, carbs_g: 17, fat_g: 0.2, portion: "100g", emoji: "🍇" },
  { id: "abacaxi", name: "Abacaxi", category: "frutas", calories: 50, protein_g: 0.5, carbs_g: 13, fat_g: 0.1, portion: "100g", emoji: "🍍" },
  { id: "manga", name: "Manga", category: "frutas", calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4, portion: "100g", emoji: "🥭" },

  // Frutos Secos
  { id: "amendoim", name: "Amendoim", category: "frutos", calories: 567, protein_g: 25.8, carbs_g: 16, fat_g: 49, portion: "100g", emoji: "🥜" },
  { id: "amendoa", name: "Amêndoa", category: "frutos", calories: 579, protein_g: 21.2, carbs_g: 22, fat_g: 50, portion: "100g", emoji: "🌰" },
  { id: "castanha", name: "Castanha do Pará", category: "frutos", calories: 656, protein_g: 14.3, carbs_g: 12, fat_g: 66, portion: "100g", emoji: "🌰" },
  { id: "noz", name: "Noz", category: "frutos", calories: 654, protein_g: 9.3, carbs_g: 14, fat_g: 65, portion: "100g", emoji: "🥜" },
  { id: "coco", name: "Coco Seco", category: "frutos", calories: 354, protein_g: 3.3, carbs_g: 9, fat_g: 35, portion: "100g", emoji: "🥥" },
  { id: "tâmara", name: "Tâmara", category: "frutos", calories: 282, protein_g: 2.5, carbs_g: 75, fat_g: 0.2, portion: "100g", emoji: "🍯" },

  // Legumes
  { id: "tomate", name: "Tomate", category: "legumes", calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, portion: "100g (1 médio)", emoji: "🍅" },
  { id: "cenoura", name: "Cenoura", category: "legumes", calories: 41, protein_g: 0.9, carbs_g: 10, fat_g: 0.2, portion: "100g", emoji: "🥕" },
  { id: "alface", name: "Alface", category: "legumes", calories: 15, protein_g: 1.2, carbs_g: 2.9, fat_g: 0.2, portion: "100g", emoji: "🥬" },
  { id: "brocolis", name: "Brócolis", category: "legumes", calories: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4, portion: "100g", emoji: "🥦" },
  { id: "couve", name: "Couve", category: "legumes", calories: 49, protein_g: 4.3, carbs_g: 9, fat_g: 0.6, portion: "100g", emoji: "🥬" },
  { id: "cebola", name: "Cebola", category: "legumes", calories: 40, protein_g: 1.1, carbs_g: 9, fat_g: 0.1, portion: "100g", emoji: "🧅" },
  { id: "alho", name: "Alho", category: "legumes", calories: 149, protein_g: 6.4, carbs_g: 33, fat_g: 0.5, portion: "100g", emoji: "🧄" },
  { id: "pimentao", name: "Pimentão", category: "legumes", calories: 31, protein_g: 1, carbs_g: 6, fat_g: 0.3, portion: "100g", emoji: "🫑" },
  { id: "abobora", name: "Abóbora", category: "legumes", calories: 26, protein_g: 1, carbs_g: 6, fat_g: 0.1, portion: "100g", emoji: "🎃" },
  { id: "espinafre", name: "Espinafre", category: "legumes", calories: 23, protein_g: 2.7, carbs_g: 3.6, fat_g: 0.4, portion: "100g", emoji: "🥬" },
];

interface IngredientGalleryProps {
  onSelectIngredient?: (ingredient: Ingredient) => void;
}

const IngredientGallery = ({ onSelectIngredient }: IngredientGalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<"frutas" | "frutos" | "legumes">("frutas");
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  const categories = [
    { id: "frutas", label: "Frutas", icon: Apple, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "frutos", label: "Frutos Secos", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "legumes", label: "Legumes", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const filteredIngredients = ingredients.filter(ing => ing.category === selectedCategory);

  if (!showGallery) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setShowGallery(true)}
          className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-secondary"
        >
          📚 Galeria de Ingredientes
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight">Galeria de Ingredientes</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGallery(false)}
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`p-4 rounded-2xl font-black text-sm transition-all ${
                selectedCategory === cat.id
                  ? `${cat.bg} ring-2 ring-offset-2 ring-offset-background ring-${cat.color.split('-')[1]}-500`
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${cat.color}`} />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {filteredIngredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-4 border-none cursor-pointer transition-all rounded-2xl shadow-md ${
                  expandedIngredient === ingredient.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => setExpandedIngredient(expandedIngredient === ingredient.id ? null : ingredient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ingredient.emoji}</span>
                    <div className="text-left">
                      <p className="font-black text-sm text-foreground">{ingredient.name}</p>
                      <p className="text-[10px] font-bold text-primary">{ingredient.calories} kcal</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedIngredient === ingredient.id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {expandedIngredient === ingredient.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 rounded-lg bg-primary/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Proteína</p>
                            <p className="text-sm font-black text-primary">{ingredient.protein_g}g</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-secondary/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Carbs</p>
                            <p className="text-sm font-black text-secondary">{ingredient.carbs_g}g</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-accent/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Gordura</p>
                            <p className="text-sm font-black text-accent">{ingredient.fat_g}g</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Porção</p>
                            <p className="text-[10px] font-black text-foreground">{ingredient.portion}</p>
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIngredient?.(ingredient);
                            setShowGallery(false);
                          }}
                          className="w-full h-10 rounded-xl font-black text-sm"
                        >
                          Usar Ingrediente
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default IngredientGallery;
