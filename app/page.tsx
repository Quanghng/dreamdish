'use client';
import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import DishCard from './components/DishCard';
import IngredientTag from './components/IngredientTag';
import FilterBar from './components/FilterBar';
import IngredientCard from './components/IngredientCard';
import Footer from './components/Footer';
import CookingLoadingScreen from './components/CookingLoadingScreen';
import RecipeLoadingScreen from './components/RecipeLoadingScreen';
import RecipeDisplay from './components/RecipeDisplay';
import { ingredientsData } from '../data/ingredients';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useGenerate } from '@/hooks/useGenerate';
import { useRecipe } from '@/hooks/useRecipe';
import type { FilterSelection } from '@/types';
import { signIn, signOut, useSession } from 'next-auth/react';

interface Ingredient {
  id: string;
  icon: string;
  label: string;
}

// Tag color configurations for filter selections
const FILTER_TAG_COLORS = {
  type: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
    icon: '🍽️',
  },
  style: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: '🌍',
  },
  cuisson: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: '🔥',
  },
  regime: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: '🥗',
  },
  category: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    icon: '📦',
  },
};

const DEFAULT_INGREDIENTS: Ingredient[] = [];
const DEFAULT_AVATARS = ['🍜', '🍣', '🍕', '🥗', '🍩', '🥐', '🍔', '🍤', '🍱', '🍞'];
const DEFAULT_INGREDIENT_IDS = new Set(DEFAULT_INGREDIENTS.map(ing => ing.id));
const DEFAULT_INGREDIENT_LABELS = new Set(
  DEFAULT_INGREDIENTS.map(ing => ing.label.toLowerCase())
);

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);
  const [hasClearedDefaults, setHasClearedDefaults] = useState(false);
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
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    'Rapide',
    'Healthy',
    'Famille',
    'Festif',
    'Comfort',
    'Créatif',
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarPickerTarget, setAvatarPickerTarget] = useState<'register' | 'profile'>('profile');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const { 
    suggestions, 
    isLoading: suggestionsLoading,
    clearSuggestions 
  } = useSuggestions(
    inputValue, 
    ingredients.map(i => i.label),
    { debounceDelay: 300, minChars: 2 }
  );

  const { data: session } = useSession();

  const { 
    result: generateResult, 
    isLoading: generateLoading, 
    error: generateError,
    generate,
    reset: resetGenerate 
  } = useGenerate();

  const { 
    recipeResult,
    isLoading: recipeLoading,
    error: recipeError,
    generateRecipe,
    reset: resetRecipe,
    saveToCoookbook,
    cookbook,
    updateRecipeCategory,
    fetchCookbook,
  } = useRecipe();

  // State for viewing a saved recipe from cookbook (must be after cookbook is defined)
  const [viewingCookbookEntry, setViewingCookbookEntry] = useState<typeof cookbook[number] | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterSelection, setFilterSelection] = useState<FilterSelection>({
    category: '',
    cuisson: '',
    style: '',
    regime: '',
    type: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dishes = [
    { image: '🍝', title: 'Pasta' },
    { image: '🍕', title: 'Pizza' },
    { image: '🍜', title: 'Ramen' },
    { image: '🍛', title: 'Curry' },
    { image: '🥘', title: 'Paella' },
    { image: '🍔', title: 'Burger' },
    { image: '🌮', title: 'Tacos' },
    { image: '🍱', title: 'Bento' },
    { image: '🥗', title: 'Salade' },
    { image: '🍲', title: 'Pot-au-feu' },
    { image: '🍣', title: 'Sushi' },
    { image: '🥙', title: 'Kebab' },
    { image: '🍤', title: 'Tempura' },
    { image: '🥟', title: 'Ravioli' },
    { image: '🍖', title: 'Viande' },
  ];

  const ingredientsWithTags = ingredientsData.map(ing => {
    if (ing.tags) return ing;
    
    const defaultTags: string[] = ['plat principal'];
    
    if (['Champignon', 'Carotte', 'Laitue', 'Poivron', 'Oignon', 'Ail', 'Aubergine', 'Pomme de terre', 'Concombre', 'Épinards', 'Chou', 'Maïs', 'Piment', 'Basilic', 'Persil', 'Coriandre', 'Thym', 'Romarin', 'Menthe', 'Courge', 'Courgette', 'Betterave', 'Navet', 'Radis', 'Céleri', 'Fenouil', 'Artichaut', 'Asperge'].includes(ing.name)) {
      defaultTags.push('légume', 'végétarien', 'vegan', 'sans gluten');
      if (['Laitue', 'Concombre', 'Tomate', 'Avocat', 'Radis'].includes(ing.name)) {
        defaultTags.push('froid', 'entrée');
      } else {
        defaultTags.push('chaud');
      }
    }
    
    if (['Bœuf', 'Poulet', 'Agneau', 'Dinde', 'Canard', 'Porc', 'Bacon', 'Jambon', 'Chorizo', 'Saucisse'].includes(ing.name)) {
      defaultTags.push('viande', 'chaud');
    }
    
    if (['Saumon', 'Thon', 'Cabillaud', 'Truite', 'Crevette', 'Crabe', 'Homard', 'Moule', 'Huître'].includes(ing.name)) {
      defaultTags.push('poisson', 'chaud');
    }
    
    if (['Pomme', 'Banane', 'Fraise', 'Raisin', 'Orange', 'Citron', 'Pêche', 'Cerise', 'Ananas', 'Kiwi', 'Mangue'].includes(ing.name)) {
      defaultTags.push('fruit', 'froid', 'ambiant', 'végétarien', 'vegan', 'sans gluten', 'dessert');
    }
    
    if (['Fromage', 'Lait', 'Beurre', 'Crème', 'Yaourt', 'Mozzarella', 'Parmesan', 'Cheddar'].includes(ing.name)) {
      defaultTags.push('produit laitier', 'végétarien');
      if (['Fromage', 'Mozzarella', 'Parmesan', 'Cheddar'].includes(ing.name)) {
        defaultTags.push('froid', 'ambiant');
      }
    }
    
    if (['Riz', 'Pâtes', 'Pain', 'Quinoa', 'Couscous', 'Avoine'].includes(ing.name)) {
      defaultTags.push('céréale', 'végétarien', 'vegan');
      if (ing.name !== 'Pain' && ing.name !== 'Pâtes') {
        defaultTags.push('sans gluten');
      }
      defaultTags.push('chaud', 'ambiant');
    }
    
    return { ...ing, tags: defaultTags };
  });

  // Filtrer les ingrédients selon la categorie uniquement
  // - Catégories: OBLIGATOIRE si sélectionnée (légume, poisson, etc)
  // - Autres filtres: servent aux recommandations, pas au filtrage ici
  const selectedIngredientNames = new Set(ingredients.map(i => i.label.toLowerCase()));
  
  const filteredIngredients = ingredientsWithTags.filter(ingredient => {
    // Exclure les ingrédients déjà sélectionnés
    if (selectedIngredientNames.has(ingredient.name.toLowerCase())) {
      return false;
    }
    
    // Si une catégorie est sélectionnée, l'ingrédient DOIT avoir ce tag de catégorie
    if (selectedCategory) {
      if (!ingredient.tags?.includes(selectedCategory)) {
        return false;
      }
    }
    
    // Exclusions basées sur le régime alimentaire
    if (filterSelection.regime) {
      const regime = filterSelection.regime.toLowerCase();
      const ingredientTags = ingredient.tags?.map(t => t.toLowerCase()) || [];
      
      // Si vegan: exclure viande, poisson, produit laitier, et tout ce qui n'a pas le tag vegan
      if (regime === 'vegan') {
        const excludedCategories = ['viande', 'poisson', 'produit laitier'];
        const hasExcludedCategory = excludedCategories.some(cat => ingredientTags.includes(cat));
        if (hasExcludedCategory || !ingredientTags.includes('vegan')) {
          return false;
        }
      }
      
      // Si végétarien: exclure viande et poisson
      if (regime === 'végétarien') {
        const excludedCategories = ['viande', 'poisson'];
        const hasExcludedCategory = excludedCategories.some(cat => ingredientTags.includes(cat));
        if (hasExcludedCategory) {
          return false;
        }
      }
      
      // Si sans gluten: exclure tout ce qui n'a pas le tag "sans gluten"
      if (regime === 'sans gluten') {
        if (!ingredientTags.includes('sans gluten')) {
          return false;
        }
      }
      
      // Si sans lactose: exclure tout ce qui n'a pas le tag "sans lactose"
      if (regime === 'sans lactose') {
        if (!ingredientTags.includes('sans lactose')) {
          return false;
        }
      }
      
      // Si halal: exclure les ingrédients sans le tag halal qui sont de la viande
      if (regime === 'halal') {
        if (ingredientTags.includes('viande') && !ingredientTags.includes('halal')) {
          return false;
        }
      }
      
      // Si casher: exclure les ingrédients sans le tag casher qui sont de la viande
      if (regime === 'casher') {
        if (ingredientTags.includes('viande') && !ingredientTags.includes('casher')) {
          return false;
        }
      }
    }
    
    return true;
  });

  useEffect(() => {
    if (hasClearedDefaults) return;
    const hasCustomIngredient = ingredients.some(
      ing => !DEFAULT_INGREDIENT_LABELS.has(ing.label.toLowerCase())
    );
    if (!hasCustomIngredient) return;
    setIngredients(prev => prev.filter(ing => !DEFAULT_INGREDIENT_IDS.has(ing.id)));
    setHasClearedDefaults(true);
  }, [hasClearedDefaults, ingredients]);

  // Helper to remove a specific filter
  const handleRemoveFilter = (filterType: keyof FilterSelection) => {
    const nextSelection = { ...filterSelection, [filterType]: '' };
    setFilterSelection(nextSelection);
    if (filterType === 'category') {
      setSelectedCategory('');
    }
    setActiveFilters(
      [nextSelection.cuisson, nextSelection.style, nextSelection.regime, nextSelection.type].filter(Boolean) as string[]
    );
  };

  // Get active filter selections for display
  const activeFilterSelections = Object.entries(filterSelection)
    .filter(([_, val]) => val && val !== '')
    .map(([key, val]) => ({ type: key as keyof FilterSelection, value: val as string }));

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
  }, [session?.user?.id, isUserPanelOpen]);

  const handleFilterSelection = (nextSelection: FilterSelection) => {
    setFilterSelection(nextSelection);
    setActiveFilters(
      [nextSelection.cuisson, nextSelection.style, nextSelection.regime, nextSelection.type].filter(Boolean) as string[]
    );
    setSelectedCategory(nextSelection.category || '');
  };

  const handleSelectIngredient = (ing: { name?: string; label?: string; icon?: string }) => {
    const name = ing.name || ing.label;
    setIngredients(prev => {
      if (!name || prev.some(i => i.label.toLowerCase() === name.toLowerCase())) return prev;
      const newIngredient: Ingredient = {
        id: `${Date.now()}_${name}`,
        icon: ing.icon || '🥗',
        label: name || 'Unknown',
      };
      return [...prev, newIngredient];
    });
  };

  const handleAddIngredient = (label?: string) => {
    const ingredientLabel = label || inputValue.trim();
    if (ingredientLabel) {
      if (ingredients.some(ing => ing.label.toLowerCase() === ingredientLabel.toLowerCase())) {
        return;
      }
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        icon: '🥗',
        label: ingredientLabel,
      };
      setIngredients(prev => {
        return [...prev, newIngredient];
      });
      setInputValue('');
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    
    const ingredientLabels = ingredients.map(i => i.label);
    const result = await generate(ingredientLabels, {
      additionalContext: inputValue.trim() || undefined,
      filters: filterSelection,
    });
    
    if (result) {
      setShowResult(true);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!generateResult?.imageUrl) return;
    
    const ingredientLabels = ingredients.map(i => i.label);
    const result = await generateRecipe(generateResult.imageUrl, ingredientLabels);
    
    if (result) {
      setShowRecipe(true);
      setIsRecipeSaved(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (recipeResult && generateResult) {
      await saveToCoookbook(
        recipeResult.recipe,
        generateResult.imageUrl,
        ingredients.map(i => i.label),
        recipeResult.nutritionalInfo,
        recipeResult.drinkPairings
      );
      setIsRecipeSaved(true);
    }
  };

  const handleCloseRecipe = () => {
    setShowRecipe(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleAddIngredient(suggestion);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    resetGenerate();
  };

  const handleOpenUserPanel = () => {
    setUserMode(session?.user?.id && userProfile ? 'profile' : 'login');
    setIsUserPanelOpen(true);
    setAuthError(null);
  };

  const handleCloseUserPanel = () => {
    setIsUserPanelOpen(false);
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      <Navbar onUserClick={handleOpenUserPanel} userAvatar={userProfile?.avatarUrl} />
      
      {/* Loading Screen */}
      {generateLoading && <CookingLoadingScreen ingredients={ingredients.map(i => i.label)} />}
      
      {showResult && generateResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
            {/* Recipe Loading Screen - inside the modal */}
            {recipeLoading && <RecipeLoadingScreen imageUrl={generateResult?.imageUrl} />}
            
            <div className="p-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-amber-900">🍽️ Votre plat de rêve</h3>
                <button
                  onClick={handleCloseResult}
                  className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Generated Image */}
              {generateResult.imageUrl && (
                <div className="mb-6 -mx-6">
                  <img
                    src={generateResult.imageUrl}
                    alt="Plat généré"
                    className="w-full max-h-[420px] object-cover"
                  />
                </div>
              )}

              {/* Selected Ingredients with Tags */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <span>🧺</span> Ingrédients utilisés
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => {
                    const ingredientData = ingredientsWithTags.find(
                      i => i.name.toLowerCase() === ing.label.toLowerCase()
                    );
                    const tags = ingredientData?.tags?.slice(0, 2) || [];
                    
                    return (
                      <div
                        key={ing.id}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-3 py-2"
                      >
                        <span className="text-lg">{ing.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-amber-900">{ing.label}</span>
                          {tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Recipe Error */}
              {recipeError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  ⚠️ {recipeError}
                </div>
              )}
              
              {/* Keywords / Filtres utilisés */}
              <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border-2 border-amber-200">
                <h4 className="text-sm font-bold text-amber-900 mb-3">🏷️ Vos sélections</h4>
                <div className="space-y-2 text-sm">
                  {filterSelection.type && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-800 min-w-[80px]">Type:</span>
                      <span className="inline-block px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-xs font-medium">{filterSelection.type}</span>
                    </div>
                  )}
                  {filterSelection.style && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-800 min-w-[80px]">Style:</span>
                      <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-xs font-medium">{filterSelection.style}</span>
                    </div>
                  )}
                  {filterSelection.cuisson && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-800 min-w-[80px]">Cuisson:</span>
                      <span className="inline-block px-3 py-1 bg-red-200 text-red-900 rounded-full text-xs font-medium">{filterSelection.cuisson}</span>
                    </div>
                  )}
                  {filterSelection.regime && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-800 min-w-[80px]">Régime:</span>
                      <span className="inline-block px-3 py-1 bg-green-200 text-green-900 rounded-full text-xs font-medium">{filterSelection.regime}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Prompt Description (collapsible) */}
              <details className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                <summary className="p-4 cursor-pointer text-amber-800 font-medium hover:bg-amber-100/50 rounded-2xl transition-colors">
                  📝 Voir la description du plat
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-amber-900 leading-relaxed whitespace-pre-wrap text-sm">
                    {generateResult.prompt}
                  </p>
                </div>
              </details>
              
              {/* Generate Recipe Button - Primary CTA */}
              {generateResult.imageUrl && (
                <button
                  onClick={handleGenerateRecipe}
                  disabled={recipeLoading}
                  className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl disabled:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">📖</span>
                  <span>Générer la Recette</span>
                  <span className="text-sm opacity-75">(avec IA Vision)</span>
                </button>
              )}
              
              <div className="mt-4 flex flex-wrap gap-3">
                {generateResult.imageUrl && (
                  <a
                    href={generateResult.imageUrl}
                    download="dreamdish-creation.png"
                    className="flex-1 min-w-[140px] py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-medium transition-colors text-center"
                  >
                    💾 Télécharger
                  </a>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(generateResult.prompt)}
                  className="flex-1 min-w-[140px] py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-medium transition-colors"
                >
                  📋 Copier le prompt
                </button>
                <button
                  onClick={handleCloseResult}
                  className="flex-1 min-w-[140px] py-3 px-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-xl font-medium transition-colors"
                >
                  ✨ Nouveau plat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecipe && recipeResult && generateResult?.imageUrl && (
        <RecipeDisplay
          recipe={recipeResult.recipe}
          nutritionalInfo={recipeResult.nutritionalInfo}
          drinkPairings={recipeResult.drinkPairings}
          imageUrl={generateResult.imageUrl}
          onClose={handleCloseRecipe}
          onSaveToCookbook={handleSaveRecipe}
          isSaved={isRecipeSaved}
        />
      )}

      {/* Display saved recipe from cookbook */}
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
                <form onSubmit={handleLoginSubmit} className="grid gap-4 max-w-md">
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
                                  onClick={(e) => e.stopPropagation()}
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

      <main className="flex flex-col items-center justify-center min-h-screen pt-32 pb-48">
        <h1 className="text-7xl font-bold text-amber-900 mb-16 text-center">
          Crée ton plat de rêve
        </h1>
        
        <div 
          className="w-full max-w-7xl mb-20"
          style={{
            perspective: '900px',
            perspectiveOrigin: 'center top'
          }}
        >
          <div 
            className="grid grid-cols-5 gap-6"
            style={{
              transform: 'rotateX(45deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {dishes.map((dish, index) => (
              <DishCard
                key={index}
                image={dish.image}
                title={dish.title}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="w-full bg-black py-12 mb-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center">
            Choisissez parmi des centaines d&apos;ingrédients
          </h2>
        </div>
        
        <section className="w-full max-w-7xl mx-auto px-8 py-20">
          <div className="mb-12">
            <FilterBar value={filterSelection} onValueChange={handleFilterSelection} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredIngredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.name}
                name={ingredient.name}
                color={ingredient.color}
                icon={ingredient.icon}
                onSelect={() => handleSelectIngredient(ingredient)}
              />
            ))}
          </div>
          
          {filteredIngredients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl text-amber-600">
                Aucun ingrédient ne correspond aux filtres sélectionnés
              </p>
              <p className="text-amber-500 mt-2">
                Essayez de retirer certains filtres
              </p>
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 space-y-4">
          {generateError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              ⚠️ {generateError}
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 min-h-[3rem] items-center">
            {/* Filter Selection Tags */}
            {activeFilterSelections.map(({ type, value: tagValue }) => {
              const colors = FILTER_TAG_COLORS[type];
              return (
                <div
                  key={type}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-md ${colors.bg} ${colors.border} ${colors.text} text-base font-medium hover:shadow-lg transition-shadow duration-200`}
                >
                  <span className="text-2xl">{colors.icon}</span>
                  <span>{tagValue}</span>
                  <button
                    onClick={() => handleRemoveFilter(type)}
                    className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors text-xs font-bold"
                    title={`Retirer ce filtre`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            
            {/* Ingredient Tags */}
            {ingredients.map((ingredient) => (
              <IngredientTag
                key={ingredient.id}
                icon={ingredient.icon}
                label={ingredient.label}
                onRemove={() => handleRemoveIngredient(ingredient.id)}
              />
            ))}
            {ingredients.length === 0 && activeFilterSelections.length === 0 && (
              <span className="text-amber-400 italic">
                Ajoutez des ingrédients pour commencer...
              </span>
            )}
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full px-6 py-4 border-2 border-amber-200 focus-within:border-amber-400 transition-colors">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                placeholder="Avez-vous une demande particulière pour votre plat ?"
                className="flex-1 bg-transparent outline-none text-amber-900 placeholder:text-amber-400"
              />
              <button
                onClick={() => handleAddIngredient()}
                className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 font-bold text-xl transition-all flex items-center justify-center"
                title="Ajouter un ingrédient"
              >
                +
              </button>
              <button
                onClick={handleGenerate}
                disabled={ingredients.length === 0 || generateLoading}
                className="px-6 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold shadow-lg hover:shadow-xl disabled:shadow-none transition-all flex items-center justify-center gap-2"
                title="Générer votre plat"
              >
                <span>✨</span>
                <span>Générer</span>
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
                <div className="p-2">
                  <p className="text-xs text-amber-500 px-3 py-1">Suggestions</p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-amber-50 rounded-xl text-amber-900 transition-colors flex items-center gap-3"
                    >
                      <span className="text-lg">🥗</span>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestionsLoading && inputValue.length >= 2 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-amber-100 p-4">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Recherche de suggestions...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-36 right-6 md:bottom-14 md:right-10 z-40 flex flex-col items-end gap-3">
        {isFilterOpen && (
          <div className="w-[320px] md:w-[400px] max-h-[60vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50 to-white rounded-2xl border border-amber-200/70 shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-amber-900 uppercase">Filtres</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <FilterBar
              value={filterSelection}
              onValueChange={handleFilterSelection}
              collapsible
            />
          </div>
        )}
        <button
          onClick={() => setIsFilterOpen(prev => !prev)}
          aria-label="Ouvrir les filtres"
          className="w-16 h-16 rounded-full bg-white border-2 border-black text-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 5h18" />
            <path d="M7 12h10" />
            <path d="M10 19h4" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
