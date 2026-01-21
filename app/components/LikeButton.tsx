'use client';

import { useState } from 'react';

interface LikeButtonProps {
  entryId: string;
  initialCount: number;
  initialLiked: boolean;
  className?: string;
  showCount?: boolean;
}

export default function LikeButton({
  entryId,
  initialCount,
  initialLiked,
  className,
  showCount = true,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cookbook/${entryId}/like`, {
        method: 'POST',
      });

      if (response.status === 401) {
        alert('Connectez-vous pour liker un plat.');
        return;
      }

      const data = (await response.json()) as { liked: boolean; likesCount: number };
      if (typeof data?.liked === 'boolean') setLiked(data.liked);
      if (typeof data?.likesCount === 'number') setCount(data.likesCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={isLoading}
      aria-pressed={liked}
      className={
        className ??
        `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition border ${
          liked
            ? 'bg-pink-50 border-pink-200 text-pink-700'
            : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`
      }
      title={liked ? 'Retirer le like' : 'Liker ce plat'}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      {showCount ? <span>{count}</span> : null}
    </button>
  );
}
