import React from 'react';
import { motion } from 'framer-motion';

interface ExerciseStickmanProps {
  exerciseId: string;
  className?: string;
}

const ExerciseStickman: React.FC<ExerciseStickmanProps> = ({ exerciseId, className = "" }) => {
  const normalizedId = exerciseId.toLowerCase();

  // Common stickman parts
  const head = <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="3" />;
  const body = <line x1="50" y1="28" x2="50" y2="60" stroke="currentColor" strokeWidth="3" />;

  const renderAnimation = () => {
    if (normalizedId.includes('agachamento') || normalizedId.includes('squat')) {
      return (
        <motion.g
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {head}
          {body}
          <line x1="50" y1="35" x2="25" y2="35" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="75" y2="35" stroke="currentColor" strokeWidth="3" />
          <motion.g animate={{ rotate: [0, -30, 0] }} style={{ originX: "50px", originY: "60px" }}>
            <line x1="50" y1="60" x2="35" y2="85" stroke="currentColor" strokeWidth="3" />
          </motion.g>
          <motion.g animate={{ rotate: [0, 30, 0] }} style={{ originX: "50px", originY: "60px" }}>
            <line x1="50" y1="60" x2="65" y2="85" stroke="currentColor" strokeWidth="3" />
          </motion.g>
        </motion.g>
      );
    }

    if (normalizedId.includes('avanço') || normalizedId.includes('lunge')) {
      return (
        <motion.g
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {head}
          {body}
          <line x1="50" y1="35" x2="40" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="60" y2="50" stroke="currentColor" strokeWidth="3" />
          {/* Front leg */}
          <motion.line 
            x1="50" y1="60" x2="30" y2="80" 
            animate={{ x2: [30, 20], y2: [80, 95] }}
            stroke="currentColor" strokeWidth="3" 
          />
          {/* Back leg */}
          <motion.line 
            x1="50" y1="60" x2="70" y2="80" 
            animate={{ x2: [70, 80], y2: [80, 95] }}
            stroke="currentColor" strokeWidth="3" 
          />
        </motion.g>
      );
    }

    if (normalizedId.includes('flex') || normalizedId.includes('pushup')) {
      return (
        <motion.g
          animate={{
            y: [0, 15, 0],
            rotate: -15
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: "80px", originY: "80px" }}
        >
          {head}
          {body}
          {/* Arms - Pushup motion */}
          <line x1="50" y1="35" x2="40" y2="55" stroke="currentColor" strokeWidth="3" />
          {/* Legs */}
          <line x1="50" y1="60" x2="80" y2="85" stroke="currentColor" strokeWidth="3" />
        </motion.g>
      );
    }

    if (normalizedId.includes('prancha') || normalizedId.includes('plank')) {
      return (
        <motion.g
          rotate={-90}
          animate={{
            y: [0, 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: "50px", originY: "50px", rotate: -80 }}
        >
          {head}
          {body}
          <line x1="50" y1="35" x2="40" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="60" x2="80" y2="65" stroke="currentColor" strokeWidth="3" />
        </motion.g>
      );
    }

    if (normalizedId.includes('salto') || normalizedId.includes('jumping')) {
      return (
        <g>
          <motion.g
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {head}
            {body}
            {/* Arms - Jumping Jacks */}
            <motion.line 
              x1="50" y1="35" x2="20" y2="20" 
              animate={{ x2: [20, 80], y2: [20, 20] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
              stroke="currentColor" strokeWidth="3" 
            />
            <motion.line 
              x1="50" y1="35" x2="80" y2="20" 
              animate={{ x2: [80, 20], y2: [20, 20] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
              stroke="currentColor" strokeWidth="3" 
            />
            {/* Legs */}
            <motion.line 
              x1="50" y1="60" x2="30" y2="90" 
              animate={{ x2: [30, 45] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
              stroke="currentColor" strokeWidth="3" 
            />
            <motion.line 
              x1="50" y1="60" x2="70" y2="90" 
              animate={{ x2: [70, 55] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
              stroke="currentColor" strokeWidth="3" 
            />
          </motion.g>
        </g>
      );
    }

    // Default animation for others
    return (
      <motion.g
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {head}
        {body}
        <line x1="50" y1="35" x2="30" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="35" x2="70" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="90" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="90" stroke="currentColor" strokeWidth="3" />
      </motion.g>
    );
  };

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`w-full h-full text-primary ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderAnimation()}
    </svg>
  );
};

export default ExerciseStickman;
