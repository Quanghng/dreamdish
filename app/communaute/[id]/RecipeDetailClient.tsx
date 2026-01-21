'use client';

import { useRouter } from 'next/navigation';
import RecipeDisplay from '../../components/RecipeDisplay';
import LikeButton from '../../components/LikeButton';
import type { GeneratedRecipe, NutritionalInfo, DrinkPairing } from '@/types';

interface RecipeDetailClientProps {
  entryId: string;
  recipe: GeneratedRecipe;
  imageUrl: string;
  nutritionalInfo?: NutritionalInfo;
  drinkPairings?: DrinkPairing[];
  author: string;
  authorAvatar: string;
  createdAtLabel: string;
  initialLikesCount: number;
  initialLiked: boolean;
}

export default function RecipeDetailClient({
  entryId,
  recipe,
  imageUrl,
  nutritionalInfo,
  drinkPairings,
  author,
  authorAvatar,
  createdAtLabel,
  initialLikesCount,
  initialLiked,
}: RecipeDetailClientProps) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-16">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-white/80 backdrop-blur-md px-5 py-4 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow">
              {authorAvatar}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-900 truncate">{author}</div>
              <div className="text-xs text-amber-600">{createdAtLabel}</div>
            </div>
          </div>
        </div>
        <LikeButton entryId={entryId} initialCount={initialLikesCount} initialLiked={initialLiked} />
      </div>

      <RecipeDisplay
        recipe={recipe}
        imageUrl={imageUrl}
        nutritionalInfo={nutritionalInfo}
        drinkPairings={drinkPairings}
        onClose={() => router.push('/communaute')}
        isSaved
        variant="page"
      />
    </div>
  );
}
