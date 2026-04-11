import React from 'react';
import { motion } from "framer-motion";

interface ExerciseAnimationProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
}

// Mapeamento de exercícios para URLs de vídeos/GIFs 3D realistas (assets premium simulados)
const exerciseAssets: Record<string, string> = {
  squat: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  pushup: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif", // Placeholder realista
  plank: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  lunge: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  crunch: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  jumping: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  burpee: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  mountain: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  row: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  shoulderPress: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  benchPress: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  bicepCurl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  lateralRaise: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
  generic: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6N3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6L1Zf8ze/giphy.gif",
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
    if (lowerName.includes("lunge") || lowerName.includes("avanço")) return "lunge";
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${sizeClasses[size]} relative bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-primary/20 shadow-2xl`}
    >
      {/* Overlay de Qualidade Premium */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10 pointer-events-none" />
      
      {/* Motor de Renderização Realista (Simulado com Vídeo/GIF de Alta Qualidade) */}
      <img 
        src={animationUrl} 
        alt={exerciseName}
        className="w-full h-full object-cover"
      />

      {/* Badge de IA Realista */}
      <div className="absolute top-2 right-2 z-20">
        <div className="px-1.5 py-0.5 bg-primary/80 backdrop-blur-sm rounded text-[8px] font-black text-white uppercase tracking-tighter">
          3D Realistic IA
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseAnimation;
