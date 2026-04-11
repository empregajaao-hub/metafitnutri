import React from 'react';
import { motion } from "framer-motion";

interface ExerciseAnimationProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Mapeamento de exercícios para ficheiros MP4 locais integrados do Vecteezy.
 */
const exerciseAssets: Record<string, string> = {
  squat: "/animations/squat.mp4",
  pushup: "/animations/pushups.mp4",
  plank: "/animations/plank.mp4",
  jumping: "/animations/jumping_jacks.mp4",
  generic: "/animations/pushups.mp4", // Fallback seguro
};

const ExerciseAnimation = ({ exerciseName, size = "md" }: ExerciseAnimationProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
    if (lowerName.includes("jumping") || lowerName.includes("jump") || lowerName.includes("salto")) return "jumping";
    return "generic";
  };

  const exerciseType = getExerciseType(exerciseName);
  const animationUrl = exerciseAssets[exerciseType] || exerciseAssets.generic;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${sizeClasses[size]} relative bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-primary/30 shadow-2xl`}
    >
      <video
        ref={videoRef}
        src={animationUrl}
        loop
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover z-0"
      />

      {/* Overlay de Qualidade Técnica */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />
      
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
