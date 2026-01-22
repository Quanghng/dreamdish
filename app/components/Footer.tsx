'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full glass border-t border-white/20 py-12 px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        {/* Left Section - Branding */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e85d04] to-[#ffb703] flex items-center justify-center text-2xl shadow-lg">
            🍽️
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold gradient-text">Dreamdish</span>
            <span className="text-xs text-[#1a1a2e]/50">Propulsé par l&apos;IA ✨</span>
          </div>
        </motion.div>

        {/* Center Section - Quick Links */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/communaute" className="text-[#1a1a2e]/70 hover:text-[#e85d04] transition-colors font-medium">
            Communauté
          </Link>
          <Link href="/stats" className="text-[#1a1a2e]/70 hover:text-[#e85d04] transition-colors font-medium">
            Stats
          </Link>
          <a href="#" className="text-[#1a1a2e]/70 hover:text-[#e85d04] transition-colors font-medium">
            FAQ
          </a>
          <a href="#" className="text-[#1a1a2e]/70 hover:text-[#e85d04] transition-colors font-medium">
            Contact
          </a>
        </motion.div>

        {/* Right Section - Legal */}
        <motion.div 
          className="flex flex-col items-center md:items-end gap-2 text-sm"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a href="#" className="text-[#1a1a2e]/50 hover:text-[#e85d04] transition-colors">
            Mentions Légales
          </a>
          <a href="#" className="text-[#1a1a2e]/50 hover:text-[#e85d04] transition-colors">
            Politique de confidentialité
          </a>
          <p className="text-[#1a1a2e]/40 mt-2">
            © 2026 Dreamdish. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
