'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavbarProps {
  onUserClick?: () => void;
  userAvatar?: string;
  isAuthenticated?: boolean;
}

export default function Navbar({ onUserClick, userAvatar, isAuthenticated }: NavbarProps) {
  return (
    <motion.nav 
      className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="glass rounded-2xl shadow-xl px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 border border-white/30">
        {/* Logo et Titre à gauche */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="Retour à l'accueil">
          <motion.div 
            className="text-3xl sm:text-4xl"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            🍽️
          </motion.div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight gradient-text">
            Dreamdish
          </span>
        </Link>

        {/* Catégories au milieu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/communaute"
            className="px-4 sm:px-6 py-2 rounded-xl hover:bg-[#e85d04]/10 transition-all duration-300 text-[#1a1a2e] font-semibold text-sm sm:text-base hover:text-[#e85d04]"
          >
            Communauté
          </Link>

          <Link
            href="/stats"
            className="px-4 sm:px-6 py-2 rounded-xl hover:bg-[#e85d04]/10 transition-all duration-300 text-[#1a1a2e] font-semibold text-sm sm:text-base hover:text-[#e85d04]"
          >
            Stats
          </Link>

          {isAuthenticated ? (
            <Link
              href="/mes-creations"
              className="px-4 sm:px-6 py-2 rounded-xl hover:bg-[#e85d04]/10 transition-all duration-300 text-[#1a1a2e] font-semibold text-sm sm:text-base hover:text-[#e85d04]"
            >
              Mes créations
            </Link>
          ) : null}
        </div>

        {/* Flag et Profile à droite */}
        <div className="flex items-center gap-3">
          {/* Flag Icon */}
          <motion.button 
            className="w-10 h-10 rounded-xl hover:bg-[#e85d04]/10 transition-colors flex items-center justify-center text-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            🇫🇷
          </motion.button>
          
          {/* Profile Icon */}
          <motion.button
            onClick={onUserClick}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e85d04] to-[#ffb703] hover:from-[#d45003] hover:to-[#e5a503] transition-all flex items-center justify-center text-white shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {userAvatar ? (
              userAvatar.startsWith('blob:') || userAvatar.startsWith('data:') ? (
                <img src={userAvatar} alt="Avatar" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <span className="text-lg">{userAvatar}</span>
              )
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
