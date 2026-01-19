'use client';

import { useState } from 'react';

interface FilterBarProps {
  onFilterChange?: (filters: string[]) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const FilterChip = ({ label }: { label: string }) => {
    const isActive = activeFilters.includes(label);
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
      {/* Catégories */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Catégories :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="viande" />
          <FilterChip label="poisson" />
          <FilterChip label="légume" />
          <FilterChip label="fruit" />
          <FilterChip label="produit laitier" />
          <FilterChip label="céréale" />
        </div>
      </div>

      {/* Cuisson */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Cuisson :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="chaud" />
          <FilterChip label="froid" />
          <FilterChip label="ambiant" />
        </div>
      </div>

      {/* Style de cuisine */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Style de cuisine :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="français" />
          <FilterChip label="italien" />
          <FilterChip label="japonais" />
          <FilterChip label="chinois" />
          <FilterChip label="indien" />
          <FilterChip label="mexicain" />
          <FilterChip label="américain" />
          <FilterChip label="méditerranéen" />
        </div>
      </div>

      {/* Régime alimentaire */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Régime :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="végétarien" />
          <FilterChip label="vegan" />
          <FilterChip label="sans gluten" />
          <FilterChip label="sans lactose" />
          <FilterChip label="halal" />
          <FilterChip label="casher" />
        </div>
      </div>

      {/* Type de plat */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-amber-900 min-w-[140px]">Type de plat :</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="entrée" />
          <FilterChip label="plat principal" />
          <FilterChip label="dessert" />
          <FilterChip label="apéritif" />
          <FilterChip label="petit-déjeuner" />
        </div>
      </div>
    </div>
  );
}
