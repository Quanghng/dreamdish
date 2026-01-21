interface DishCardProps {
  image: string;
  imageUrl?: string;
  title: string;
  index: number;
  variant?: 'showcase' | 'flat';
}

export default function DishCard({ image, imageUrl, title, index, variant = 'showcase' }: DishCardProps) {
  const isShowcase = variant === 'showcase';

  // Calculate U-shape rotation: sides rotate more than center
  const col = index % 5; // Column position (0-4)
  const centerCol = 2; // Center column
  const distanceFromCenter = Math.abs(col - centerCol);
  const rotateY = distanceFromCenter * 12; // Sides rotate more
  const yPosition = col < centerCol ? rotateY : -rotateY; // Left rotates right, right rotates left
  
  // Calculate vertical offset to align top edges in U-shape
  // Sides should be higher, center lower
  const verticalOffset = -distanceFromCenter * distanceFromCenter * 15; // Negative = up
  
  // Calculate horizontal offset to spread side blocks more
  const horizontalOffset = distanceFromCenter * distanceFromCenter * 6; // More spread for outer blocks
  const xPosition = col < centerCol ? -horizontalOffset : horizontalOffset; // Left goes left, right goes right
  
  return (
    <div 
      className={isShowcase ? 'relative cursor-pointer' : 'relative'}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      <div 
        className="w-full aspect-square bg-white rounded-3xl overflow-hidden ring-1 ring-black/5"
        style={{
          transformStyle: 'preserve-3d',
          transform: isShowcase
            ? `rotateY(${yPosition}deg) translateY(${verticalOffset}px) translateX(${xPosition}px)`
            : undefined,
          transformOrigin: 'center center'
        }}
      >
        {/* Dish image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-6xl">
            {image}
          </div>
        )}
      </div>
    </div>
  );
}
