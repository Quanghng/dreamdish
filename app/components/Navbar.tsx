import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  onUserClick?: () => void;
  userAvatar?: string;
}

export default function Navbar({ onUserClick, userAvatar }: NavbarProps) {
  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl">
      <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Logo et Titre à gauche */}
        <Link href="/" className="flex items-center gap-3" aria-label="Retour à l'accueil">
          <div className="text-3xl sm:text-4xl">🍽️</div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Dreamdish
          </span>
        </Link>

        {/* Catégories au milieu */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/communaute"
            className="px-4 sm:px-6 py-2 rounded-full hover:bg-amber-100 transition-colors text-amber-900 font-semibold text-sm sm:text-base"
          >
            Communauté
          </Link>
        </div>

        {/* Flag et Profile à droite */}
        <div className="flex items-center gap-4">
          {/* Flag Icon */}
          <button className="w-10 h-10 rounded-full hover:bg-amber-100 transition-colors flex items-center justify-center text-xl">
            🇫🇷
          </button>
          
          {/* Profile Icon */}
          <button
            onClick={onUserClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-colors flex items-center justify-center text-white shadow-md"
          >
            {userAvatar ? (
              userAvatar.startsWith('blob:') || userAvatar.startsWith('data:') ? (
                <img src={userAvatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
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
          </button>
        </div>
      </div>
    </nav>
  );
}
