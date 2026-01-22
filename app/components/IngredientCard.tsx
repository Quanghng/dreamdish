'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface IngredientCardProps {
  name: string;
  color: string;
  icon?: string;
  onSelect?: () => void;
  isSelected?: boolean;
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

export default function IngredientCard({ name, color, icon, onSelect, isSelected }: IngredientCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageFilename = getImageFilename(name);
  const imagePath = `/img/ingredients/${imageFilename}.webp`;

  return (
    <motion.div
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && onSelect) onSelect(); }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div 
        className={`
          relative overflow-hidden aspect-square rounded-3xl
          bg-white/70 backdrop-blur-md
          border-2 transition-all duration-300
          ${isSelected 
            ? 'border-[#e85d04] shadow-[0_0_30px_rgba(232,93,4,0.4)] glow-selected' 
            : 'border-white/50 shadow-lg hover:shadow-2xl hover:border-[#ffb703]/50'
          }
        `}
      >
        {/* Gradient overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#e85d04]/10 via-transparent to-[#ffb703]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            className="w-full aspect-square rounded-full flex items-center justify-center overflow-hidden relative"
            style={{
              background: `linear-gradient(145deg, ${color}30, ${color}60)`,
              boxShadow: `inset 0 2px 20px ${color}20, 0 4px 15px ${color}30`
            }}
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {!imageError ? (
              <img 
                src={imagePath} 
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              icon && <span className="text-5xl sm:text-6xl flex items-center justify-center drop-shadow-lg">{icon}</span>
            )}
          </motion.div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div 
            className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#e85d04] to-[#ffb703] rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {/* Add button indicator on hover */}
        <motion.div 
          className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-br from-[#e85d04] to-[#ffb703] rounded-full flex items-center justify-center shadow-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isHovered && !isSelected ? 1 : 0, 
            opacity: isHovered && !isSelected ? 1 : 0 
          }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
      </div>
      
      <motion.p 
        className="text-center mt-3 font-semibold text-sm sm:text-base"
        style={{ color: '#1a1a2e' }}
        animate={{ 
          color: isHovered ? '#e85d04' : '#1a1a2e'
        }}
        transition={{ duration: 0.2 }}
      >
        {name}
      </motion.p>
    </motion.div>
  );
}
