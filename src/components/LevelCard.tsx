import { motion } from "framer-motion";
import { useUserLevel } from "@/hooks/useUserLevel";
import { Sparkles } from "lucide-react";

const LevelCard = () => {
  const { totalXP, level, rank, nextRank, progressToNext, xpToNext, loading } = useUserLevel();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-3 rounded-2xl border backdrop-blur-md overflow-hidden bg-white/5 border-white/10"
    >
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: rank.color }}
      />
      <div className="relative flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`,
            border: `1.5px solid ${rank.color}80`,
            boxShadow: `0 0 20px ${rank.color}40`,
          }}
        >
          {rank.emoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                Nível {level}
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: rank.color }}
              >
                {rank.name}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-white tabular-nums">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              {totalXP} XP
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: nextRank
                  ? `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`
                  : rank.color,
                boxShadow: `0 0 8px ${rank.color}80`,
              }}
            />
          </div>

          <p className="text-[9px] font-bold text-white/40 mt-1">
            {nextRank ? (
              <>
                Faltam <span className="text-white/80">{xpToNext} XP</span> para{" "}
                <span style={{ color: nextRank.color }}>
                  {nextRank.emoji} {nextRank.name}
                </span>
              </>
            ) : (
              <span className="text-yellow-400">🏆 Nível máximo atingido!</span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelCard;