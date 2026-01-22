'use client';

import { useEffect, useMemo, useState } from 'react';

const LOADING_STEPS = [
  { icon: '📚', text: 'Compilation de vos recettes…' },
  { icon: '🧠', text: 'Mise en page du livre…' },
  { icon: '✍️', text: 'Écriture des descriptions (IA)…' },
  { icon: '💡', text: 'Génération des astuces de chef…' },
  { icon: '✨', text: 'Finitions et élégance…' },
] as const;

const PDF_STEPS = [
  { icon: '🧾', text: 'Préparation du PDF…' },
  { icon: '🎨', text: 'Mise en page luxury…' },
  { icon: '🖼️', text: 'Intégration des images…' },
  { icon: '🔢', text: 'Pagination et finitions…' },
  { icon: '📦', text: 'Export final…' },
] as const;

const FLOATING = ['📖', '🖋️', '🍽️', '✨', '🍷', '🥗', '🍝', '🍰'] as const;

function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: ((i * 17 + 11) % 100),
    top: ((i * 23 + 9) % 100),
    delay: ((i * 0.6) % 5),
    duration: 5 + ((i * 0.7) % 5),
    emoji: FLOATING[i % FLOATING.length],
  }));
}

export default function BookLoadingScreen(props: { title?: string; variant?: 'book' | 'pdf' }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const particles = useMemo(() => makeParticles(14), []);
  const steps = props.variant === 'pdf' ? PDF_STEPS : LOADING_STEPS;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + 2;
      });
    }, 180);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-linear-to-br from-amber-950/95 via-orange-900/95 to-rose-900/95">
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-book-float"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            <span className="text-2xl opacity-20">{p.emoji}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-lg px-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-widest text-amber-100/80">DREAMDISH • MISTRAL</div>
              <h2 className="mt-2 text-2xl font-extrabold text-white truncate">
                {props.title?.trim()
                  ? props.title
                  : props.variant === 'pdf'
                    ? 'Export du PDF en cours'
                    : 'Votre livre est en création'}
              </h2>
              <p className="mt-1 text-sm text-amber-100/80">
                {props.variant === 'pdf'
                  ? 'Nous préparons une mise en page premium et la pagination.'
                  : 'Nous générons de belles descriptions et des astuces (sans commentaires).'}
              </p>
            </div>

            <div className="relative h-16 w-14 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-amber-400 to-rose-500 opacity-70" />
              <div className="absolute inset-0 rounded-xl border border-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-3 border-white/25 border-t-white animate-spin" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-2xl animate-pulse">{steps[step].icon}</span>
            <span className="text-white text-sm font-semibold">{steps[step].text}</span>
          </div>

          <div className="mt-5 h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute" />
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === step ? 'bg-amber-300 scale-125' : i < step ? 'bg-white/40' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(8deg); }
        }
        .animate-book-float {
          animation: bookFloat 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
