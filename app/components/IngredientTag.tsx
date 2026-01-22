'use client';
import { motion } from 'framer-motion';

interface IngredientTagProps {
  icon: string;
  label: string;
  onRemove?: () => void;
}

export default function IngredientTag({ icon, label, onRemove }: IngredientTagProps) {
  return (
    <motion.div 
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
        bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-md
        border border-[#e85d04]/20 shadow-lg
        hover:shadow-xl hover:border-[#e85d04]/40 transition-all duration-300"
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      whileHover={{ scale: 1.05 }}
      layout
    >
      <span className="text-xl drop-shadow-sm">{icon}</span>
      <span className="text-[#1a1a2e] font-semibold text-sm">{label}</span>
      {onRemove && (
        <motion.button
          onClick={onRemove}
          className="ml-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#e85d04]/10 to-[#ffb703]/10 
            hover:from-[#e85d04] hover:to-[#ffb703] 
            flex items-center justify-center text-[#e85d04] hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}
