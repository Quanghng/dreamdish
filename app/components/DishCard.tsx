'use client';
import { motion } from 'framer-motion';

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
  const col = index % 5;
  const centerCol = 2;
  const distanceFromCenter = Math.abs(col - centerCol);
  const rotateY = distanceFromCenter * 12;
  const yPosition = col < centerCol ? rotateY : -rotateY;
  const verticalOffset = -distanceFromCenter * distanceFromCenter * 15;
  const horizontalOffset = distanceFromCenter * distanceFromCenter * 6;
  const xPosition = col < centerCol ? -horizontalOffset : horizontalOffset;
  
  return (
    <motion.div 
      className={isShowcase ? 'relative cursor-pointer' : 'relative'}
      style={{
        transformStyle: 'preserve-3d',
        padding: isShowcase ? '8px' : '0'
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.08,
        zIndex: 10,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div 
        className="w-full aspect-square rounded-3xl overflow-hidden
          bg-white/80 backdrop-blur-sm
          ring-1 ring-white/50 shadow-xl
          hover:shadow-2xl hover:ring-[#ffb703]/30 transition-shadow duration-300"
        style={{
          transformStyle: 'preserve-3d',
          transform: isShowcase
            ? `rotateY(${yPosition}deg) translateY(${verticalOffset}px) translateX(${xPosition}px)`
            : undefined,
          transformOrigin: 'center center',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-contain object-center"
            loading="lazy"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#fefae0] to-[#ffedd5] flex items-center justify-center text-6xl">
            {image}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
