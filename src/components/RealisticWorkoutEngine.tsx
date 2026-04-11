import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface RealisticWorkoutEngineProps {
  exerciseId: string;
  animationUrl: string;
  fallbackAnimation?: React.ReactNode;
  coachCues?: string[];
  onComplete?: () => void;
}

const RealisticWorkoutEngine: React.FC<RealisticWorkoutEngineProps> = ({
  exerciseId,
  animationUrl,
  fallbackAnimation,
  coachCues = [],
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [viewAngle, setViewAngle] = useState<'front' | 'side'>('front');
  const [currentCueIndex, setCurrentCueIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setHasError(true));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, animationUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Rotate coach cues every 5 seconds
  useEffect(() => {
    if (coachCues.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCueIndex((prev) => (prev + 1) % coachCues.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [coachCues]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAngle = () => {
    setViewAngle(viewAngle === 'front' ? 'side' : 'front');
  };

  // Se houver erro no vídeo ou se a URL for apenas um placeholder, usamos o fallbackAnimation
  // que agora contém o novo ExerciseAnimation realista (GIF/Vídeo 3D)
  if (hasError || !animationUrl || animationUrl.startsWith('/animations/')) {
    return (
      <div className="relative w-full aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center overflow-hidden border border-primary/20 shadow-2xl">
        {fallbackAnimation}
        
        {/* Coach Overlay para Fallback */}
        {coachCues.length > 0 && isPlaying && (
          <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-30">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-white text-center font-medium text-sm md:text-base">
                " {coachCues[currentCueIndex]} "
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border border-primary/20 group">
      {/* Video Player */}
      <div className="relative aspect-video bg-neutral-900 flex items-center justify-center">
        <video
          ref={videoRef}
          src={animationUrl}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={onComplete}
          onError={() => setHasError(true)}
        />
        
        {/* Coach Overlay */}
        {coachCues.length > 0 && isPlaying && (
          <div className="absolute bottom-16 left-0 right-0 px-4 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-white text-center font-medium text-sm md:text-base">
                " {coachCues[currentCueIndex]} "
              </p>
            </div>
          </div>
        )}

        {/* Angle Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-none">
            Vista: {viewAngle === 'front' ? 'Frente' : 'Lateral'}
          </Badge>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={handleRestart}>
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleAngle}>
                <Layers className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4 min-w-[120px]">
              <span className="text-white text-xs font-bold whitespace-nowrap">
                Velocidade: {playbackRate}x
              </span>
              <Slider
                value={[playbackRate]}
                min={0.5}
                max={2}
                step={0.25}
                onValueChange={(val) => setPlaybackRate(val[0])}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Initial Play Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RealisticWorkoutEngine;
