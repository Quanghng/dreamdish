interface IngredientCardProps {
  name: string;
  color: string;
  icon?: string;
  onSelect?: () => void;
}

export default function IngredientCard({ name, color, icon, onSelect }: IngredientCardProps) {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && onSelect) onSelect(); }}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden aspect-square">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div 
            className="w-full aspect-square rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}80)`
            }}
          >
            {icon ? (
              <span className="text-5xl">{icon}</span>
            ) : (
              <div className="w-16 h-16 rounded-full" style={{ backgroundColor: color }} />
            )}
          </div>
        </div>
      </div>
      <p className="text-center mt-3 text-amber-900 font-medium text-sm">{name}</p>
    </div>
  );
}
