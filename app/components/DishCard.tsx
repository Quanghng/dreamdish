interface DishCardProps {
  image: string;
  title: string;
  index: number;
}

export default function DishCard({ image, title, index }: DishCardProps) {
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
      className="relative cursor-pointer"
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      <div 
        className="w-full aspect-square bg-white rounded-3xl shadow-2xl overflow-visible"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${yPosition}deg) translateY(${verticalOffset}px) translateX(${xPosition}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Dish image */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-6xl shadow-inner">
            {image}
          </div>
        </div>
      </div>
    </div>
  );
}
