'use client';

import { useRouter } from 'next/navigation';
import DishCard from '../components/DishCard';
import LikeButton from '../components/LikeButton';

interface CommunityEntryCardProps {
  entryId: string;
  imageUrl: string;
  title: string;
  index: number;
  author: string;
  authorAvatar: string;
  createdAtLabel: string;
  category?: string | null;
  initialLikesCount: number;
  initialLiked: boolean;
}

export default function CommunityEntryCard({
  entryId,
  imageUrl,
  title,
  index,
  author,
  authorAvatar,
  createdAtLabel,
  category,
  initialLikesCount,
  initialLiked,
}: CommunityEntryCardProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/communaute/${entryId}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/communaute/${entryId}`);
        }
      }}
      className="rounded-3xl bg-white/80 backdrop-blur-md border border-amber-100 shadow-lg p-5 cursor-pointer hover:shadow-xl hover:border-amber-200 transition-all"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="text-sm text-amber-700 truncate">{author}</div>
          <div className="text-xs text-amber-500">{createdAtLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <LikeButton
            entryId={entryId}
            initialCount={initialLikesCount}
            initialLiked={initialLiked}
          />
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow">
            {authorAvatar}
          </div>
        </div>
      </div>

      <DishCard imageUrl={imageUrl} image={'🍽️'} title={title} index={index} variant="flat" />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-amber-900 line-clamp-2">{title}</div>
        </div>
        {category ? (
          <div className="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
            {category}
          </div>
        ) : null}
      </div>
    </div>
  );
}
