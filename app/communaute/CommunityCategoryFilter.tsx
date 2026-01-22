'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface CommunityCategoryFilterProps {
  categories: string[];
  selected: string;
  uncategorizedToken: string;
  canFilterMine?: boolean;
  isMineSelected?: boolean;
}

export default function CommunityCategoryFilter({
  categories,
  selected,
  uncategorizedToken,
  canFilterMine = false,
  isMineSelected = false,
}: CommunityCategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(() => {
    const base = ['Tous', 'Sans catégorie', ...categories.filter(Boolean)];
    const unique = Array.from(new Set(base));
    return unique;
  }, [categories]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-amber-800">Filtrer</span>
      {canFilterMine ? (
        <button
          type="button"
          onClick={() => {
            const nextParams = new URLSearchParams(searchParams.toString());
            if (isMineSelected) {
              nextParams.delete('mine');
            } else {
              nextParams.set('mine', '1');
            }
            const qs = nextParams.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname);
          }}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            isMineSelected
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
          }`}
          aria-pressed={isMineSelected}
        >
          Mes créations
        </button>
      ) : null}
      <select
        value={selected}
        onChange={(e) => {
          const next = e.target.value;
          const nextParams = new URLSearchParams(searchParams.toString());
          if (!next || next === 'Tous') {
            nextParams.delete('category');
          } else if (next === 'Sans catégorie') {
            nextParams.set('category', uncategorizedToken);
          } else {
            nextParams.set('category', next);
          }
          const qs = nextParams.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname);
        }}
        className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-amber-800"
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
