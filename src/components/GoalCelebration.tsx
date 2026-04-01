import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, X, Sparkles, Star, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoalCelebrationProps {
  show: boolean;
  type: "daily_goal" | "account_created";
  userName?: string;
  calories?: number;
  onClose: () => void;
}

const GoalCelebration = ({ show, type, userName, calories, onClose }: GoalCelebrationProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['hsl(205,100%,55%)', 'hsl(142,71%,45%)', 'hsl(270,80%,65%)', 'hsl(45,100%,55%)', 'hsl(340,80%,60%)'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    }
  }, [show]);

  const handleShare = async () => {
    const text = type === "daily_goal"
      ? `🏆 Completei a minha meta diária de ${calories || 0} kcal no METAFIT! 💪🔥 #METAFIT #Saúde #Angola`
      : `🎉 Acabei de criar a minha conta no METAFIT NUTRI! O único app que analisa comida pronta e ingredientes crus com IA! 🇦🇴 #METAFIT`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "METAFIT NUTRI", text, url: window.location.origin });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'hsla(0,0%,0%,0.85)', backdropFilter: 'blur(12px)' }}
        >
          {/* Confetti particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: -20, x: `${p.x}vw`, scale: 0 }}
              animate={{ opacity: [0, 1, 0], y: '100vh', scale: [0, 1.5, 0.5], rotate: [0, 360, 720] }}
              transition={{ duration: 2.5, delay: p.delay, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{ background: p.color, left: `${p.x}%`, top: 0 }}
            />
          ))}

          {/* Close */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'hsla(0,0%,100%,0.1)' }}
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-center max-w-sm mx-auto"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, hsla(45,100%,55%,0.2), hsla(340,80%,60%,0.2))' }}
            >
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: 'linear-gradient(135deg, hsl(45,100%,55%), hsl(340,80%,60%))' }} />
              {type === "daily_goal" ? (
                <Trophy className="w-14 h-14 text-yellow-400" />
              ) : (
                <PartyPopper className="w-14 h-14 text-yellow-400" />
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1 -left-3"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-3xl font-black mb-2"
              style={{
                background: 'linear-gradient(135deg, hsl(45,100%,60%), hsl(340,80%,65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {type === "daily_goal" ? "Meta Concluída!" : "Bem-vindo(a)!"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-base mb-2"
              style={{ color: 'hsl(0,0%,80%)' }}
            >
              {type === "daily_goal"
                ? `Parabéns ${userName || ""}! Conseguiste atingir a tua meta diária de ${calories || 0} kcal! 🔥`
                : `${userName || "Amigo(a)"}, a tua conta foi criada com sucesso! Começa já a tua jornada de saúde! 🇦🇴`
              }
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-xs mb-8"
              style={{ color: 'hsl(0,0%,55%)' }}
            >
              {type === "daily_goal"
                ? "Cada dia conta. A consistência é a chave do sucesso! 💪"
                : "O único app angolano que analisa comida pronta e ingredientes crus com IA! ✨"
              }
            </motion.p>

            {/* Share button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleShare}
                className="w-full rounded-full py-6 text-base font-bold gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(205 100% 50%), hsl(270 80% 60%))' }}
              >
                <Share2 className="w-5 h-5" />
                Partilhar nas Redes Sociais
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full rounded-full text-muted-foreground"
              >
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalCelebration;
