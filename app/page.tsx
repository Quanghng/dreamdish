'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import DishCard from './components/DishCard';
import IngredientTag from './components/IngredientTag';
import FilterBar from './components/FilterBar';
import IngredientCard from './components/IngredientCard';
import Footer from './components/Footer';
import CookingLoadingScreen from './components/CookingLoadingScreen';
import RecipeLoadingScreen from './components/RecipeLoadingScreen';
import RecipeDisplay from './components/RecipeDisplay';
import UserPanel from './components/UserPanel';
import { ingredientsData } from '../data/ingredients';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useGenerate } from '@/hooks/useGenerate';
import { useRecipe } from '@/hooks/useRecipe';
import type { FilterSelection } from '@/types';

interface Ingredient {
  id: string;
  icon: string;
  label: string;
}

// Constantes pour le lazy loading
const INITIAL_INGREDIENTS_COUNT = 20;
const LOAD_MORE_COUNT = 20;

// Tag color configurations for filter selections - Updated with new palette
const FILTER_TAG_COLORS = {
  type: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
    icon: '🍽️',
  },
  style: {
    bg: 'bg-gradient-to-r from-[#ffb703]/10 to-[#ffb703]/20',
    border: 'border-[#ffb703]/30',
    text: 'text-[#b8860b]',
    icon: '🌍',
  },
  cuisson: {
    bg: 'bg-gradient-to-r from-rose-100/80 to-red-100/80',
    border: 'border-rose-300/50',
    text: 'text-rose-700',
    icon: '🔥',
  },
  regime: {
    bg: 'bg-gradient-to-r from-[#2d6a4f]/10 to-[#2d6a4f]/20',
    border: 'border-[#2d6a4f]/30',
    text: 'text-[#2d6a4f]',
    icon: '🥗',
  },
  category: {
    bg: 'bg-gradient-to-r from-violet-100/80 to-purple-100/80',
    border: 'border-violet-300/50',
    text: 'text-violet-700',
    icon: '📦',
  },
};

