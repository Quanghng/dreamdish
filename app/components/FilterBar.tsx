'use client';

import { useState } from 'react';
import type { FilterSelection } from '@/types';

const CATEGORIES = ['viande', 'poisson', 'légume', 'fruit', 'produit laitier', 'céréale'];
const CUISSON = ['chaud', 'froid', 'ambiant'];
const STYLE = ['français', 'italien', 'japonais', 'chinois', 'indien', 'mexicain', 'américain', 'méditerranéen'];
const REGIME = ['végétarien', 'vegan', 'sans gluten', 'sans lactose', 'halal', 'casher'];
const TYPE = ['entrée', 'plat principal', 'dessert', 'apéritif', 'petit-déjeuner'];

interface FilterChipProps {
  label: string;
  group: 'category' | 'cuisson' | 'style' | 'regime' | 'type';
  selection: FilterSelection;
  onToggle: (filter: string) => void;
}

function FilterChip({ label, group, selection, onToggle }: FilterChipProps) {
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
      onClick={() => onToggle(label)}
      className={`px-5 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium ${
        isActive
          ? 'bg-amber-500 border-amber-500 text-white shadow-md'
          : 'bg-white border-amber-200 text-amber-900 hover:border-amber-400'
      }`}
    >
      {label}
    </button>
  );
}

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

  return (
    <div className="space-y-6 px-4 md:px-6">
      {/* Catégories */}
      <div className="grid gap-3 md:grid-cols-[220px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, category: !prev.category }))
            }
            className="flex w-full items-center justify-start gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-left text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 min-h-[40px]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700">
              {openSections.category ? '−' : '+'}
            </span>
            Catégories
          </button>
        ) : (
          <h3 className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-semibold text-amber-900 shadow-sm min-h-[40px]">
            Catégories
          </h3>
        )}
        {(!collapsible || openSections.category) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="viande" group="category" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="poisson" group="category" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="légume" group="category" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="fruit" group="category" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="produit laitier" group="category" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="céréale" group="category" selection={selection} onToggle={toggleFilter} />
          </div>
        )}
      </div>

      {/* Cuisson */}
      <div className="grid gap-3 md:grid-cols-[220px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, cuisson: !prev.cuisson }))
            }
            className="flex w-full items-center justify-start gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-left text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 min-h-[40px]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700">
              {openSections.cuisson ? '−' : '+'}
            </span>
            Cuisson
          </button>
        ) : (
          <h3 className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-semibold text-amber-900 shadow-sm min-h-[40px]">
            Cuisson
          </h3>
        )}
        {(!collapsible || openSections.cuisson) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="chaud" group="cuisson" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="froid" group="cuisson" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="ambiant" group="cuisson" selection={selection} onToggle={toggleFilter} />
          </div>
        )}
      </div>

      {/* Style de cuisine */}
      <div className="grid gap-3 md:grid-cols-[220px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, style: !prev.style }))
            }
            className="flex w-full items-center justify-start gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-left text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 min-h-[40px]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700">
              {openSections.style ? '−' : '+'}
            </span>
            Style de cuisine
          </button>
        ) : (
          <h3 className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-semibold text-amber-900 shadow-sm min-h-[40px]">
            Style de cuisine
          </h3>
        )}
        {(!collapsible || openSections.style) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="français" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="italien" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="japonais" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="chinois" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="indien" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="mexicain" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="américain" group="style" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="méditerranéen" group="style" selection={selection} onToggle={toggleFilter} />
          </div>
        )}
      </div>

      {/* Régime alimentaire */}
      <div className="grid gap-3 md:grid-cols-[220px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, regime: !prev.regime }))
            }
            className="flex w-full items-center justify-start gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-left text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 min-h-[40px]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700">
              {openSections.regime ? '−' : '+'}
            </span>
            Régime
          </button>
        ) : (
          <h3 className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-semibold text-amber-900 shadow-sm min-h-[40px]">
            Régime
          </h3>
        )}
        {(!collapsible || openSections.regime) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="végétarien" group="regime" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="vegan" group="regime" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="sans gluten" group="regime" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="sans lactose" group="regime" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="halal" group="regime" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="casher" group="regime" selection={selection} onToggle={toggleFilter} />
          </div>
        )}
      </div>

      {/* Type de plat */}
      <div className="grid gap-3 md:grid-cols-[220px_1fr] items-start">
        {collapsible ? (
          <button
            type="button"
            onClick={() =>
              setOpenSections(prev => ({ ...prev, type: !prev.type }))
            }
            className="flex w-full items-center justify-start gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-left text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 min-h-[40px]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700">
              {openSections.type ? '−' : '+'}
            </span>
            Type de plat
          </button>
        ) : (
          <h3 className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-semibold text-amber-900 shadow-sm min-h-[40px]">
            Type de plat
          </h3>
        )}
        {(!collapsible || openSections.type) && (
          <div className="flex flex-wrap gap-2">
            <FilterChip label="entrée" group="type" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="plat principal" group="type" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="dessert" group="type" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="apéritif" group="type" selection={selection} onToggle={toggleFilter} />
            <FilterChip label="petit-déjeuner" group="type" selection={selection} onToggle={toggleFilter} />
          </div>
        )}
      </div>
    </div>
  );
}
