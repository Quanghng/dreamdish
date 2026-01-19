'use client';

import { useState } from 'react';

const CATEGORIES = ['viande', 'poisson', 'légume', 'fruit', 'produit laitier', 'céréale'];
const CUISSON = ['chaud', 'froid', 'ambiant'];
const STYLE = ['français', 'italien', 'japonais', 'chinois', 'indien', 'mexicain', 'américain', 'méditerranéen'];
const REGIME = ['végétarien', 'vegan', 'sans gluten', 'sans lactose', 'halal', 'casher'];
const TYPE = ['entrée', 'plat principal', 'dessert', 'apéritif', 'petit-déjeuner'];

interface FilterBarProps {
  // filters: other optional filters (Cuisson/Style/Régime/Type)
  // category: single selected main category (or undefined)
  onFilterChange?: (filters: string[], category?: string) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCuisson, setSelectedCuisson] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedRegime, setSelectedRegime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const toggleFilter = (filter: string) => {
    let newCategory = selectedCategory;
    let newCuisson = selectedCuisson;
    let newStyle = selectedStyle;
    let newRegime = selectedRegime;
    let newType = selectedType;

    if (CATEGORIES.includes(filter)) {
      // Single-select category: select or deselect
      if (selectedCategory === filter) {
        newCategory = '';
      } else {
        newCategory = filter;
      }
      setSelectedCategory(newCategory);
    } else if (CUISSON.includes(filter)) {
      newCuisson = selectedCuisson === filter ? '' : filter;
      setSelectedCuisson(newCuisson);
    } else if (STYLE.includes(filter)) {
      newStyle = selectedStyle === filter ? '' : filter;
      setSelectedStyle(newStyle);
    } else if (REGIME.includes(filter)) {
      newRegime = selectedRegime === filter ? '' : filter;
      setSelectedRegime(newRegime);
    } else if (TYPE.includes(filter)) {
      newType = selectedType === filter ? '' : filter;
      setSelectedType(newType);
    }

    const newFilters = [newCuisson, newStyle, newRegime, newType].filter(Boolean);
    onFilterChange?.(newFilters, newCategory || undefined);
  };

  const FilterChip = ({
    label,
    group,
  }: {
    label: string;
    group: 'category' | 'cuisson' | 'style' | 'regime' | 'type';
  }) => {
    const isActive =
      group === 'category'
        ? selectedCategory === label
        : group === 'cuisson'
          ? selectedCuisson === label
          : group === 'style'
            ? selectedStyle === label
            : group === 'regime'
              ? selectedRegime === label
              : selectedType === label;
    return (
      <button
        onClick={() => toggleFilter(label)}
        className={`px-5 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium ${
          isActive
            ? 'bg-amber-500 border-amber-500 text-white shadow-md'
            : 'bg-white border-amber-200 text-amber-900 hover:border-amber-400'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4 px-8">
      {/* Mode explanation */}
      <div className="text-xs text-amber-600 opacity-75 mb-3 px-2 bg-amber-50 py-2 rounded">
        💡 <strong>Logique de filtrage:</strong> Catégories = obligatoire | Cuisson/Style/Régime = optionnel (ajout à la catégorie)
      </div>
      
      {/* Catégories */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Catégories :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="viande" group="category" />
          <FilterChip label="poisson" group="category" />
          <FilterChip label="légume" group="category" />
          <FilterChip label="fruit" group="category" />
          <FilterChip label="produit laitier" group="category" />
          <FilterChip label="céréale" group="category" />
        </div>
      </div>

      {/* Cuisson */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Cuisson :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="chaud" group="cuisson" />
          <FilterChip label="froid" group="cuisson" />
          <FilterChip label="ambiant" group="cuisson" />
        </div>
      </div>

      {/* Style de cuisine */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Style de cuisine :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="français" group="style" />
          <FilterChip label="italien" group="style" />
          <FilterChip label="japonais" group="style" />
          <FilterChip label="chinois" group="style" />
          <FilterChip label="indien" group="style" />
          <FilterChip label="mexicain" group="style" />
          <FilterChip label="américain" group="style" />
          <FilterChip label="méditerranéen" group="style" />
        </div>
      </div>

      {/* Régime alimentaire */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Régime :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="végétarien" group="regime" />
          <FilterChip label="vegan" group="regime" />
          <FilterChip label="sans gluten" group="regime" />
          <FilterChip label="sans lactose" group="regime" />
          <FilterChip label="halal" group="regime" />
          <FilterChip label="casher" group="regime" />
        </div>
      </div>

      {/* Type de plat */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Type de plat :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="entrée" group="type" />
          <FilterChip label="plat principal" group="type" />
          <FilterChip label="dessert" group="type" />
          <FilterChip label="apéritif" group="type" />
          <FilterChip label="petit-déjeuner" group="type" />
        </div>
      </div>
    </div>
  );
}
