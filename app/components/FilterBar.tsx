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
        className={`px-5 py-2 rounded-full border-2 transition-all duration-300 ${
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
    <div className="flex flex-wrap items-center justify-center gap-4 px-8">
      {/* Catégories */}
      <div className="flex gap-3">
        <FilterChip label="viande" />
        <FilterChip label="légume" />
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-amber-300" />

      {/* Style de cuisine */}
      <div className="flex gap-3">
        <FilterChip label="américain" />
        <FilterChip label="japonais" />
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-amber-300" />

      {/* Particularités */}
      <div className="flex gap-3">
        <FilterChip label="sans gluten" />
      </div>
    </div>
  );
}
