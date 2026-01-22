'use client';

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
  count: number;
};

type TopIngredient = {
  name: string;
  count: number;
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
}) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-md p-5 shadow-sm">
      <div className="text-xs font-semibold text-amber-700">{props.label}</div>
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
      renderNavbar={({ onUserClick, userAvatar }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} />
      )}
    >
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
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
            />

            <StatCard
              label="Plat le plus commenté"
              value={topCommented?.count ?? 0}
              subtitle={topCommented ? 'commentaires' : 'Aucune donnée'}
              imageUrl={topCommented?.imageUrl}
              title={topCommented?.title}
              meta={topCommented ? `${topCommented.authorAvatar} ${topCommented.authorName}${topCommented.category ? ` • ${topCommented.category}` : ''}` : undefined}
            />

            <StatCard
              label="Ingrédient le plus présent"
              value={topIngredient?.count ?? 0}
              subtitle={topIngredient ? topIngredient.name : 'Aucune donnée'}
            />
          </div>
        </main>

        <Footer />
      </div>
    </UserPanel>
  );
}
