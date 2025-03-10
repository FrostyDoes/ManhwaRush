"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Coins, CheckCircle2 } from "lucide-react";

interface UnlockAnimationProps {
  isOpen: boolean;
  onAnimationComplete: () => void;
  chapterNumber: number;
  coinPrice: number;
}

export function UnlockAnimation({
  isOpen,
  onAnimationComplete,
  chapterNumber,
  coinPrice,
}: UnlockAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset stage when animation opens
      setStage(0);

      // Progress through animation stages
      const timer1 = setTimeout(() => setStage(1), 1000); // Lock to unlock
      const timer2 = setTimeout(() => setStage(2), 2000); // Show coins
      const timer3 = setTimeout(() => setStage(3), 3000); // Show success
      const timer4 = setTimeout(() => onAnimationComplete(), 4500); // Complete

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isOpen, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative flex flex-col items-center justify-center p-10 rounded-xl bg-card border shadow-lg max-w-md w-full mx-4"
          >
            {/* Stage 0-1: Lock to Unlock Animation */}
            <div className="relative mb-6">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: stage >= 1 ? 0 : 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: 0 }}
                  className="bg-primary/10 p-8 rounded-full"
                >
                  <Lock className="h-16 w-16 text-primary" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                animate={{
                  opacity: stage >= 1 ? 1 : 0,
                  rotate: stage >= 1 ? 0 : -10,
                  scale: stage >= 1 ? [1.2, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
                className="bg-green-500/10 p-8 rounded-full"
              >
                <Unlock className="h-16 w-16 text-green-500" />
              </motion.div>
            </div>

            {/* Stage 2: Coins Animation */}
            <AnimatePresence>
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Coins className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                  <motion.span
                    className="text-2xl font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    -{coinPrice}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage 3: Success Message */}
            <AnimatePresence>
              {stage >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    className="flex justify-center mb-4"
                    animate={{ scale: [0.8, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </motion.div>
                  <motion.h2
                    className="text-2xl font-bold mb-2"
                    animate={{ y: [10, 0] }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Chapter Unlocked!
                  </motion.h2>
                  <motion.p
                    className="text-muted-foreground"
                    animate={{ y: [10, 0], opacity: [0, 1] }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    Chapter {chapterNumber} is now available to read
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
