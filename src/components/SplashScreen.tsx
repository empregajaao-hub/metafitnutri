import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logoImage from "@/assets/logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 400);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 bg-background"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        {/* Neon blue glow effect */}
        <div className="absolute inset-0 rounded-full blur-xl bg-[hsl(210,100%,50%)] opacity-40 scale-110 animate-pulse" />
        <div className="absolute inset-0 rounded-full blur-md bg-[hsl(210,100%,60%)] opacity-30 scale-105" />
        
        {/* Logo with neon blue border */}
        <img
          src={logoImage}
          alt="METAFIT"
          className="w-32 h-32 object-cover rounded-full relative z-10 border-4 border-[hsl(210,100%,50%)] shadow-[0_0_30px_hsl(210,100%,50%),0_0_60px_hsl(210,100%,50%,0.5)]"
        />
      </motion.div>
    </motion.div>
  );
};
