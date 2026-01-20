'use client';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import DishCard from './components/DishCard';
import IngredientTag from './components/IngredientTag';
import FilterBar from './components/FilterBar';
import IngredientCard from './components/IngredientCard';
import Footer from './components/Footer';
import CookingLoadingScreen from './components/CookingLoadingScreen';
import { ingredientsData } from '../data/ingredients';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useGenerate } from '@/hooks/useGenerate';

interface Ingredient {
  id: string;
  icon: string;
  label: string;
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', icon: '🍌', label: 'Banane' },
  { id: '2', icon: '🍫', label: 'Chocolat' },
  { id: '3', icon: '🐟', label: 'Saumon' },
];
const DEFAULT_INGREDIENT_IDS = new Set(DEFAULT_INGREDIENTS.map(ing => ing.id));
const DEFAULT_INGREDIENT_LABELS = new Set(
  DEFAULT_INGREDIENTS.map(ing => ing.label.toLowerCase())
);

interface FilterSelection {
  category: string;
  cuisson: string;
  style: string;
  regime: string;
  type: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hasClearedDefaults, setHasClearedDefaults] = useState(false);
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
  // - Catégories: OBLIGATOIRE si sélectionné (légume, poisson, etc)
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
    return true;
  });

  const handleFilterSelection = (nextSelection: FilterSelection) => {
    setFilterSelection(nextSelection);
    setActiveFilters(
      [nextSelection.cuisson, nextSelection.style, nextSelection.regime, nextSelection.type].filter(Boolean)
    );
    setSelectedCategory(nextSelection.category || '');
  };

  const handleSelectIngredient = (ing: any) => {
    const name = ing.name || ing.label;
    setIngredients(prev => {
      if (prev.some(i => i.label.toLowerCase() === name.toLowerCase())) return prev;
      const newIngredient: Ingredient = {
        id: `${Date.now()}_${name}`,
        icon: ing.icon || '🥗',
        label: name,
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
    });
    
    if (result) {
      setShowResult(true);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleAddIngredient(suggestion);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    resetGenerate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      <Navbar />
      
      {/* Loading Screen */}
      {generateLoading && <CookingLoadingScreen ingredients={ingredients.map(i => i.label)} />}
      
      {showResult && generateResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
              <p className="text-sm text-amber-600 mt-1">
                Généré avec {generateResult.model} • {generateResult.tokensUsed} tokens
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Generated Image */}
              {generateResult.imageUrl && (
                <div className="mb-6">
                  <img
                    src={generateResult.imageUrl}
                    alt="Plat généré"
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
              )}
              
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
              
              <div className="mt-4 flex gap-3">
                {generateResult.imageUrl && (
                  <a
                    href={generateResult.imageUrl}
                    download="dreamdish-creation.png"
                    className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-medium transition-colors text-center"
                  >
                    💾 Télécharger
                  </a>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(generateResult.prompt)}
                  className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-medium transition-colors"
                >
                  📋 Copier le prompt
                </button>
                <button
                  onClick={handleCloseResult}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-xl font-medium transition-colors"
                >
                  ✨ Nouveau plat
                </button>
              </div>
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
            Choisissez parmi des centaines d'ingrédients
          </h2>
        </div>
        
        <section className="w-full max-w-7xl mx-auto px-8 py-20">
          <div className="mb-12">
            <FilterBar value={filterSelection} onValueChange={handleFilterSelection} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredIngredients.map((ingredient, index) => (
              <IngredientCard
                key={index}
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
            {ingredients.map((ingredient) => (
              <IngredientTag
                key={ingredient.id}
                icon={ingredient.icon}
                label={ingredient.label}
                onRemove={() => handleRemoveIngredient(ingredient.id)}
              />
            ))}
            {ingredients.length === 0 && (
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
