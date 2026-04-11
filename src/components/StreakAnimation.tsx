import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakAnimationProps {
  days: number;
  isNewRecord?: boolean;
}

const StreakAnimation: React.FC<StreakAnimationProps> = ({ days, isNewRecord = false }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const flameVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
      },
    },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.4,
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  const pulseVariants = {
    animate: {
      boxShadow: [
        '0 0 0 0 rgba(239, 68, 68, 0.4)',
        '0 0 0 20px rgba(239, 68, 68, 0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center"
    >
      {/* Flame Icon */}
      <motion.div
        variants={flameVariants}
        animate="animate"
        className="relative mb-4"
      >
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute inset-0 rounded-full"
        />
        <div className="relative z-10 w-16 h-16 bg-gradient-to-b from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
          <Flame className="w-8 h-8 text-white fill-white" />
        </div>
      </motion.div>

      {/* Streak Number */}
      <motion.div
        variants={numberVariants}
        className="text-center"
      >
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          {days}
        </p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
          Dias Seguidos
        </p>
      </motion.div>

      {/* New Record Badge */}
      {isNewRecord && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="mt-4 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full"
        >
          🏆 Novo Recorde!
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakAnimation;