const DEFAULT_INGREDIENTS: Ingredient[] = [];
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
  
  // State pour le lazy loading des ingrédients
  const [displayedIngredientsCount, setDisplayedIngredientsCount] = useState(INITIAL_INGREDIENTS_COUNT);
  const [removedIngredientsNotice, setRemovedIngredientsNotice] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { 
    suggestions, 
    isLoading: suggestionsLoading,
    clearSuggestions 
  } = useSuggestions(
    inputValue, 
    ingredients.map(i => i.label),
    { debounceDelay: 300, minChars: 2 }
  );

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

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterSelection, setFilterSelection] = useState<FilterSelection>({
    category: '',
    cuisson: '',
    style: '',
    regime: '',
    type: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Seed depuis la page Stats: /?seedIngredients=tomate|riz|...
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const raw = params.get('seedIngredients');
    if (!raw) return;

    const labels = raw
      .split('|')
      .map((s) => {
        try {
          return decodeURIComponent(s).trim();
        } catch {
          return s.trim();
        }
      })
      .filter(Boolean);

    if (labels.length === 0) return;

    setIngredients((prev) => {
      const existing = new Set(prev.map((i) => i.label.toLowerCase()));
      const next = [...prev];

      for (const label of labels) {
        if (existing.has(label.toLowerCase())) continue;
        existing.add(label.toLowerCase());
        next.push({
          id: `${Date.now()}_${label}`,
          icon: '🥗',
          label,
        });
      }

      return next;
    });

    params.delete('seedIngredients');
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash || ''}`;
    window.history.replaceState(null, '', nextUrl);
  }, []);
  const dishes = [
    { image: '🍝', title: 'Pasta', imageUrl: '/img/meals/meal1.png' },
    { image: '🍕', title: 'Pizza', imageUrl: '/img/meals/meal2.png' },
    { image: '🍜', title: 'Ramen', imageUrl: '/img/meals/meal3.png' },
    { image: '🍛', title: 'Curry', imageUrl: '/img/meals/meal4.png' },
    { image: '🥘', title: 'Paella', imageUrl: '/img/meals/meal5.png' },
    { image: '🍔', title: 'Burger', imageUrl: '/img/meals/meal6.png' },
    { image: '🌮', title: 'Tacos', imageUrl: '/img/meals/meal7.png' },
    { image: '🍱', title: 'Bento', imageUrl: '/img/meals/meal8.png' },
    { image: '🥗', title: 'Salade', imageUrl: '/img/meals/meal9.png' },
    { image: '🍲', title: 'Pot-au-feu', imageUrl: '/img/meals/meal10.png' },
    { image: '🍣', title: 'Sushi', imageUrl: '/img/meals/meal11.png' },
    { image: '🥙', title: 'Kebab', imageUrl: '/img/meals/meal12.png' },
    { image: '🍤', title: 'Tempura', imageUrl: '/img/meals/meal13.png' },
    { image: '🥟', title: 'Ravioli', imageUrl: '/img/meals/meal14.png' },
    { image: '🍖', title: 'Viande', imageUrl: '/img/meals/meal15.png' },
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

  // Helper function to check if an ingredient is compatible with the current regime
  const isIngredientCompatibleWithRegime = (ingredientLabel: string, regime: string): boolean => {
    if (!regime) return true;
    
    const ingredientData = ingredientsWithTags.find(
      i => i.name.toLowerCase() === ingredientLabel.toLowerCase()
    );
    
    if (!ingredientData) return true; // Allow unknown ingredients
    
    const ingredientTags = ingredientData.tags?.map(t => t.toLowerCase()) || [];
    const regimeLower = regime.toLowerCase();
    
    if (regimeLower === 'vegan') {
      const excludedCategories = ['viande', 'poisson', 'produit laitier'];
      const hasExcludedCategory = excludedCategories.some(cat => ingredientTags.includes(cat));
      if (hasExcludedCategory || !ingredientTags.includes('vegan')) {
        return false;
      }
    }
    
    if (regimeLower === 'végétarien') {
      const excludedCategories = ['viande', 'poisson'];
      const hasExcludedCategory = excludedCategories.some(cat => ingredientTags.includes(cat));
      if (hasExcludedCategory) {
        return false;
      }
    }
    
    if (regimeLower === 'sans gluten') {
      if (!ingredientTags.includes('sans gluten')) {
        return false;
      }
    }
    
    if (regimeLower === 'sans lactose') {
      if (!ingredientTags.includes('sans lactose')) {
        return false;
      }
    }
    
    return true;
  };

  // Effect to remove incompatible ingredients when regime changes
  useEffect(() => {
    if (!filterSelection.regime) {
      setRemovedIngredientsNotice(null);
      return;
    }
    
    const currentRegime = filterSelection.regime;
    const incompatibleIngredients = ingredients.filter(
      ing => !isIngredientCompatibleWithRegime(ing.label, currentRegime)
    );
    
    if (incompatibleIngredients.length > 0) {
      const removedNames = incompatibleIngredients.map(ing => ing.label).join(', ');
      setIngredients(prev => 
        prev.filter(ing => isIngredientCompatibleWithRegime(ing.label, currentRegime))
      );
      setRemovedIngredientsNotice(
        `Ingrédients retirés (incompatibles avec ${currentRegime}): ${removedNames}`
      );
      
      // Auto-hide the notice after 5 seconds
      setTimeout(() => setRemovedIngredientsNotice(null), 5000);
    }
  }, [filterSelection.regime]);

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

  // Réinitialiser le compteur d'ingrédients affichés quand les filtres changent
  useEffect(() => {
    setDisplayedIngredientsCount(INITIAL_INGREDIENTS_COUNT);
  }, [filterSelection, selectedCategory]);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedIngredientsCount < filteredIngredients.length) {
          setDisplayedIngredientsCount(prev => 
            Math.min(prev + LOAD_MORE_COUNT, filteredIngredients.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: '500px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayedIngredientsCount, filteredIngredients.length]);

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

  return (
    <UserPanel
      cookbook={cookbook}
      updateRecipeCategory={updateRecipeCategory}
      fetchCookbook={fetchCookbook}
      renderNavbar={({ onUserClick, userAvatar, isAuthenticated }) => (
        <Navbar onUserClick={onUserClick} userAvatar={userAvatar} isAuthenticated={isAuthenticated} />
      )}
    >
      <div className="min-h-screen mesh-gradient-bg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e85d04]/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#ffb703]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-[#2d6a4f]/5 rounded-full blur-3xl" />
        </div>
      
        {/* Loading Screen */}
        {generateLoading && <CookingLoadingScreen ingredients={ingredients.map(i => i.label)} />}
        
        {/* Result Modal - Enhanced */}
        <AnimatePresence>
          {showResult && generateResult && (
            <motion.div 
              className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="glass rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative border border-white/20"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {recipeLoading && <RecipeLoadingScreen imageUrl={generateResult?.imageUrl} />}
                
                <div className="p-6 border-b border-[#e85d04]/10 bg-gradient-to-r from-white/50 to-white/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold gradient-text">🍽️ Votre plat de rêve</h3>
                    <motion.button
                      onClick={handleCloseResult}
                      className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 text-[#1a1a2e] flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  {generateResult.imageUrl && (
                    <motion.div 
                      className="mb-6 -mx-6 relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img
                        src={generateResult.imageUrl}
                        alt="Plat généré"
                        className="w-full max-h-[420px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                    </motion.div>
                  )}

                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                      <span>🧺</span> Ingrédients utilisés
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map((ing) => {
                        const ingredientData = ingredientsWithTags.find(
                          i => i.name.toLowerCase() === ing.label.toLowerCase()
                        );
                        const tags = ingredientData?.tags?.slice(0, 2) || [];
                        
                        return (
                          <motion.div
                            key={ing.id}
                            className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-[#e85d04]/20 rounded-xl px-3 py-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="text-lg">{ing.icon}</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-[#1a1a2e]">{ing.label}</span>
                              {tags.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-1.5 py-0.5 bg-[#e85d04]/10 text-[#e85d04] rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                  
                  {recipeError && (
                    <motion.div 
                      className="mb-4 glass border border-red-200/50 rounded-xl px-4 py-3 text-red-600 text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      ⚠️ {recipeError}
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className="mb-6 p-4 glass rounded-2xl border border-[#e85d04]/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="text-sm font-bold text-[#1a1a2e] mb-3">🏷️ Vos sélections</h4>
                    <div className="space-y-2 text-sm">
                      {filterSelection.type && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1a1a2e]/70 min-w-[80px]">Type:</span>
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#e85d04]/20 to-[#ffb703]/20 text-[#e85d04] rounded-full text-xs font-medium">{filterSelection.type}</span>
                        </div>
                      )}
                      {filterSelection.style && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1a1a2e]/70 min-w-[80px]">Style:</span>
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#ffb703]/20 to-[#ffb703]/30 text-[#b8860b] rounded-full text-xs font-medium">{filterSelection.style}</span>
                        </div>
                      )}
                      {filterSelection.cuisson && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1a1a2e]/70 min-w-[80px]">Cuisson:</span>
                          <span className="inline-block px-3 py-1 bg-rose-100/80 text-rose-700 rounded-full text-xs font-medium">{filterSelection.cuisson}</span>
                        </div>
                      )}
                      {filterSelection.regime && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1a1a2e]/70 min-w-[80px]">Régime:</span>
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#2d6a4f]/20 to-[#2d6a4f]/30 text-[#2d6a4f] rounded-full text-xs font-medium">{filterSelection.regime}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.details 
                    className="glass rounded-2xl border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <summary className="p-4 cursor-pointer text-[#1a1a2e] font-medium hover:bg-white/30 rounded-2xl transition-colors">
                      📝 Voir la description du plat
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-[#1a1a2e]/80 leading-relaxed whitespace-pre-wrap text-sm">
                        {generateResult.prompt}
                      </p>
                    </div>
                  </motion.details>
                  
                  {generateResult.imageUrl && (
                    <motion.button
                      onClick={handleGenerateRecipe}
                      disabled={recipeLoading}
                      className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 
                        hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 
                        disabled:from-gray-300 disabled:to-gray-400 
                        text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl 
                        disabled:shadow-none transition-all flex items-center justify-center gap-3
                        relative overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 shimmer-bg opacity-50" />
                      <span className="text-2xl relative z-10">📖</span>
                      <span className="relative z-10">Générer la Recette</span>
                      <span className="text-sm opacity-75 relative z-10">(avec IA Vision)</span>
                    </motion.button>
                  )}
                  
                  <motion.div 
                    className="mt-4 flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    {generateResult.imageUrl && (
                      <motion.a
                        href={generateResult.imageUrl}
                        download="dreamdish-creation.png"
                        className="flex-1 min-w-[140px] py-3 px-4 glass hover:bg-white/60 text-[#1a1a2e] rounded-xl font-medium transition-colors text-center border border-white/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        💾 Télécharger
                      </motion.a>
                    )}
                    <motion.button
                      onClick={() => navigator.clipboard.writeText(generateResult.prompt)}
                      className="flex-1 min-w-[140px] py-3 px-4 glass hover:bg-white/60 text-[#1a1a2e] rounded-xl font-medium transition-colors border border-white/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📋 Copier le prompt
                    </motion.button>
                    <motion.button
                      onClick={handleCloseResult}
                      className="flex-1 min-w-[140px] py-3 px-4 bg-gradient-to-r from-[#e85d04] to-[#ffb703] hover:from-[#d45003] hover:to-[#e5a503] text-white rounded-xl font-medium transition-colors shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ✨ Nouveau plat
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <main className="flex flex-col items-center justify-center min-h-screen pt-36 sm:pt-40 pb-40 sm:pb-48 px-4 relative z-10">
            {/* Hero Section - Chef's Table */}
            <motion.div 
            className="relative w-full max-w-7xl mb-8 sm:mb-16 px-8 sm:px-12"
            style={{ perspective: '900px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            >
            {/* Hero Title with Gradient */}
            <motion.h1 
              className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-5xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-center whitespace-nowrap z-10 font-sans uppercase"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="gradient-text drop-shadow-lg">CRÉE TON PLAT DE RÊVE</span>
            </motion.h1>
            
            
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
              style={{
                transform: 'rotateX(35deg)',
                transformStyle: 'preserve-3d',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)',
                overflow: 'visible',
                paddingTop: '40px'
              }}
            >
              {dishes.map((dish, index) => (
                <DishCard
                  key={index}
                  image={dish.image}
                  imageUrl={dish.imageUrl}
                  title={dish.title}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          {/* Section Title - Enhanced */}
          <motion.div 
            className="w-full py-6 sm:py-8 mt-2 mb-8 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="max-w-4xl mx-auto px-4">
              <div className="glass rounded-3xl px-8 py-6 border border-white/30 shadow-xl">
                <h2 className="text-xl sm:text-3xl font-extrabold text-center">
                  <span className="text-[#1a1a2e]">Choisissez parmi </span>
                  <span className="gradient-text">des centaines d&apos;ingrédients</span>
                </h2>
                <p className="text-center text-[#1a1a2e]/60 mt-2 text-sm sm:text-base">
                  Sélectionnez vos favoris et laissez l&apos;IA créer votre plat parfait
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Ingredients Section */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-16 sm:pt-8 sm:pb-20">
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <FilterBar value={filterSelection} onValueChange={handleFilterSelection} />
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {filteredIngredients.slice(0, displayedIngredientsCount).map((ingredient, index) => (
                <IngredientCard
                  key={ingredient.name}
                  name={ingredient.name}
                  color={ingredient.color}
                  icon={ingredient.icon}
                  onSelect={() => handleSelectIngredient(ingredient)}
                />
              ))}
            </motion.div>

            {displayedIngredientsCount < filteredIngredients.length && (
              <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
            )}
            
            {filteredIngredients.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-2xl text-[#e85d04]">
                  Aucun ingrédient ne correspond aux filtres sélectionnés
                </p>
                <p className="text-[#1a1a2e]/60 mt-2">
                  Essayez de retirer certains filtres
                </p>
              </motion.div>
            )}
          </section>
        </main>

        {/* Floating Action Bar - macOS Dock Style */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-20">
          <motion.div 
            className="glass rounded-3xl shadow-2xl p-5 space-y-4 border border-white/30"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            {generateError && (
              <motion.div 
                className="glass border border-red-200/50 rounded-xl px-4 py-3 text-red-600 text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                ⚠️ {generateError}
              </motion.div>
            )}
            
            {removedIngredientsNotice && (
              <motion.div 
                className="glass border border-[#ffb703]/50 rounded-xl px-4 py-3 text-[#b8860b] text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                ⚠️ {removedIngredientsNotice}
              </motion.div>
            )}
            
            {/* Selected Items Area */}
            <div className="flex flex-wrap gap-2.5 min-h-[3rem] items-center">
              {/* Filter Selection Tags */}
              {activeFilterSelections.map(({ type, value: tagValue }) => {
                const colors = FILTER_TAG_COLORS[type];
                return (
                  <div
                    key={type}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-md backdrop-blur-sm ${colors.bg} ${colors.border} ${colors.text} text-sm font-medium animate-in fade-in zoom-in-95 duration-200`}
                  >
                    <span className="text-lg">{colors.icon}</span>
                    <span>{tagValue}</span>
                    <button
                      onClick={() => handleRemoveFilter(type)}
                      className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/10 transition-all text-xs font-bold hover:scale-110 active:scale-90"
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
                <span className="text-[#1a1a2e]/40 italic animate-in fade-in duration-300">
                  Ajoutez des ingrédients pour commencer...
                </span>
              )}
            </div>
            
            {/* Input Area */}
            <div className="relative">
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-5 py-3 border border-[#e85d04]/10 focus-within:border-[#e85d04]/30 focus-within:bg-white/70 transition-all duration-300">
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
                  className="flex-1 bg-transparent outline-none text-[#1a1a2e] placeholder:text-[#1a1a2e]/40 text-sm sm:text-base"
                />
                <motion.button
                  onClick={() => handleAddIngredient()}
                  className="w-10 h-10 rounded-xl bg-white/70 hover:bg-white text-[#e85d04] font-bold text-xl transition-all flex items-center justify-center border border-[#e85d04]/20"
                  title="Ajouter un ingrédient"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  +
                </motion.button>
                
                {/* Generate Button - The Star */}
                <motion.button
                  onClick={handleGenerate}
                  disabled={ingredients.length === 0 || generateLoading}
                  className="px-6 h-12 rounded-xl bg-gradient-to-r from-[#e85d04] via-[#ff6b1a] to-[#ffb703] 
                    hover:from-[#d45003] hover:via-[#e85d04] hover:to-[#e5a503]
                    disabled:from-gray-300 disabled:to-gray-400 
                    text-white font-bold shadow-lg hover:shadow-xl disabled:shadow-none 
                    transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                  title="Générer votre plat"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-3 right-4 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute bottom-2 left-6 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.6s' }} />
                    <div className="absolute bottom-3 right-8 w-0.5 h-0.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.9s' }} />
                  </div>
                  <div className="absolute inset-0 shimmer-bg opacity-30 group-hover:opacity-50 transition-opacity" />
                  <span className="relative z-10 text-lg">✨</span>
                  <span className="relative z-10">Générer</span>
                </motion.button>
              </div>

              {/* Suggestions Dropdown - Enhanced */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div 
                    className="absolute bottom-full left-0 right-0 mb-2 glass rounded-2xl shadow-xl border border-white/30 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="p-2">
                      <p className="text-xs text-[#1a1a2e]/50 px-3 py-1 font-medium">Suggestions</p>
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-white/50 rounded-xl text-[#1a1a2e] transition-colors flex items-center gap-3"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-lg">🥗</span>
                          <span className="font-medium">{suggestion}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {suggestionsLoading && inputValue.length >= 2 && (
                <motion.div 
                  className="absolute bottom-full left-0 right-0 mb-2 glass rounded-2xl shadow-xl border border-white/30 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-3 text-[#e85d04]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
                      <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
                      <div className="w-2 h-2 bg-[#e85d04] rounded-full processing-dot"></div>
                    </div>
                    <span className="font-medium">Recherche de suggestions...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Filter Button - Enhanced */}
        <div className="fixed bottom-40 right-4 md:bottom-12 md:right-8 z-40 flex flex-col items-end gap-3">
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                className="w-[320px] md:w-[400px] max-h-[60vh] overflow-y-auto glass rounded-2xl border border-white/30 shadow-xl p-5"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold tracking-wide text-[#1a1a2e] uppercase">Filtres</h3>
                  <motion.button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 rounded-full border border-[#e85d04]/20 text-[#e85d04] hover:bg-[#e85d04]/10 transition"
                    aria-label="Fermer"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
                <FilterBar
                  value={filterSelection}
                  onValueChange={handleFilterSelection}
                  collapsible
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={() => setIsFilterOpen(prev => !prev)}
            aria-label="Ouvrir les filtres"
            className="w-14 h-14 rounded-2xl glass border border-white/30 text-[#e85d04] shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width="24"
              height="24"
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
          </motion.button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </UserPanel>
  );
}
