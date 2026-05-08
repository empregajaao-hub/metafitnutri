import React from 'react';
import { motion } from "framer-motion";
import { findExerciseAsset } from "@/data/exerciseAssets";
import ExerciseStickman from "./ExerciseStickman";

interface ExerciseAnimationProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
}

const ExerciseAnimation = ({ exerciseName, size = "md" }: ExerciseAnimationProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-full aspect-video",
  };

  const asset = findExerciseAsset(exerciseName);
  const animationUrl = asset?.url || "";
  const isVideo = asset?.kind === "video" || (!!animationUrl && animationUrl.endsWith(".mp4"));
  // Imagens estáticas não se mexem — usamos um stickman SVG animado em vez disso.
  const useStickman = !asset || asset.kind === "image" || asset.kind === "gif" ? !isVideo : false;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${sizeClasses[size]} relative bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-primary/30 shadow-2xl`}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={animationUrl}
          loop
          muted
          playsInline
          autoPlay
          className="w-full h-full object-cover z-0"
        />
      ) : useStickman ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-background z-0 p-4">
          <ExerciseStickman exerciseId={asset?.id || exerciseName} />
        </div>
      ) : (
        <img
          src={animationUrl}
          alt={exerciseName}
          className="w-full h-full object-contain bg-white z-0"
          loading="lazy"
        />
      )}

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
