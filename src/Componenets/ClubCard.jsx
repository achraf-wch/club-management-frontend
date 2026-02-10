import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClubCard = ({ id, name, image, logo, category, description, memberCount, foundingYear }) => {
  const navigate = useNavigate();

  // Default placeholder images
  const defaultCover = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop';
  const defaultLogo = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&size=128&background=random';

  return (
    <div
      onClick={() => navigate(`/clubs/${id}`)}
      className="group relative cursor-pointer h-full"
    >
      {/* Card Container - Netflix Style avec animations professionnelles */}
      <div className="relative h-full bg-zinc-900 rounded overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-black/50">
        
        {/* Image de couverture - Format Rectangle - FIXED: object-contain pour afficher l'image complète */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-75"
              onError={(e) => {
                console.log('❌ Failed to load cover image:', image);
                e.target.src = defaultCover;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <div className="text-zinc-600 text-6xl font-bold transition-all duration-500 group-hover:scale-110 group-hover:text-zinc-500">
                {name.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Gradient overlay Netflix avec animation */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 group-hover:from-black/90"></div>
          
          {/* Badge TOP 10 pour clubs populaires - Animation d'entrée */}
          {memberCount > 100 && (
            <div className="absolute top-4 right-4 transform transition-all duration-500 translate-x-0 group-hover:translate-x-0 group-hover:scale-110">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-red-600/50 transition-all duration-300 group-hover:border-red-600">
                <svg className="w-4 h-4 text-red-600 transition-transform duration-500 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <span className="text-white text-xs font-semibold">TOP 10</span>
              </div>
            </div>
          )}

          {/* Logo Overlay - NEW FEATURE */}
          {logo && (
            <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-zinc-900 shadow-lg overflow-hidden bg-white z-10">
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('❌ Failed to load logo:', logo);
                  e.target.src = defaultLogo;
                }}
              />
            </div>
          )}

          {/* Indicateur de hover - Barre lumineuse en haut */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
        </div>

        {/* Info Section - Toujours visible avec animations au hover */}
        <div className="relative bg-zinc-900 p-4 transition-all duration-500 ease-out group-hover:bg-zinc-800">
          {/* Titre et catégorie - Animation stagger */}
          <div className="mb-3 overflow-hidden">
            <h3 className="text-white text-lg font-semibold mb-2 tracking-wide transition-all duration-300 group-hover:text-red-500 transform group-hover:translate-x-1 uppercase">
              {name}
            </h3>
            {category && (
              <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wide transition-all duration-300 group-hover:bg-red-500 group-hover:px-3 group-hover:shadow-lg group-hover:shadow-red-600/50">
                {category}
              </span>
            )}
          </div>

          {/* Description - Slide up animation */}
          {description && (
            <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-20">
              <p className="text-gray-400 text-sm mb-3 line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                {description}
              </p>
            </div>
          )}

          {/* Metadata - Fade in avec delay */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
            {foundingYear && (
              <span className="text-green-500 font-semibold transition-all duration-300 hover:text-green-400 hover:scale-110 inline-block">
                {foundingYear}
              </span>
            )}
            <span className="flex items-center gap-1 transition-all duration-300 hover:text-gray-400">
              <svg className="w-3 h-3 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              {memberCount || 0} membres
            </span>
          </div>

          {/* Bouton Découvrir - Scale et slide animation */}
          <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-20">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-red-600 text-black hover:text-white font-semibold rounded transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
              </svg>
              <span className="text-sm font-bold">Découvrir</span>
            </button>
          </div>

          {/* Barre de progression en bas - Animation left to right */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
        </div>
      </div>

      {/* Shadow effect avec blur - Animation douce */}
      <div className="absolute inset-0 -z-10 bg-red-950/20 rounded opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl transform scale-95 group-hover:scale-100"></div>

      {/* Particules décoratives - Animation float */}
      <div className="absolute -z-20 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-red-600 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ClubCard;