interface IngredientCardProps {
  name: string;
  color: string;
  icon?: string;
  onSelect?: () => void;
}

// Function to get image filename from ingredient name
function getImageFilename(name: string): string {
  return name
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/[àáâãäåÀÁÂÃÄÅ]/g, 'a')
    .replace(/[èéêëÈÉÊË]/g, 'e')
    .replace(/[ìíîïÌÍÎÏ]/g, 'i')
    .replace(/[òóôõöÒÓÔÕÖ]/g, 'o')
    .replace(/[ùúûüÙÚÛÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[œŒ]/g, 'oe')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

export default function IngredientCard({ name, color, icon, onSelect }: IngredientCardProps) {
  const imageFilename = getImageFilename(name);
  const imagePath = `/img/ingredients/${imageFilename}.webp`;

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
            className="w-full aspect-square rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}80)`
            }}
          >
            <img 
              src={imagePath} 
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {icon && (
              <span className="text-5xl hidden">{icon}</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-center mt-3 text-amber-900 font-medium text-sm">{name}</p>
    </div>
  );
}
