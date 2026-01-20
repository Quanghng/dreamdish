'use client';

import { useEffect, useState } from 'react';

interface RecipeLoadingScreenProps {
  imageUrl?: string;
}

const LOADING_STEPS = [
  { icon: '👁️', text: 'Analyse de l\'image...', duration: 2000 },
  { icon: '🧠', text: 'Identification des saveurs...', duration: 2500 },
  { icon: '📝', text: 'Création de la recette...', duration: 3000 },
  { icon: '⚖️', text: 'Calcul nutritionnel...', duration: 2000 },
  { icon: '🍷', text: 'Accords mets-boissons...', duration: 1500 },
  { icon: '✨', text: 'Finalisation...', duration: 1000 },
];

const CHEF_QUOTES = [
  "La cuisine est un art...",
  "Chaque plat raconte une histoire...",
  "L'innovation culinaire n'a pas de limites...",
  "Les meilleurs plats naissent de la créativité...",
];

export default function RecipeLoadingScreen({ imageUrl }: RecipeLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState(CHEF_QUOTES[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    const quoteInterval = setInterval(() => {
      setQuote(CHEF_QUOTES[Math.floor(Math.random() * CHEF_QUOTES.length)]);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-pink-900/95 z-[60] flex items-center justify-center rounded-3xl overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          >
            <span className="text-2xl opacity-20">
              {['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🥧', '🎂'][Math.floor(Math.random() * 8)]}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full px-6 py-4">
        {/* Image preview (if available) */}
        {imageUrl && (
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-xl">
            <img
              src={imageUrl}
              alt="Plat en cours d'analyse"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Chef icon with animation (when no image) */}
        {!imageUrl && (
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-3 border-purple-300/30" />
            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-pink-400 border-r-purple-400 animate-spin" />
            <div 
              className="absolute inset-2 rounded-full border-3 border-transparent border-b-yellow-400 border-l-orange-400 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                👨‍🍳
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-1">
          Création de votre recette
        </h2>
        
        {/* Quote */}
        <p className="text-purple-200 text-center text-xs italic mb-4 transition-opacity duration-500">
          "{quote}"
        </p>

        {/* Current step indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl animate-pulse">{LOADING_STEPS[currentStep].icon}</span>
          <span className="text-white text-sm font-medium">{LOADING_STEPS[currentStep].text}</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5">
          {LOADING_STEPS.map((step, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-pink-400 scale-125'
                  : index < currentStep
                  ? 'bg-purple-400'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(10deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
