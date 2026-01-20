'use client';

import { useState } from 'react';
import type { FilterSelection } from '@/types';

const CATEGORIES = ['viande', 'poisson', 'légume', 'fruit', 'produit laitier', 'céréale'];
const CUISSON = ['chaud', 'froid', 'ambiant'];
const STYLE = ['français', 'italien', 'japonais', 'chinois', 'indien', 'mexicain', 'américain', 'méditerranéen'];
const REGIME = ['végétarien', 'vegan', 'sans gluten', 'sans lactose', 'halal', 'casher'];
const TYPE = ['entrée', 'plat principal', 'dessert', 'apéritif', 'petit-déjeuner'];

interface FilterBarProps {
  value?: FilterSelection;
  onValueChange?: (value: FilterSelection) => void;
  collapsible?: boolean;
}

export default function FilterBar({ value, onValueChange, collapsible = false }: FilterBarProps) {
  const [internalSelection, setInternalSelection] = useState<FilterSelection>({
    category: '',
    cuisson: '',
    style: '',
    regime: '',
    type: '',
  });
  const [openSections, setOpenSections] = useState(() => ({
    category: !collapsible,
    cuisson: !collapsible,
    style: !collapsible,
    regime: !collapsible,
    type: !collapsible,
  }));
  const selection = value ?? internalSelection;

  const toggleFilter = (filter: string) => {
    const nextSelection: FilterSelection = { ...selection };

    if (CATEGORIES.includes(filter)) {
      // Single-select category: select or deselect
      nextSelection.category = selection.category === filter ? '' : filter;
    } else if (CUISSON.includes(filter)) {
      nextSelection.cuisson = selection.cuisson === filter ? '' : filter;
    } else if (STYLE.includes(filter)) {
      nextSelection.style = selection.style === filter ? '' : filter;
    } else if (REGIME.includes(filter)) {
      nextSelection.regime = selection.regime === filter ? '' : filter;
    } else if (TYPE.includes(filter)) {
      nextSelection.type = selection.type === filter ? '' : filter;
    }

    if (!value) {
      setInternalSelection(nextSelection);
    }
    onValueChange?.(nextSelection);
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
        ? selection.category === label
        : group === 'cuisson'
          ? selection.cuisson === label
          : group === 'style'
            ? selection.style === label
            : group === 'regime'
              ? selection.regime === label
              : selection.type === label;
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
    <div className="space-y-6 px-6 md:px-8">
      {/* Catégories */}
      <div className="grid gap-3 md:grid-cols-[160px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, category: !prev.category }))
            }
            className="flex items-center gap-2 text-left text-lg font-semibold text-amber-900"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              {openSections.category ? '−' : '+'}
            </span>
            Catégories
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-amber-900">Catégories</h3>
        )}
        {(!collapsible || openSections.category) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="viande" group="category" />
            <FilterChip label="poisson" group="category" />
            <FilterChip label="légume" group="category" />
            <FilterChip label="fruit" group="category" />
            <FilterChip label="produit laitier" group="category" />
            <FilterChip label="céréale" group="category" />
          </div>
        )}
      </div>

      {/* Cuisson */}
      <div className="grid gap-3 md:grid-cols-[160px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, cuisson: !prev.cuisson }))
            }
            className="flex items-center gap-2 text-left text-lg font-semibold text-amber-900"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              {openSections.cuisson ? '−' : '+'}
            </span>
            Cuisson
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-amber-900">Cuisson</h3>
        )}
        {(!collapsible || openSections.cuisson) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="chaud" group="cuisson" />
            <FilterChip label="froid" group="cuisson" />
            <FilterChip label="ambiant" group="cuisson" />
          </div>
        )}
      </div>

      {/* Style de cuisine */}
      <div className="grid gap-3 md:grid-cols-[160px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, style: !prev.style }))
            }
            className="flex items-center gap-2 text-left text-lg font-semibold text-amber-900"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              {openSections.style ? '−' : '+'}
            </span>
            Style de cuisine
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-amber-900">Style de cuisine</h3>
        )}
        {(!collapsible || openSections.style) && (
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
        )}
      </div>

      {/* Régime alimentaire */}
      <div className="grid gap-3 md:grid-cols-[160px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, regime: !prev.regime }))
            }
            className="flex items-center gap-2 text-left text-lg font-semibold text-amber-900"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              {openSections.regime ? '−' : '+'}
            </span>
            Régime
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-amber-900">Régime</h3>
        )}
        {(!collapsible || openSections.regime) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="végétarien" group="regime" />
            <FilterChip label="vegan" group="regime" />
            <FilterChip label="sans gluten" group="regime" />
            <FilterChip label="sans lactose" group="regime" />
            <FilterChip label="halal" group="regime" />
            <FilterChip label="casher" group="regime" />
          </div>
        )}
      </div>

      {/* Type de plat */}
      <div className="grid gap-3 md:grid-cols-[160px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, type: !prev.type }))
            }
            className="flex items-center gap-2 text-left text-lg font-semibold text-amber-900"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              {openSections.type ? '−' : '+'}
            </span>
            Type de plat
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-amber-900">Type de plat</h3>
        )}
        {(!collapsible || openSections.type) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="entrée" group="type" />
            <FilterChip label="plat principal" group="type" />
            <FilterChip label="dessert" group="type" />
            <FilterChip label="apéritif" group="type" />
            <FilterChip label="petit-déjeuner" group="type" />
          </div>
        )}
      </div>
    </div>
  );
}
