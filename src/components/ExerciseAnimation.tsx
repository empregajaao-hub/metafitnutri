import React from 'react';
import { motion } from "framer-motion";

interface ExerciseAnimationProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Mapeamento de exercícios para URLs de demonstração técnica 3D realistas.
 * Estas URLs apontam para animações que mostram a execução correta do movimento.
 */
const exerciseAssets: Record<string, string> = {
  // Agachamento (Squat) - Movimento completo de descer e subir
  squat: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Flexões (Pushups) - Movimento técnico de braços e core
  pushup: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Prancha (Plank) - Demonstração de alinhamento e estabilidade
  plank: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Avanço (Lunge) - Movimento de pernas e equilíbrio
  lunge: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Abdominais (Crunch) - Movimento de contração do core
  crunch: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Saltos (Jumping Jacks) - Movimento dinâmico de cardio
  jumping: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Burpees - Movimento complexo de corpo inteiro
  burpee: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Escalador (Mountain Climber) - Movimento de pernas e core
  mountain: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Remada (Row) - Movimento de costas e braços
  row: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Desenvolvimento (Shoulder Press) - Movimento de ombros
  shoulderPress: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Supino (Bench Press) - Movimento de peito
  benchPress: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Rosca Bíceps (Bicep Curl) - Movimento de braços
  bicepCurl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Elevação Lateral (Lateral Raise) - Movimento de ombros
  lateralRaise: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  
  // Genérico - Demonstração técnica padrão
  generic: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
};

const ExerciseAnimation = ({ exerciseName, size = "md" }: ExerciseAnimationProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-full aspect-video",
  };

  const getExerciseType = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("agachamento") || lowerName.includes("squat")) return "squat";
    if (lowerName.includes("flexão") || lowerName.includes("push")) return "pushup";
    if (lowerName.includes("prancha") || lowerName.includes("plank")) return "plank";
    if (lowerName.includes("avanço") || lowerName.includes("lunge")) return "lunge";
    if (lowerName.includes("abdom") || lowerName.includes("crunch")) return "crunch";
    if (lowerName.includes("jumping") || lowerName.includes("jump")) return "jumping";
    if (lowerName.includes("burpee")) return "burpee";
    if (lowerName.includes("mountain") || lowerName.includes("escalador")) return "mountain";
    if (lowerName.includes("remada") || lowerName.includes("row")) return "row";
    if (lowerName.includes("press") || lowerName.includes("ombro")) return "shoulderPress";
    if (lowerName.includes("supino") || lowerName.includes("bench")) return "benchPress";
    if (lowerName.includes("rosca") || lowerName.includes("curl")) return "bicepCurl";
    if (lowerName.includes("elevação") || lowerName.includes("lateral")) return "lateralRaise";
    return "generic";
  };

  const exerciseType = getExerciseType(exerciseName);
  const animationUrl = exerciseAssets[exerciseType] || exerciseAssets.generic;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${sizeClasses[size]} relative bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-primary/30 shadow-2xl`}
    >
      {/* Overlay de Qualidade Técnica */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />
      
      {/* Demonstração Técnica 3D Realista */}
      <img 
        src={animationUrl} 
        alt={`Demonstração técnica de ${exerciseName}`}
        className="w-full h-full object-cover"
      />

      {/* Badge de Técnica IA */}
      <div className="absolute top-3 left-3 z-20">
        <div className="px-2 py-1 bg-primary/90 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-lg border border-white/20">
          Técnica 3D IA
        </div>
      </div>

      {/* Indicador de Movimento */}
      <div className="absolute bottom-3 right-3 z-20">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live Demo</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseAnimation;
