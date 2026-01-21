interface IngredientTagProps {
  icon: string;
  label: string;
  onRemove?: () => void;
}

export default function IngredientTag({ icon, label, onRemove }: IngredientTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-amber-200 hover:shadow-lg transition-shadow">
      <span className="text-2xl">{icon}</span>
      <span className="text-amber-900 font-medium">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 w-5 h-5 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
