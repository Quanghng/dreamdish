'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserPanel from '../components/UserPanel';
import BookLoadingScreen from '../components/BookLoadingScreen';
import { useRecipe } from '@/hooks/useRecipe';
import type { DrinkPairing, GeneratedRecipe, NutritionalInfo } from '@/types';

type BookEntry = {
  id: string;
  createdAt: string;
  imageUrl: string;
  category: string | null;
  recipe: GeneratedRecipe;
  nutritionalInfo?: NutritionalInfo;
  drinkPairings?: DrinkPairing[];
  ai: {
    beautifulDescription: string;
    chefTips: string[];
  };
};

type BookPayload = {
  bookTitle: string;
  intro: string;
  generatedAt: string;
  entries: BookEntry[];
};

export default function MonLivreClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);
  const userLabel = (session?.user?.name || session?.user?.email || '').trim();

  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();

  const [take, setTake] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<BookPayload | null>(null);

  const bookRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBook(null);
    setError(null);
  }, [isAuthenticated]);

  const canGenerate = isAuthenticated && !isGenerating;

  const generate = async () => {
    if (!isAuthenticated) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/cookbook-book?take=${take}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Erreur lors de la génération.');
        return;
      }

      setBook(data as BookPayload);
    } catch {
      setError('Erreur réseau lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = async () => {
    if (!book) return;

    setIsDownloadingPdf(true);
    setError(null);

    try {
      const filenameBase = (book.bookTitle || 'Mon livre')
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

      const res = await fetch('/api/user/cookbook-book/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data?.error === 'string' ? data.error : 'Erreur lors de la génération du PDF.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenameBase}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Impossible de télécharger le PDF. Essayez “Imprimer” → “Enregistrer en PDF”.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const generatedLabel = useMemo(() => {
    if (!book?.generatedAt) return null;
    const d = new Date(book.generatedAt);
    return d.toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }, [book?.generatedAt]);

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar, isAuthenticated: authed }) => (
        <div className="no-print">
          <Navbar onUserClick={onUserClick} userAvatar={userAvatar} isAuthenticated={authed} />
        </div>
      )}
    >
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 max-w-5xl mx-auto px-4 sm:px-6">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              nav, header, footer { display: none !important; }
              body { background: white !important; }
              .print-page { break-inside: avoid; page-break-inside: avoid; }
              .print-break { break-before: page; page-break-before: always; }
            }
          `}</style>

          {isGenerating ? <BookLoadingScreen title={book?.bookTitle} variant="book" /> : null}
          {isDownloadingPdf ? <BookLoadingScreen title="Export du PDF" variant="pdf" /> : null}

          <div className="no-print mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-950">Mon livre</h1>
              <p className="mt-3 text-amber-700 text-sm sm:text-base">
                Génère un mini-cookbook (photos + descriptions + astuces) à partir de tes recettes.
              </p>
              <div className="mt-2 text-xs text-amber-600">
                Astuce: tu peux aussi “Télécharger PDF” directement.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/mes-creations')}
                className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
              >
                Retour
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={!book}
                className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                Imprimer
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={!book || isGenerating || isDownloadingPdf}
                className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                {isDownloadingPdf ? 'PDF…' : 'Télécharger PDF'}
              </button>

              <button
                type="button"
                onClick={generate}
                disabled={!canGenerate}
                className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {isGenerating ? 'Génération…' : 'Générer'}
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Connectez-vous pour générer votre livre.
            </div>
          ) : (
            <div className="no-print mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-100 bg-white/70 px-5 py-4">
              <label className="text-sm font-semibold text-amber-900">Nombre de recettes</label>
              <select
                value={take}
                onChange={(e) => setTake(Number(e.target.value))}
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900"
              >
                {[4, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {generatedLabel ? (
                <span className="text-xs text-amber-700">Généré le {generatedLabel}</span>
              ) : null}
              {error ? <span className="text-sm text-red-600">{error}</span> : null}
            </div>
          )}

          {book ? (
            <div ref={bookRef} id="cookbook-book" className="space-y-8">
              <section className="print-page rounded-4xl border border-amber-100 bg-white p-7 shadow-sm">
                <div className="relative overflow-hidden rounded-4xl border border-amber-100 bg-linear-to-br from-amber-50 via-white to-orange-50 p-8">
                  <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-200/35 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold tracking-[0.28em] text-amber-700">DREAMDISH</div>
                        <h2 className="mt-3 text-5xl sm:text-6xl font-extrabold tracking-tight text-amber-950">
                          Mon Cookbook
                        </h2>
                        <div className="mt-3 text-base sm:text-lg text-amber-800">
                          Des recettes qui font rêver, des saveurs qui rassemblent.
                        </div>

                        <div className="mt-6 h-px w-full bg-linear-to-r from-amber-200 via-orange-200 to-rose-200" />

                        <div className="mt-6 rounded-3xl border border-amber-100 bg-white/80 p-5">
                          <div className="text-xs font-semibold tracking-widest text-amber-600">TITRE</div>
                          <div className="mt-2 text-2xl font-extrabold text-amber-950">{book.bookTitle}</div>
                          {userLabel ? (
                            <div className="mt-2 text-sm font-semibold text-amber-800">Par {userLabel}</div>
                          ) : null}
                          <div className="mt-3 text-xs text-amber-700">Généré le {generatedLabel ?? ''}</div>
                        </div>

                        <div className="mt-4 rounded-3xl border border-amber-100 bg-white/80 p-5">
                          <div className="text-xs font-semibold tracking-widest text-amber-600">PRÉFACE</div>
                          <p className="mt-3 text-amber-900 leading-relaxed whitespace-pre-wrap">{book.intro}</p>
                        </div>
                      </div>

                      <div className="shrink-0 lg:w-90">
                        <div className="rounded-4xl border border-amber-100 bg-white/70 p-3">
                          <div className="grid grid-cols-3 gap-2">
                            {book.entries.slice(0, 9).map((e, idx) => (
                              <div key={`cover-img-${e.id}-${idx}`} className="relative overflow-hidden rounded-2xl border border-amber-100">
                                <img src={e.imageUrl} alt={e.recipe.title} className="h-28 w-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 rounded-3xl border border-amber-100 bg-white/80 p-4">
                            <div className="text-xs font-semibold tracking-widest text-amber-600">SÉLECTION</div>
                            <div className="mt-2 text-sm font-semibold text-amber-950">
                              {book.entries.length} recette(s)
                            </div>
                            <div className="mt-1 text-xs text-amber-700">Photos + descriptions + astuces</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="print-page print-break rounded-4xl border border-amber-100 bg-white p-7 shadow-sm">
                <div className="text-xs font-semibold tracking-widest text-amber-600">TABLE DES MATIÈRES</div>
                <h3 className="mt-2 text-3xl font-extrabold text-amber-950">Recettes</h3>
                <div className="mt-4 h-px w-full bg-amber-100" />
                <ol className="mt-5 space-y-3">
                  {book.entries.map((e, idx) => {
                    const estimatedPage = 3 + idx;
                    return (
                      <li key={`toc-${e.id}`} className="flex items-baseline justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-amber-950">
                            {idx + 1}. {e.recipe.title}
                          </div>
                          <div className="mt-1 text-xs text-amber-700">{e.category ?? 'Sans catégorie'}</div>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-amber-800">
                          {estimatedPage}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {book.entries.map((entry) => {
                const createdLabel = new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                });

                return (
                  <section
                    key={entry.id}
                    className="print-page print-break rounded-4xl border border-amber-100 bg-white p-7 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <img
                        src={entry.imageUrl}
                        alt={entry.recipe.title}
                        className="h-56 w-full sm:w-56 rounded-3xl object-cover border border-amber-100"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold tracking-widest text-amber-600">RECETTE</div>
                            <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-amber-950">{entry.recipe.title}</h3>
                          </div>
                          <div className="text-xs text-amber-700">{createdLabel}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 font-semibold text-amber-800">
                            {entry.category ?? 'Sans catégorie'}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white border border-amber-200 px-3 py-1 font-semibold text-amber-900">
                            {entry.recipe.servings} portion(s)
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white border border-amber-200 px-3 py-1 font-semibold text-amber-900">
                            {entry.recipe.prepTime} min prep
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white border border-amber-200 px-3 py-1 font-semibold text-amber-900">
                            {entry.recipe.cookTime} min cuisson
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white border border-amber-200 px-3 py-1 font-semibold text-amber-900">
                            {entry.recipe.difficulty}
                          </span>
                        </div>

                        <p className="mt-5 text-amber-900 leading-relaxed whitespace-pre-wrap">
                          {entry.ai?.beautifulDescription || entry.recipe.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-5">
                        <h4 className="text-sm font-extrabold text-amber-950">Ingrédients</h4>
                        <ul className="mt-3 space-y-2 text-sm text-amber-900">
                          {entry.recipe.ingredients.map((ing, idx) => (
                            <li key={`${ing.name}-${idx}`} className="flex items-start justify-between gap-3">
                              <span className="min-w-0">{ing.name}</span>
                              <span className="shrink-0 text-amber-700">
                                {ing.quantity} {ing.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-5">
                        <h4 className="text-sm font-extrabold text-amber-950">Astuces</h4>
                        {entry.ai?.chefTips?.length ? (
                          <ul className="mt-3 space-y-2 text-sm text-amber-900 list-disc pl-5">
                            {entry.ai.chefTips.map((tip, idx) => (
                              <li key={`${entry.id}-tip-${idx}`}>{tip}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-3 text-sm text-amber-700">Aucune astuce générée.</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-amber-100 bg-white p-5">
                      <h4 className="text-sm font-extrabold text-amber-950">Instructions</h4>
                      <ol className="mt-3 space-y-3 text-sm text-amber-900">
                        {entry.recipe.instructions.map((step) => (
                          <li key={step.stepNumber} className="rounded-2xl border border-amber-100 bg-amber-50/20 p-4">
                            <div className="font-semibold text-amber-950">{step.stepNumber}. {step.title}</div>
                            <div className="mt-1 text-amber-900 whitespace-pre-wrap">{step.instruction}</div>
                            {step.tips ? (
                              <div className="mt-2 text-xs text-amber-700">Astuce: {step.tips}</div>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {entry.nutritionalInfo ? (
                      <div className="mt-6 rounded-2xl border border-amber-100 bg-white/70 p-4">
                        <h4 className="text-sm font-extrabold text-amber-950">Infos nutritionnelles</h4>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-amber-900">
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">🔥 {entry.nutritionalInfo.calories} kcal</div>
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">💪 {entry.nutritionalInfo.protein} g prot.</div>
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">🍞 {entry.nutritionalInfo.carbohydrates} g gluc.</div>
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">🧈 {entry.nutritionalInfo.fat} g lip.</div>
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">🥦 {entry.nutritionalInfo.fiber} g fibres</div>
                          <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">🧂 {entry.nutritionalInfo.sodium} mg sodium</div>
                        </div>
                        <div className="mt-2 text-xs text-amber-600">{entry.nutritionalInfo.disclaimer}</div>
                      </div>
                    ) : null}

                    {Array.isArray(entry.drinkPairings) && entry.drinkPairings.length ? (
                      <div className="mt-6 rounded-2xl border border-amber-100 bg-white/70 p-4">
                        <h4 className="text-sm font-extrabold text-amber-950">Accords boisson</h4>
                        <div className="mt-3 space-y-3">
                          {entry.drinkPairings.map((p, idx) => (
                            <div key={`${entry.id}-pair-${idx}`} className="rounded-xl border border-amber-100 bg-white/70 p-3">
                              <div className="text-sm font-semibold text-amber-950">{p.name} ({p.type})</div>
                              <div className="mt-1 text-sm text-amber-900">{p.description}</div>
                              <div className="mt-1 text-xs text-amber-700">Pourquoi: {p.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="no-print rounded-2xl border border-amber-100 bg-white/70 p-10 text-center text-amber-800">
              Clique sur “Générer” pour créer ton mini-livre.
            </div>
          )}
        </main>

        <div className="no-print">
          <Footer />
        </div>
      </div>
    </UserPanel>
  );
}
