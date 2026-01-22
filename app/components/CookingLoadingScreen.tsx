'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookingLoadingScreenProps {
  ingredients: string[];
}

const cookingSteps = [
  { emoji: '🥬', text: 'Préparation des ingrédients...' },
  { emoji: '🔪', text: 'Découpage en cours...' },
  { emoji: '🍳', text: 'Cuisson en cours...' },
  { emoji: '🧂', text: 'Assaisonnement...' },
  { emoji: '✨', text: 'Touches finales...' },
  { emoji: '🍽️', text: 'Dressage du plat...' },
];

const ingredientEmojis = ['🥕', '🍅', '🧅', '🥦', '🍗', '🧄', '🌶️', '🥬', '🍋', '🧈'];

function generateFloatingIngredients(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: ingredientEmojis[i % ingredientEmojis.length],
    x: ((i * 13 + 10) % 80) + 10,
    delay: (i * 0.17) % 2,
    duration: 3 + (i % 3),
  }));
}

export default function CookingLoadingScreen({ ingredients }: CookingLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const floatingIngredients = useMemo(() => generateFloatingIngredients(12), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % cookingSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Gradient background with mesh effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d1f3d] to-[#1a1a2e]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e85d04]/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ffb703]/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2d6a4f]/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating ingredients */}
      {floatingIngredients.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-4xl"
          style={{ left: `${item.x}%` }}
          initial={{ y: '100vh', opacity: 0, rotate: 0 }}
          animate={{ 
            y: '-100vh', 
            opacity: [0, 0.8, 0.8, 0],
            rotate: 360
          }}
          transition={{ 
            duration: item.duration + 4,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Cooking pan with enhanced animation */}
        <div className="relative mb-8">
          <motion.div 
            className="text-8xl sm:text-9xl"
            animate={{ 
              rotate: [-5, 5, -5],
              y: [0, -10, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🍳
          </motion.div>
          
          {/* Steam animation */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-16 bg-gradient-to-t from-white/40 to-transparent rounded-full"
                animate={{
                  y: [-10, -40],
                  opacity: [0.6, 0],
                  scaleX: [1, 2],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Sparkles around pan */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 60}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Current step with AnimatePresence */}
        <div className="mb-8 h-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-5xl sm:text-6xl mb-4 block">{cookingSteps[currentStep].emoji}</span>
              <p className="text-xl sm:text-2xl text-white font-medium">{cookingSteps[currentStep].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ingredients being used */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[#ffb703] mb-4 font-medium">Ingrédients utilisés :</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {ingredients.map((ing, idx) => (
              <motion.span
                key={idx}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                {ing}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-3 mb-8">
          {cookingSteps.map((_, idx) => (
            <motion.div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentStep 
                  ? 'bg-gradient-to-r from-[#e85d04] to-[#ffb703]' 
                  : 'bg-white/30'
              }`}
              animate={idx === currentStep ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5, repeat: idx === currentStep ? Infinity : 0 }}
            />
          ))}
        </div>

        {/* AI processing indicator */}
        <motion.div 
          className="flex items-center justify-center gap-2 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
            <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
            <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
          </div>
          <span className="text-sm italic ml-2">L&apos;IA génère votre plat de rêve... 👨‍🍳✨</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
