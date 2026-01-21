'use client';

import { useState } from 'react';
import type {
  GeneratedRecipe,
  NutritionalInfo,
  DrinkPairing,
  RecipeIngredient,
  RecipeStep
} from '@/types';

interface RecipeDisplayProps {
  recipe: GeneratedRecipe;
  imageUrl: string;
  nutritionalInfo?: NutritionalInfo;
  drinkPairings?: DrinkPairing[];
  onClose: () => void;
  onSaveToCookbook?: () => void;
  isSaved?: boolean;
  variant?: 'modal' | 'page';
}

type TabType = 'recipe' | 'nutrition' | 'pairing';

export default function RecipeDisplay({
  recipe,
  imageUrl,
  nutritionalInfo,
  drinkPairings,
  onClose,
  onSaveToCookbook,
  isSaved = false,
  variant = 'modal'
}: RecipeDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('recipe');
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'principal': return '🥩';
      case 'condiment': return '🧂';
      case 'épice': return '🌶️';
      case 'garniture': return '🌿';
      case 'sauce': return '🥫';
      default: return '🥗';
    }
  };

  const getDrinkTypeIcon = (type: string) => {
    switch (type) {
      case 'vin': return '🍷';
      case 'bière': return '🍺';
      case 'cocktail': return '🍸';
      case 'sans-alcool': return '🧃';
      default: return '🥤';
    }
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  const isModal = variant === 'modal';
  const overlayClassName = isModal
    ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto'
    : 'w-full';
  const cardClassName = isModal
    ? 'bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col'
    : 'bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col';

  return (
    <div className={overlayClassName}>
      <div className={cardClassName}>
        {/* Header avec image */}
        <div className="relative h-64 flex-shrink-0">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-lg"
          >
            ✕
          </button>

          {/* Titre et infos */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {recipe.title}
            </h2>
            <p className="text-white/90 text-sm mb-3 line-clamp-2">
              {recipe.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                ⏱️ {totalTime} min
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                👥 {recipe.servings} portions
              </span>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('recipe')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'recipe' 
                ? 'text-amber-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📖 Recette
            {activeTab === 'recipe' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'nutrition' 
                ? 'text-amber-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🥗 Nutrition
            {activeTab === 'nutrition' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('pairing')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'pairing' 
                ? 'text-amber-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🍷 Accords
            {activeTab === 'pairing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        </div>

        {/* Contenu des tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Recette */}
          {activeTab === 'recipe' && (
            <div className="space-y-8">
              {/* Ingrédients */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🧺</span> Ingrédients
                  <span className="text-sm font-normal text-gray-500">
                    ({recipe.ingredients.length} éléments)
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        checkedIngredients.has(ing.name)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedIngredients.has(ing.name)}
                        onChange={() => toggleIngredient(ing.name)}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-lg">{getCategoryIcon(ing.category)}</span>
                      <div className="flex-1">
                        <span className={`font-medium ${checkedIngredients.has(ing.name) ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {ing.name}
                        </span>
                        {ing.isOriginal && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            original
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {ing.quantity} {ing.unit}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👨‍🍳</span> Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl transition-colors ${
                        checkedSteps.has(step.stepNumber)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleStep(step.stepNumber)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                            checkedSteps.has(step.stepNumber)
                              ? 'bg-green-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {checkedSteps.has(step.stepNumber) ? '✓' : step.stepNumber}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${checkedSteps.has(step.stepNumber) ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {step.title}
                            </h4>
                            {step.duration && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                ⏱️ {step.duration} min
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${checkedSteps.has(step.stepNumber) ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.instruction}
                          </p>
                          {step.tips && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                              <p className="text-xs text-amber-700">
                                💡 <strong>Conseil:</strong> {step.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide de dressage */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎨</span> Guide de dressage
                </h3>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <p className="text-gray-700 leading-relaxed">
                    {recipe.platingGuide}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Nutrition */}
          {activeTab === 'nutrition' && nutritionalInfo && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-3">
                  <span className="text-3xl">🥗</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {nutritionalInfo.calories} kcal
                </h3>
                <p className="text-gray-500 text-sm">par portion</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NutrientCard
                  label="Protéines"
                  value={nutritionalInfo.protein}
                  unit="g"
                  color="bg-blue-100 text-blue-700"
                  icon="🥩"
                />
                <NutrientCard
                  label="Glucides"
                  value={nutritionalInfo.carbohydrates}
                  unit="g"
                  color="bg-yellow-100 text-yellow-700"
                  icon="🍞"
                />
                <NutrientCard
                  label="Lipides"
                  value={nutritionalInfo.fat}
                  unit="g"
                  color="bg-orange-100 text-orange-700"
                  icon="🧈"
                />
                <NutrientCard
                  label="Fibres"
                  value={nutritionalInfo.fiber}
                  unit="g"
                  color="bg-green-100 text-green-700"
                  icon="🥬"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span>🧂</span>
                  <span className="font-medium text-gray-900">Sodium</span>
                </div>
                <p className="text-2xl font-bold text-gray-700">
                  {nutritionalInfo.sodium} mg
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700">
                  ⚠️ {nutritionalInfo.disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Tab Accords */}
          {activeTab === 'pairing' && drinkPairings && drinkPairings.length > 0 && (
            <div className="space-y-4">
              {drinkPairings.map((pairing, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-2xl">{getDrinkTypeIcon(pairing.type)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{pairing.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full capitalize">
                          {pairing.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {pairing.description}
                      </p>
                      <div className="p-2 bg-white/50 rounded-lg mb-2">
                        <p className="text-xs text-purple-700">
                          <strong>Pourquoi cet accord:</strong> {pairing.reason}
                        </p>
                      </div>
                      {pairing.alternatives && pairing.alternatives.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500">Alternatives:</span>
                          {pairing.alternatives.map((alt, altIdx) => (
                            <span
                              key={altIdx}
                              className="text-xs px-2 py-0.5 bg-white/70 text-gray-600 rounded-full"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => {
                const recipeText = formatRecipeAsText(recipe);
                navigator.clipboard.writeText(recipeText);
              }}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <span>📋</span> Copier
            </button>
            <button
              onClick={() => {
                const recipeText = formatRecipeAsText(recipe);
                const blob = new Blob([recipeText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${recipe.title.replace(/\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <span>💾</span> Exporter
            </button>
            {onSaveToCookbook && (
              <button
                onClick={onSaveToCookbook}
                disabled={isSaved}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white'
                }`}
              >
                <span>{isSaved ? '✓' : '📚'}</span>
                {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une carte de nutriment
function NutrientCard({
  label,
  value,
  unit,
  color,
  icon
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        {value}<span className="text-sm font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
}

// Fonction pour formater la recette en texte
function formatRecipeAsText(recipe: GeneratedRecipe): string {
  let text = `# ${recipe.title}\n\n`;
  text += `${recipe.description}\n\n`;
  text += `⏱️ Préparation: ${recipe.prepTime} min | Cuisson: ${recipe.cookTime} min\n`;
  text += `👥 Portions: ${recipe.servings} | Difficulté: ${recipe.difficulty}\n\n`;

  text += `## Ingrédients\n\n`;
  recipe.ingredients.forEach(ing => {
    text += `- ${ing.quantity} ${ing.unit} ${ing.name}${ing.isOriginal ? ' (original)' : ''}\n`;
  });

  text += `\n## Instructions\n\n`;
  recipe.instructions.forEach(step => {
    text += `${step.stepNumber}. **${step.title}**${step.duration ? ` (${step.duration} min)` : ''}\n`;
    text += `   ${step.instruction}\n`;
    if (step.tips) {
      text += `   💡 Conseil: ${step.tips}\n`;
    }
    text += `\n`;
  });

  text += `## Dressage\n\n${recipe.platingGuide}\n`;

  if (recipe.tags && recipe.tags.length > 0) {
    text += `\nTags: ${recipe.tags.map(t => `#${t}`).join(' ')}\n`;
  }

  return text;
}
