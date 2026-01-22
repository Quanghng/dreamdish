'use client';

import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserPanel from '../components/UserPanel';
import { useRecipe } from '@/hooks/useRecipe';

type TopEntry = {
  id: string;
  title: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  category: string | null;
  seedIngredients: string[];
  count: number;
};

type TopIngredient = {
  name: string;
  count: number;
  imageUrl?: string;
};

type StatsClientProps = {
  topLiked?: TopEntry | null;
  topCommented?: TopEntry | null;
  topIngredient?: TopIngredient | null;
  sampleSize: number;
};

function StatCard(props: {
  label: string;
  value: number;
  subtitle?: string;
  imageUrl?: string;
  title?: string;
  meta?: string;
  href?: string;
  seedIngredients?: string[];
}) {
  const router = useRouter();

  const canGenerateWith = Array.isArray(props.seedIngredients) && props.seedIngredients.length > 0;
  const seedHref = canGenerateWith && props.seedIngredients
    ? `/?seedIngredients=${props.seedIngredients.map(encodeURIComponent).join('|')}`
    : undefined;

  return (
    <div
      role={props.href ? 'button' : undefined}
      tabIndex={props.href ? 0 : undefined}
      onClick={props.href ? () => router.push(props.href!) : undefined}
      onKeyDown={
        props.href
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(props.href!);
              }
            }
          : undefined
      }
      className={
        props.href
          ? 'rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-md p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-200 transition-all outline-none focus:ring-2 focus:ring-amber-300'
          : 'rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-md p-5 shadow-sm'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold text-amber-700">{props.label}</div>
        {seedHref ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(seedHref);
            }}
            className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
            title="Revenir à l'accueil avec ces ingrédients"
          >
            Générer avec
          </button>
        ) : null}
      </div>
      <div className="mt-1 text-3xl font-extrabold text-amber-950">{props.value}</div>
      {props.subtitle ? <div className="mt-1 text-sm text-amber-700">{props.subtitle}</div> : null}

      {props.imageUrl ? (
        <div className="mt-4 flex gap-4">
          <img
            src={props.imageUrl}
            alt={props.title ?? 'Plat'}
            className="h-20 w-20 rounded-2xl object-cover border border-amber-100"
          />
          <div className="min-w-0">
            {props.title ? (
              <div className="font-semibold text-amber-950 line-clamp-2">{props.title}</div>
            ) : null}
            {props.meta ? <div className="mt-1 text-xs text-amber-700">{props.meta}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function StatsClient({ topLiked, topCommented, topIngredient, sampleSize }: StatsClientProps) {
  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar, isAuthenticated }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} isAuthenticated={isAuthenticated} />
      )}
    >
      <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-white">
        <main className="pt-28 sm:pt-32 pb-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-950">Stats</h1>
            <p className="mt-3 text-amber-700 text-sm sm:text-base">
              Un aperçu des tendances (likes, commentaires, ingrédients).
            </p>
            <div className="mt-4 text-xs text-amber-600">
              Calculé sur les {sampleSize} plats les plus récents.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Plat le plus liké"
              value={topLiked?.count ?? 0}
              subtitle={topLiked ? 'likes' : 'Aucune donnée'}
              imageUrl={topLiked?.imageUrl}
              title={topLiked?.title}
              meta={topLiked ? `${topLiked.authorAvatar} ${topLiked.authorName}${topLiked.category ? ` • ${topLiked.category}` : ''}` : undefined}
              href={topLiked ? `/communaute/${topLiked.id}` : undefined}
              seedIngredients={topLiked?.seedIngredients}
            />

            <StatCard
              label="Plat le plus commenté"
              value={topCommented?.count ?? 0}
              subtitle={topCommented ? 'commentaires' : 'Aucune donnée'}
              imageUrl={topCommented?.imageUrl}
              title={topCommented?.title}
              meta={topCommented ? `${topCommented.authorAvatar} ${topCommented.authorName}${topCommented.category ? ` • ${topCommented.category}` : ''}` : undefined}
              href={topCommented ? `/communaute/${topCommented.id}` : undefined}
              seedIngredients={topCommented?.seedIngredients}
            />

            <StatCard
              label="Ingrédient le plus présent"
              value={topIngredient?.count ?? 0}
              subtitle={topIngredient ? 'occurrences' : 'Aucune donnée'}
              imageUrl={topIngredient?.imageUrl}
              title={topIngredient?.name}
              seedIngredients={topIngredient?.name ? [topIngredient.name] : undefined}
            />
          </div>
        </main>

        <Footer />
      </div>
    </UserPanel>
  );
}
