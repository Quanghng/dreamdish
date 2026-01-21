export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-amber-100 py-12 px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-start">
        {/* Left Section - Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xl">
            🍽️
          </div>
          <span className="text-xl font-bold text-amber-900">Dreamdish</span>
        </div>

        {/* Right Section - Links */}
        <div className="flex flex-col items-end gap-3">
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors uppercase font-semibold">
            Service
          </a>
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors">
            FAQ
          </a>
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors">
            Contact
          </a>
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors">
            À propos de nous
          </a>
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors">
            Mentions Légales
          </a>
          <a href="#" className="text-amber-900 hover:text-amber-600 transition-colors">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
}
