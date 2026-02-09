import { motion } from "framer-motion";

interface ExerciseAnimationProps {
  exerciseName: string;
  size?: "sm" | "md" | "lg";
}

// Animated stick figure for each exercise type
const ExerciseAnimation = ({ exerciseName, size = "md" }: ExerciseAnimationProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const getExerciseType = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes("agachamento") || lowerName.includes("squat")) {
      return "squat";
    }
    if (lowerName.includes("flexão") || lowerName.includes("flexões") || lowerName.includes("push")) {
      return "pushup";
    }
    if (lowerName.includes("prancha") || lowerName.includes("plank")) {
      return "plank";
    }
    if (lowerName.includes("lunge") || lowerName.includes("avanço")) {
      return "lunge";
    }
    if (lowerName.includes("abdom") || lowerName.includes("crunch") || lowerName.includes("bicicleta")) {
      return "crunch";
    }
    if (lowerName.includes("jumping") || lowerName.includes("jump") || lowerName.includes("salto")) {
      return "jumping";
    }
    if (lowerName.includes("burpee")) {
      return "burpee";
    }
    if (lowerName.includes("mountain") || lowerName.includes("escalador")) {
      return "mountain";
    }
    if (lowerName.includes("remada") || lowerName.includes("row")) {
      return "row";
    }
    if (lowerName.includes("desenvolvimento") || lowerName.includes("press") || lowerName.includes("ombro")) {
      return "shoulderPress";
    }
    if (lowerName.includes("supino") || lowerName.includes("bench")) {
      return "benchPress";
    }
    if (lowerName.includes("rosca") || lowerName.includes("curl") || lowerName.includes("bíceps")) {
      return "bicepCurl";
    }
    if (lowerName.includes("elevação") || lowerName.includes("raise") || lowerName.includes("lateral")) {
      return "lateralRaise";
    }
    
    return "generic";
  };

  const exerciseType = getExerciseType(exerciseName);

  return (
    <div className={`${sizeClasses[size]} relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden flex items-center justify-center`}>
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      
      {exerciseType === "squat" && <SquatAnimation />}
      {exerciseType === "pushup" && <PushupAnimation />}
      {exerciseType === "plank" && <PlankAnimation />}
      {exerciseType === "lunge" && <LungeAnimation />}
      {exerciseType === "crunch" && <CrunchAnimation />}
      {exerciseType === "jumping" && <JumpingAnimation />}
      {exerciseType === "burpee" && <BurpeeAnimation />}
      {exerciseType === "mountain" && <MountainClimberAnimation />}
      {exerciseType === "row" && <RowAnimation />}
      {exerciseType === "shoulderPress" && <ShoulderPressAnimation />}
      {exerciseType === "benchPress" && <BenchPressAnimation />}
      {exerciseType === "bicepCurl" && <BicepCurlAnimation />}
      {exerciseType === "lateralRaise" && <LateralRaiseAnimation />}
      {exerciseType === "generic" && <GenericAnimation />}
    </div>
  );
};

