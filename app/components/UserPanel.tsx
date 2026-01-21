'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import RecipeDisplay from './RecipeDisplay';
import type { CookbookEntry } from '@/types';

const DEFAULT_AVATARS = ['🍜', '🍣', '🍕', '🥗', '🍩', '🥐', '🍔', '🍤', '🍱', '🍞'];
const DEFAULT_CATEGORIES = ['Rapide', 'Healthy', 'Famille', 'Festif', 'Comfort', 'Créatif'];

type UserPanelNavbarProps = {
  onUserClick: () => void;
  userAvatar?: string;
};

type UserPanelProps = {
  renderNavbar: (props: UserPanelNavbarProps) => ReactNode;
  children: ReactNode;
  cookbook: CookbookEntry[];
  updateRecipeCategory: (id: string, category: string) => void;
  fetchCookbook: () => Promise<void>;
};

export default function UserPanel({
  renderNavbar,
  children,
  cookbook,
  updateRecipeCategory,
  fetchCookbook
}: UserPanelProps) {
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [userMode, setUserMode] = useState<'login' | 'register' | 'profile'>('login');
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    preferences: { categories?: string[] };
  } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAvatar, setRegisterAvatar] = useState(DEFAULT_AVATARS[0]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileCategoryFilter, setProfileCategoryFilter] = useState('Tous');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarPickerTarget, setAvatarPickerTarget] = useState<'register' | 'profile'>('profile');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [viewingCookbookEntry, setViewingCookbookEntry] = useState<CookbookEntry | null>(null);

  const { data: session } = useSession();

  const loadUserProfile = async () => {
    const response = await fetch('/api/user/profile');
    if (response.status === 404) return false;
    if (!response.ok) return false;
    const data = await response.json();
    const categories = Array.isArray(data.preferences?.categories)
      ? data.preferences.categories
      : categoryOptions;
    setUserProfile({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      avatarUrl: data.avatarUrl || DEFAULT_AVATARS[0],
      preferences: { categories },
    });
    setCategoryOptions(categories);
    return true;
  };

  const persistProfile = async (nextProfile: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    preferences: { categories?: string[] };
  }) => {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        avatarUrl: nextProfile.avatarUrl,
        preferences: nextProfile.preferences,
      }),
    });
    if (!response.ok) return;
    const data = await response.json();
    const categories = Array.isArray(data.preferences?.categories)
      ? data.preferences.categories
      : categoryOptions;
    setUserProfile({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      avatarUrl: data.avatarUrl || DEFAULT_AVATARS[0],
      preferences: { categories },
    });
    setCategoryOptions(categories);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setUserProfile(null);
      return;
    }
    if (!isUserPanelOpen) return;
    loadUserProfile().then(async (ok) => {
      if (ok) {
        await fetchCookbook();
        setUserMode('profile');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, isUserPanelOpen, fetchCookbook]);

  const handleOpenUserPanel = () => {
    setUserMode(session?.user?.id && userProfile ? 'profile' : 'login');
    setIsUserPanelOpen(true);
    setAuthError(null);
  };

  const handleCloseUserPanel = () => {
    setIsUserPanelOpen(false);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    if (result?.error) {
      setAuthError('Email ou mot de passe incorrect.');
      return;
    }
    setLoginPassword('');
    await loadUserProfile();
    setUserMode('profile');
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    if (!registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('Email et mot de passe requis.');
      return;
    }
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerEmail,
        password: registerPassword,
        firstName: registerFirstName,
        lastName: registerLastName,
        avatarUrl: registerAvatar,
        preferences: { categories: categoryOptions },
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setAuthError(data.error || 'Erreur lors de la création du compte.');
      return;
    }

    const result = await signIn('credentials', {
      email: registerEmail,
      password: registerPassword,
      redirect: false,
    });
    if (result?.error) {
      setAuthError('Impossible de se connecter après inscription.');
      return;
    }
    setRegisterPassword('');
    await loadUserProfile();
    setUserMode('profile');
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    setUserProfile(null);
    setUserMode('login');
  };

  const handleAvatarSelect = (avatar: string) => {
    if (!userProfile) return;
    const nextProfile = {
      ...userProfile,
      avatarUrl: avatar,
    };
    setUserProfile(nextProfile);
    persistProfile(nextProfile);
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (avatarPickerTarget === 'register') {
      setRegisterAvatar(url);
    } else {
      if (!userProfile) return;
      const nextProfile = { ...userProfile, avatarUrl: url };
      setUserProfile(nextProfile);
      persistProfile(nextProfile);
    }
  };

  const handleOpenAvatarPicker = (target: 'register' | 'profile') => {
    setAvatarPickerTarget(target);
    setIsAvatarPickerOpen(true);
  };

  const handleCloseAvatarPicker = () => {
    setIsAvatarPickerOpen(false);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categoryOptions.includes(trimmed)) {
      setNewCategoryName('');
      return;
    }
    const nextCategories = [...categoryOptions, trimmed];
    setCategoryOptions(nextCategories);
    if (userProfile) {
      const nextProfile = {
        ...userProfile,
        preferences: { categories: nextCategories },
      };
      setUserProfile(nextProfile);
      persistProfile(nextProfile);
    }
    setNewCategoryName('');
  };

  const visibleCookbook = cookbook
    .filter(entry => (profileCategoryFilter === 'Tous' ? true : entry.category === profileCategoryFilter))
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

  return (
    <>
      {renderNavbar({ onUserClick: handleOpenUserPanel, userAvatar: userProfile?.avatarUrl })}

      {viewingCookbookEntry && (
        <RecipeDisplay
          recipe={viewingCookbookEntry.recipe}
          nutritionalInfo={viewingCookbookEntry.nutritionalInfo}
          drinkPairings={viewingCookbookEntry.drinkPairings}
          imageUrl={viewingCookbookEntry.imageUrl}
          onClose={() => setViewingCookbookEntry(null)}
          isSaved={true}
        />
      )}

      {isUserPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-10">
          <div className="w-full max-w-4xl bg-white/95 rounded-3xl shadow-2xl border border-amber-100 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
              <div>
                <h3 className="text-2xl font-bold text-amber-900">Compte utilisateur</h3>
              </div>
              <button
                onClick={handleCloseUserPanel}
                className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {userMode !== 'profile' && (
                <div className="mb-6 flex items-center gap-3">
                  <button
                    onClick={() => setUserMode('login')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      userMode === 'login'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => setUserMode('register')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      userMode === 'register'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Inscription
                  </button>
                </div>
              )}

              {userMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="mx-auto grid w-full max-w-md gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Mot de passe</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold py-3 shadow-md hover:shadow-lg transition"
                  >
                    Se connecter
                  </button>
                  {authError && (
                    <div className="text-sm text-red-600">{authError}</div>
                  )}
                </form>
              )}

              {userMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="mx-auto grid w-full max-w-md gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={registerFirstName}
                        onChange={(event) => setRegisterFirstName(event.target.value)}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-1">Nom</label>
                      <input
                        type="text"
                        value={registerLastName}
                        onChange={(event) => setRegisterLastName(event.target.value)}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Email</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Mot de passe</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      required
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-amber-900 mb-3">Choisir un avatar
                    <button
                      type="button"
                      onClick={() => handleOpenAvatarPicker('register')}
                      className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-800 hover:bg-amber-50 transition"
                    >
                      {registerAvatar.startsWith('blob:') || registerAvatar.startsWith('data:') ? (
                        <img src={registerAvatar} alt="Avatar" className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <span className="text-2xl">{registerAvatar}</span>
                      )}
                    </button>
                    </h5>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold py-3 shadow-md hover:shadow-lg transition"
                  >
                    Créer un compte
                  </button>
                  {authError && (
                    <div className="text-sm text-red-600">{authError}</div>
                  )}
                </form>
              )}

              {userMode === 'profile' && userProfile && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenAvatarPicker('profile')}
                        className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl overflow-hidden border border-amber-200 hover:shadow-md transition"
                        aria-label="Modifier l’avatar"
                      >
                        {userProfile.avatarUrl.startsWith('blob:') || userProfile.avatarUrl.startsWith('data:') ? (
                          <img src={userProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          userProfile.avatarUrl
                        )}
                      </button>
                      <div>
                        <h4 className="text-xl font-semibold text-amber-900">
                          {userProfile.firstName} {userProfile.lastName}
                        </h4>
                        <p className="text-sm text-amber-600">{userProfile.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                    >
                      Se déconnecter
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-amber-900">Mes recettes générées</h5>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-amber-700">Filtrer par catégorie</span>
                      <select
                        value={profileCategoryFilter}
                        onChange={(event) => setProfileCategoryFilter(event.target.value)}
                        className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm text-amber-800"
                      >
                        <option value="Tous">Tous</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-amber-900">Mes catégories</h5>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Nouvelle catégorie"
                      className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-amber-800"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                    >
                      Ajouter
                    </button>
                  </div>

                  {visibleCookbook.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-6 py-8 text-center text-amber-700">
                      Aucune recette générée pour le moment.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {visibleCookbook.map(entry => (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer"
                          onClick={() => {
                            setViewingCookbookEntry(entry);
                            setIsUserPanelOpen(false);
                          }}
                        >
                          <div className="flex gap-4">
                            <img
                              src={entry.imageUrl}
                              alt={entry.recipe.title}
                              className="h-24 w-24 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="text-base font-semibold text-amber-900 hover:text-amber-700 transition-colors">
                                    {entry.recipe.title}
                                  </h6>
                                  <p className="text-xs text-amber-600 line-clamp-2">
                                    {entry.recipe.description}
                                  </p>
                                </div>
                                <div className="ml-4 shrink-0 inline-flex items-center gap-1 rounded-full bg-pink-50 border border-pink-200 px-3 py-1 text-xs font-semibold text-pink-700">
                                  <span>❤️</span>
                                  <span>{typeof entry.likesCount === 'number' ? entry.likesCount : 0}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <select
                                  value={entry.category || ''}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateRecipeCategory(entry.id, event.target.value)}
                                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs text-amber-700"
                                >
                                  <option value="">Sans catégorie</option>
                                  {categoryOptions.map(category => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex flex-wrap gap-2">
                                  {entry.recipe.tags?.slice(0, 3).map(tag => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-amber-500 ml-auto">
                                  Cliquez pour voir la recette →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-10">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-amber-900">Choisir un avatar</h4>
              <button
                onClick={handleCloseAvatarPicker}
                className="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 rounded-full text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
              >
                Upload image
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {DEFAULT_AVATARS.map((avatar) => {
                const isActive =
                  avatarPickerTarget === 'register'
                    ? registerAvatar === avatar
                    : userProfile?.avatarUrl === avatar;
                return (
                  <button
                    key={avatar}
                    onClick={() => {
                      if (avatarPickerTarget === 'register') {
                        setRegisterAvatar(avatar);
                      } else {
                        handleAvatarSelect(avatar);
                      }
                      setIsAvatarPickerOpen(false);
                    }}
                    className={`h-12 rounded-2xl border flex items-center justify-center text-2xl transition ${
                      isActive
                        ? 'border-amber-400 bg-amber-100 shadow-sm'
                        : 'border-amber-100 bg-white hover:bg-amber-50'
                    }`}
                  >
                    {avatar}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
