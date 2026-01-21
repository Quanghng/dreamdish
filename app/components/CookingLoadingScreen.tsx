'use client';

import { useEffect, useState, useMemo } from 'react';

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

// Pre-generate floating ingredient positions to avoid hydration issues
function generateFloatingIngredients(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: ingredientEmojis[i % ingredientEmojis.length],
    x: ((i * 13 + 10) % 80) + 10,
    delay: (i * 0.17) % 2,
  }));
}

export default function CookingLoadingScreen({ ingredients }: CookingLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Use useMemo to generate stable floating ingredients
  const floatingIngredients = useMemo(() => generateFloatingIngredients(12), []);

  // Cycle through cooking steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % cookingSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center overflow-hidden">
      {/* Floating ingredients animation */}
      {floatingIngredients.map((item) => (
        <div
          key={item.id}
          className="absolute text-4xl animate-float opacity-60"
          style={{
            left: `${item.x}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: '4s',
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Cooking pan animation */}
        <div className="relative mb-8">
          <div className="text-9xl animate-bounce-slow">🍳</div>
          
          {/* Steam animation */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-3 h-12 bg-white/30 rounded-full animate-steam" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-16 bg-white/20 rounded-full animate-steam" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-10 bg-white/30 rounded-full animate-steam" style={{ animationDelay: '0.6s' }}></div>
          </div>

          {/* Sparkles */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-8 text-2xl animate-pulse">✨</div>
            <div className="absolute top-8 right-8 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-4 left-12 text-lg animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
          </div>
        </div>

        {/* Current step */}
        <div className="mb-6">
          <span className="text-6xl mb-4 block animate-pulse">{cookingSteps[currentStep].emoji}</span>
          <p className="text-2xl text-white font-medium">{cookingSteps[currentStep].text}</p>
        </div>

        {/* Ingredients being used */}
        <div className="mb-8">
          <p className="text-amber-200 mb-3">Ingrédients utilisés :</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {ingredients.map((ing, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {cookingSteps.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'bg-amber-300 scale-125' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Fun message */}
        <p className="mt-8 text-amber-200/80 text-sm italic">
          Notre chef IA prépare votre plat avec amour... 👨‍🍳
        </p>
      </div>
    </div>
  );
}
