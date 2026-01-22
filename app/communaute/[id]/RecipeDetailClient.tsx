'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import RecipeDisplay from '../../components/RecipeDisplay';
import LikeButton from '../../components/LikeButton';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UserPanel from '../../components/UserPanel';
import { useRecipe } from '@/hooks/useRecipe';
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

type CommentUser = {
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

type CookbookComment = {
  id: string;
  entryId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: CommentUser;
};

const MAX_COMMENT_LENGTH = 300;

function getUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
}): string {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (fullName) return fullName;
  if (user.name && user.name.trim()) return user.name.trim();
  return user.email;
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
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const { cookbook, updateRecipeCategory, fetchCookbook } = useRecipe();
  const [comments, setComments] = useState<CookbookComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const isAuthenticated = Boolean(session?.user?.id);

  useEffect(() => {
    let cancelled = false;
    setIsCommentsLoading(true);
    fetch(`/api/cookbook/${entryId}/comments`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load comments');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const nextComments = Array.isArray(data?.comments) ? (data.comments as CookbookComment[]) : [];
        const nextCount = typeof data?.count === 'number' ? data.count : nextComments.length;
        setComments(nextComments);
        setCommentsCount(nextCount);
      })
      .catch(() => {
        if (cancelled) return;
        setComments([]);
        setCommentsCount(0);
      })
      .finally(() => {
        if (cancelled) return;
        setIsCommentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  useEffect(() => {
    const shouldOpen = searchParams?.get('comment') === '1';
    if (!shouldOpen) return;

    const commentsEl = document.getElementById('comments');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (isAuthenticated) {
      setIsComposerOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated]);

  const commentsLabel = useMemo(() => {
    if (isCommentsLoading) return 'Chargement…';
    return `${commentsCount} commentaire${commentsCount > 1 ? 's' : ''}`;
  }, [commentsCount, isCommentsLoading]);

  const remainingChars = MAX_COMMENT_LENGTH - commentDraft.length;

  const submitComment = async () => {
    if (!isAuthenticated) {
      setCommentError('Vous devez être connecté pour commenter.');
      return;
    }

    const content = commentDraft.trim();
    if (!content) {
      setCommentError('Commentaire vide.');
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setCommentError(`Commentaire trop long (max ${MAX_COMMENT_LENGTH} caractères).`);
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/cookbook/${entryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommentError(typeof data?.error === 'string' ? data.error : 'Erreur lors de la publication.');
        return;
      }

      const created = data as CookbookComment;
      setComments((prev) => [created, ...prev]);
      setCommentsCount((c) => c + 1);
      setCommentDraft('');
      setIsComposerOpen(false);
    } catch {
      setCommentError('Erreur réseau lors de la publication.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
        <main className="mx-auto w-full max-w-5xl px-6 pt-28 pb-16">
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-white/80 backdrop-blur-md px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow">
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

          <section id="comments" className="mt-8 scroll-mt-28 rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-md p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-amber-950">Commentaires</h2>
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-amber-700">{commentsLabel}</div>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposerOpen((v) => !v);
                      setCommentError(null);
                    }}
                    className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    Commenter
                  </button>
                ) : (
                  <div className="text-xs text-amber-600">Connectez-vous pour commenter</div>
                )}
              </div>
            </div>

            {isComposerOpen ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-amber-950">Nouveau commentaire</div>
                  <div className={`text-xs ${remainingChars < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {remainingChars} caractères restants
                  </div>
                </div>

                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  rows={3}
                  placeholder="Écrivez votre commentaire…"
                  className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 placeholder:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  maxLength={MAX_COMMENT_LENGTH + 50}
                />

                {commentError ? <div className="mt-2 text-sm text-red-600">{commentError}</div> : null}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposerOpen(false);
                      setCommentError(null);
                    }}
                    className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                    disabled={isSubmittingComment}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={submitComment}
                    className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
                    disabled={isSubmittingComment || remainingChars < 0 || !commentDraft.trim()}
                  >
                    {isSubmittingComment ? 'Publication…' : 'Publier'}
                  </button>
                </div>
              </div>
            ) : null}

            {isCommentsLoading ? (
              <div className="mt-4 text-sm text-amber-700">Chargement des commentaires…</div>
            ) : comments.length === 0 ? (
              <div className="mt-4 text-sm text-amber-700">Aucun commentaire pour le moment.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {comments.map((comment) => {
                  const displayName = getUserDisplayName(comment.user);
                  const avatar =
                    comment.user.avatarUrl && !comment.user.avatarUrl.startsWith('http')
                      ? comment.user.avatarUrl
                      : '👤';
                  const dateLabel = new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                  });

                  return (
                    <div key={comment.id} className="rounded-2xl border border-amber-100 bg-white/70 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow">
                          {avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="text-sm font-semibold text-amber-950 truncate">{displayName}</div>
                            <div className="text-xs text-amber-600">• {dateLabel}</div>
                          </div>
                          <div className="mt-2 text-sm text-amber-900 whitespace-pre-wrap">{comment.content}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </UserPanel>
  );
}