// Squat Animation - Person squatting up and down
const SquatAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Body */}
    <motion.g
      animate={{
        y: [0, 15, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Head */}
      <circle cx="50" cy="20" r="8" className="fill-primary" />
      {/* Torso */}
      <motion.line
        x1="50" y1="28" x2="50"
        animate={{ y2: [55, 45, 55] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Arms */}
      <motion.line
        x1="50" y1="35" x2="30"
        animate={{ y2: [40, 50, 40] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.line
        x1="50" y1="35" x2="70"
        animate={{ y2: [40, 50, 40] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.g>
    {/* Legs - stay grounded */}
    <motion.path
      d="M 50 55 L 35 75 L 35 90"
      animate={{
        d: [
          "M 50 55 L 35 75 L 35 90",
          "M 50 60 L 30 72 L 30 90",
          "M 50 55 L 35 75 L 35 90",
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      d="M 50 55 L 65 75 L 65 90"
      animate={{
        d: [
          "M 50 55 L 65 75 L 65 90",
          "M 50 60 L 70 72 L 70 90",
          "M 50 55 L 65 75 L 65 90",
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Pushup Animation - Person doing pushups
const PushupAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        y: [0, 8, 0],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Head */}
      <circle cx="20" cy="35" r="6" className="fill-primary" />
      {/* Torso - horizontal */}
      <line x1="26" y1="35" x2="65" y2="40" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Back leg */}
      <line x1="65" y1="40" x2="85" y2="45" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    {/* Arms - going up and down */}
    <motion.line
      x1="35" y1="40"
      animate={{
        y2: [55, 48, 55],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      x2="35"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <motion.line
      x1="50" y1="42"
      animate={{
        y2: [57, 50, 57],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      x2="50"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Ground */}
    <line x1="10" y1="90" x2="90" y2="90" className="stroke-muted-foreground/30" strokeWidth="2" />
    {/* Hands on ground */}
    <circle cx="35" cy="58" r="3" className="fill-primary/50" />
    <circle cx="50" cy="60" r="3" className="fill-primary/50" />
  </svg>
);

// Plank Animation - Static hold with slight breathing motion
const PlankAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        y: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Head */}
      <circle cx="20" cy="45" r="6" className="fill-primary" />
      {/* Torso - horizontal */}
      <line x1="26" y1="45" x2="70" y2="48" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Legs */}
      <line x1="70" y1="48" x2="90" y2="50" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      {/* Arms - elbows */}
      <line x1="30" y1="45" x2="30" y2="60" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="46" x2="45" y2="60" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    {/* Ground */}
    <line x1="10" y1="90" x2="90" y2="90" className="stroke-muted-foreground/30" strokeWidth="2" />
    {/* Pulse effect */}
    <motion.circle
      cx="50"
      cy="50"
      r="25"
      className="stroke-primary/20 fill-none"
      strokeWidth="2"
      animate={{ r: [25, 30, 25], opacity: [0.3, 0.1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

// Lunge Animation
const LungeAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        y: [0, 10, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Head */}
      <circle cx="50" cy="15" r="7" className="fill-primary" />
      {/* Torso */}
      <line x1="50" y1="22" x2="50" y2="45" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Arms on hips */}
      <path d="M 50 30 L 40 40 L 45 45" className="stroke-primary fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 50 30 L 60 40 L 55 45" className="stroke-primary fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    {/* Front leg */}
    <motion.path
      animate={{
        d: [
          "M 50 45 L 35 65 L 30 90",
          "M 50 55 L 30 68 L 25 90",
          "M 50 45 L 35 65 L 30 90",
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Back leg */}
    <motion.path
      animate={{
        d: [
          "M 50 45 L 70 60 L 80 90",
          "M 50 55 L 72 65 L 82 90",
          "M 50 45 L 70 60 L 80 90",
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Crunch Animation
const CrunchAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Ground */}
    <line x1="10" y1="75" x2="90" y2="75" className="stroke-muted-foreground/30" strokeWidth="2" />
    
    <motion.g
      animate={{
        rotate: [0, -30, 0],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "50px 70px" }}
    >
      {/* Head */}
      <motion.circle
        animate={{ cy: [55, 40, 55] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        cx="50" cy="55" r="7" className="fill-primary"
      />
      {/* Upper body */}
      <motion.line
        x1="50"
        animate={{ y1: [62, 47, 62] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        y1="62"
        x2="50" y2="70"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </motion.g>
    {/* Lower body stays flat */}
    <line x1="50" y1="70" x2="75" y2="70" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    {/* Legs up */}
    <path d="M 75 70 L 85 55 L 90 45" className="stroke-primary fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Jumping Jack Animation
const JumpingAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Head */}
      <circle cx="50" cy="20" r="7" className="fill-primary" />
      {/* Torso */}
      <line x1="50" y1="27" x2="50" y2="50" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      
      {/* Arms */}
      <motion.line
        x1="50" y1="32"
        animate={{
          x2: [30, 25, 30],
          y2: [40, 20, 40],
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.line
        x1="50" y1="32"
        animate={{
          x2: [70, 75, 70],
          y2: [40, 20, 40],
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Legs */}
      <motion.line
        x1="50" y1="50"
        animate={{
          x2: [40, 30, 40],
          y2: [80, 85, 80],
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.line
        x1="50" y1="50"
        animate={{
          x2: [60, 70, 60],
          y2: [80, 85, 80],
        }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.g>
  </svg>
);

// Burpee Animation
const BurpeeAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        scaleY: [1, 0.6, 1, 1.1, 1],
        y: [0, 20, 20, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      style={{ transformOrigin: "50px 90px" }}
    >
      {/* Head */}
      <circle cx="50" cy="25" r="7" className="fill-primary" />
      {/* Torso */}
      <line x1="50" y1="32" x2="50" y2="55" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Arms */}
      <motion.line
        x1="50" y1="38"
        animate={{
          x2: [35, 35, 30, 25, 35],
          y2: [50, 60, 55, 15, 50],
        }}
        transition={{ duration: 2, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.line
        x1="50" y1="38"
        animate={{
          x2: [65, 65, 70, 75, 65],
          y2: [50, 60, 55, 15, 50],
        }}
        transition={{ duration: 2, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Legs */}
      <line x1="50" y1="55" x2="40" y2="85" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="55" x2="60" y2="85" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </svg>
);

// Mountain Climber Animation
const MountainClimberAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Body stays still */}
    <circle cx="25" cy="40" r="6" className="fill-primary" />
    <line x1="31" y1="40" x2="60" y2="45" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="35" y1="42" x2="35" y2="60" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="44" x2="50" y2="60" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Alternating legs */}
    <motion.path
      animate={{
        d: [
          "M 60 45 L 45 55 L 40 70",
          "M 60 45 L 75 55 L 85 70",
          "M 60 45 L 45 55 L 40 70",
        ],
      }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      animate={{
        d: [
          "M 60 45 L 75 55 L 85 70",
          "M 60 45 L 45 55 L 40 70",
          "M 60 45 L 75 55 L 85 70",
        ],
      }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Ground */}
    <line x1="10" y1="90" x2="90" y2="90" className="stroke-muted-foreground/30" strokeWidth="2" />
  </svg>
);

// Row Animation
const RowAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Person bent over */}
    <circle cx="30" cy="35" r="6" className="fill-primary" />
    <line x1="36" y1="37" x2="55" y2="50" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="55" y1="50" x2="50" y2="80" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <line x1="55" y1="50" x2="65" y2="80" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Arms pulling */}
    <motion.line
      x1="45" y1="45"
      animate={{
        x2: [45, 55, 45],
        y2: [65, 50, 65],
      }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Weight/bar */}
    <motion.rect
      animate={{
        y: [60, 45, 60],
      }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      x="35" y="60" width="25" height="4" rx="2" className="fill-secondary"
    />
  </svg>
);

// Shoulder Press Animation
const ShoulderPressAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Body */}
    <circle cx="50" cy="35" r="7" className="fill-primary" />
    <line x1="50" y1="42" x2="50" y2="70" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="70" x2="40" y2="90" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="70" x2="60" y2="90" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Arms pressing up */}
    <motion.path
      animate={{
        d: [
          "M 50 48 L 35 45 L 30 55",
          "M 50 48 L 35 30 L 30 15",
          "M 50 48 L 35 45 L 30 55",
        ],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      animate={{
        d: [
          "M 50 48 L 65 45 L 70 55",
          "M 50 48 L 65 30 L 70 15",
          "M 50 48 L 65 45 L 70 55",
        ],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Dumbbells */}
    <motion.circle
      animate={{ cy: [55, 15, 55] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      cx="30" cy="55" r="5" className="fill-secondary"
    />
    <motion.circle
      animate={{ cy: [55, 15, 55] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      cx="70" cy="55" r="5" className="fill-secondary"
    />
  </svg>
);

// Bench Press Animation
const BenchPressAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Bench */}
    <rect x="20" y="65" width="60" height="8" rx="2" className="fill-muted-foreground/30" />
    <rect x="15" y="73" width="8" height="15" rx="1" className="fill-muted-foreground/30" />
    <rect x="77" y="73" width="8" height="15" rx="1" className="fill-muted-foreground/30" />
    
    {/* Person lying down */}
    <circle cx="30" cy="58" r="6" className="fill-primary" />
    <line x1="36" y1="58" x2="70" y2="58" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="70" y1="58" x2="80" y2="70" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Arms pressing */}
    <motion.line
      x1="45" y1="58"
      animate={{
        y2: [45, 25, 45],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      x2="45"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <motion.line
      x1="60" y1="58"
      animate={{
        y2: [45, 25, 45],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      x2="60"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Barbell */}
    <motion.g
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="25" y="42" width="50" height="3" rx="1" className="fill-secondary" />
      <circle cx="25" cy="43.5" r="6" className="fill-secondary" />
      <circle cx="75" cy="43.5" r="6" className="fill-secondary" />
    </motion.g>
  </svg>
);

// Bicep Curl Animation
const BicepCurlAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Body */}
    <circle cx="50" cy="20" r="7" className="fill-primary" />
    <line x1="50" y1="27" x2="50" y2="55" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="55" x2="40" y2="85" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="55" x2="60" y2="85" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Right arm curling */}
    <line x1="50" y1="35" x2="65" y2="40" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <motion.line
      x1="65" y1="40"
      animate={{
        x2: [70, 55, 70],
        y2: [65, 35, 65],
      }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Left arm curling (offset) */}
    <line x1="50" y1="35" x2="35" y2="40" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <motion.line
      x1="35" y1="40"
      animate={{
        x2: [30, 45, 30],
        y2: [65, 35, 65],
      }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Dumbbells */}
    <motion.circle
      animate={{ cx: [70, 55, 70], cy: [65, 35, 65] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      r="5" className="fill-secondary"
    />
    <motion.circle
      animate={{ cx: [30, 45, 30], cy: [65, 35, 65] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      r="5" className="fill-secondary"
    />
  </svg>
);

// Lateral Raise Animation
const LateralRaiseAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    {/* Body */}
    <circle cx="50" cy="25" r="7" className="fill-primary" />
    <line x1="50" y1="32" x2="50" y2="60" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="60" x2="40" y2="90" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="60" x2="60" y2="90" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    
    {/* Arms raising to sides */}
    <motion.line
      x1="50" y1="38"
      animate={{
        x2: [40, 20, 40],
        y2: [55, 38, 55],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <motion.line
      x1="50" y1="38"
      animate={{
        x2: [60, 80, 60],
        y2: [55, 38, 55],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Dumbbells */}
    <motion.circle
      animate={{ cx: [40, 20, 40], cy: [55, 38, 55] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      r="4" className="fill-secondary"
    />
    <motion.circle
      animate={{ cx: [60, 80, 60], cy: [55, 38, 55] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      r="4" className="fill-secondary"
    />
  </svg>
);

// Generic Exercise Animation
const GenericAnimation = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-2">
    <motion.g
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Head */}
      <circle cx="50" cy="25" r="8" className="fill-primary" />
      {/* Torso */}
      <line x1="50" y1="33" x2="50" y2="55" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Arms */}
      <motion.line
        x1="50" y1="40"
        animate={{ x2: [30, 25, 30], y2: [50, 45, 50] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.line
        x1="50" y1="40"
        animate={{ x2: [70, 75, 70], y2: [50, 45, 50] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Legs */}
      <line x1="50" y1="55" x2="35" y2="80" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="55" x2="65" y2="80" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    
    {/* Pulse effect */}
    <motion.circle
      cx="50"
      cy="50"
      className="stroke-primary/30 fill-none"
      strokeWidth="2"
      animate={{ r: [20, 35, 20], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default ExerciseAnimation;
