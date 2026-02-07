import React from 'react';
import CluVer from "../imgs/CluVer2.png";

const Footer = () => {
  return (
    <footer className="relative text-gray-300 overflow-hidden" style={{ backgroundColor: '#0a1929' }}>
      {/* Effet décoratif d'arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section principale */}
        <div className="px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Colonne 1 - Logo et description */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src={CluVer}
                alt="CluVersity Logo" 
                className="w-50 h-50 object-contain"
              />
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Navigation
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-red-400 transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/clubs" className="text-gray-400 hover:text-red-400 transition-colors">
                  Nos Clubs
                </a>
              </li>
              <li>
                <a href="/evenements" className="text-gray-400 hover:text-red-400 transition-colors">
                  Événements
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-red-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Liens rapides */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Clubs Populaires
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/clubs" className="text-gray-400 hover:text-red-400 transition-colors">
                  Cultisio Club
                </a>
              </li>
              <li>
                <a href="/clubs" className="text-gray-400 hover:text-red-400 transition-colors">
                  Rotaract EST Fès
                </a>
              </li>
              <li>
                <a href="/clubs" className="text-gray-400 hover:text-red-400 transition-colors">
                  NEXUS Club
                </a>
              </li>
              <li>
                <a href="/clubs" className="text-gray-400 hover:text-red-400 transition-colors">
                  ESTF News
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 relative inline-block">
              Contact
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-red-500"></div>
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>EST Fès, Route d'Imouzzer, Fès, Maroc</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@cluversity.ma</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lun - Sam: 7h - 17h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation avec effet dégradé */}
        <div className="px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        </div>

        {/* Section copyright */}
        <div className="px-8 py-6 flex flex-col items-center gap-4 text-sm">
          {/* Réseaux sociaux en haut */}
          <div className="flex gap-3">
            <a 
              href="https://facebook.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-[#1877F2] hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-[#E1306C] hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#FD1D1D] flex items-center justify-center transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-[#1DA1F2] hover:bg-[#1DA1F2] flex items-center justify-center transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
          
          {/* Copyright en bas */}
          <p className="text-gray-500">
            © 2025 <span className="text-red-400 font-semibold">CluVersity</span> - EST Fès. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;