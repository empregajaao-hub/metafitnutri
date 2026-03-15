import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChefHat, Target, Globe, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import flashcardRaw from "@/assets/flashcard-raw-ingredients.jpg";
import flashcardCooked from "@/assets/flashcard-cooked-meal.jpg";
import flashcardLifestyle from "@/assets/flashcard-lifestyle.jpg";
import flashcardMarket from "@/assets/flashcard-market.jpg";

interface FlashCard {
  id: number;
  image: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  highlight: string;
  description: string;
  accentColor: string;
}

const cards: FlashCard[] = [
  {
    id: 1,
    image: flashcardRaw,
    badge: "EXCLUSIVO MUNDIAL",
    badgeIcon: <Globe className="w-3 h-3" />,
    title: "Ingredientes Crus → Receita Completa",
    highlight: "Único no mundo",
    description: "Tira foto dos ingredientes crus e recebe receitas com quantidades exactas adaptadas à tua meta.",
    accentColor: "from-primary to-accent",
  },
  {
    id: 2,
    image: flashcardCooked,
    badge: "IA AVANÇADA",
    badgeIcon: <Camera className="w-3 h-3" />,
    title: "Comida Pronta → Análise Instant",
    highlight: "Foto → Macros em segundos",
    description: "Fotografa o prato pronto e a IA calcula calorias, proteínas, hidratos e gorduras na hora.",
    accentColor: "from-secondary to-primary",
  },
  {
    id: 3,
    image: flashcardLifestyle,
    badge: "PERSONALIZADO",
    badgeIcon: <Target className="w-3 h-3" />,
    title: "Receitas para a Tua Meta",
    highlight: "Perder · Manter · Ganhar",
    description: "Cada receita é ajustada ao teu objetivo — seja perder peso, manter ou ganhar massa muscular.",
    accentColor: "from-accent to-primary",
  },
  {
    id: 4,
    image: flashcardMarket,
    badge: "100% ANGOLANO",
    badgeIcon: <ChefHat className="w-3 h-3" />,
    title: "Do Mercado à Tua Mesa",
    highlight: "Ingredientes locais",
    description: "Receitas com ingredientes do mercado angolano. Funge, moamba, kissaca — tudo adaptado à tua meta.",
    accentColor: "from-primary to-secondary",
  },
];

const FlashCards = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      const next = prev + newDirection;
      if (next < 0) return cards.length - 1;
      if (next >= cards.length) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => paginate(1), 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate]);

  const card = cards[current];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 280 : -280,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 280 : -280,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Porquê o METAFIT?
        </span>
      </div>

      {/* Card container */}
      <div
        className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg"
        onPointerDown={() => setIsAutoPlaying(false)}
        onPointerUp={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={card.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${card.accentColor} text-[10px] font-bold tracking-wider text-primary-foreground shadow-md`}>
                  {card.badgeIcon}
                  {card.badge}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 -mt-4 relative z-10">
              <h3 className="text-base font-bold text-foreground leading-tight mb-1">
                {card.title}
              </h3>
              <p className={`text-xs font-semibold bg-gradient-to-r ${card.accentColor} bg-clip-text text-transparent mb-2`}>
                {card.highlight}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={() => { setIsAutoPlaying(false); paginate(-1); }}
          className="absolute left-2 top-[70px] w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
          aria-label="Anterior"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setIsAutoPlaying(false); paginate(1); }}
          className="absolute right-2 top-[70px] w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
          aria-label="Próximo"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoPlaying(false);
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className="relative"
            aria-label={`Flashcard ${i + 1}`}
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FlashCards;
