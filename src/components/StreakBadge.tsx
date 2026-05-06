import { motion, AnimatePresence } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";

interface Props {
  onClick?: () => void;
  compact?: boolean;
}

const StreakBadge = ({ onClick, compact }: Props) => {
  const { current, isActiveToday, loading } = useStreak();

  if (loading) return null;

  const isHot = current >= 1;
  const isCold = !isActiveToday && current >= 1; // streak em risco

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all",
        isCold
          ? "bg-red-500/10 border-red-500/40"
          : isHot
            ? "bg-orange-500/15 border-orange-400/40"
            : "bg-white/5 border-white/10",
      )}
      aria-label={`Streak de ${current} dias`}
    >
      <motion.div
        animate={
          isHot && !isCold
            ? { scale: [1, 1.18, 1], rotate: [-3, 3, -3] }
            : {}
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {isCold ? (
          <Snowflake className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Flame
            className={cn(
              "w-3.5 h-3.5",
              isHot ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]" : "text-white/40",
            )}
          />
        )}
      </motion.div>
      <span
        className={cn(
          "text-[11px] font-black tabular-nums",
          isCold ? "text-red-300" : isHot ? "text-orange-200" : "text-white/60",
        )}
      >
        {current}
      </span>
      {!compact && (
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
          {current === 1 ? "dia" : "dias"}
        </span>
      )}
    </motion.button>
  );
};

export default StreakBadge;