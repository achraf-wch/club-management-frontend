import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClubCard = ({ id, name, image, logo, category, description, memberCount, foundingYear }) => {
  const navigate = useNavigate();
  const [realMemberCount, setRealMemberCount] = useState(memberCount || 0);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!id) return;
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${id}/members`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data ?? []);
          setRealMemberCount(list.length);
        }
      } catch (err) { console.error(err); }
    };
    fetchMembers();
  }, [id, API_BASE_URL]);

  const defaultCover = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop';
  const defaultLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef4444&color=fff`;

  return (
    <div 
      onClick={() => navigate(`/clubs/${id}`)}
      className="group relative h-[420px] w-full perspective-1000 cursor-pointer"
    >
      {/* Main Container */}
      <div className="relative h-full w-full rounded-2xl overflow-hidden bg-[#0f172a] border border-white/10 transition-all duration-500 group-hover:border-red-500/50 group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)]">
        
        {/* Cover Image Area */}
        <div className="relative h-1/2 w-full overflow-hidden">
          <img
            src={image || defaultCover}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-110"
            onError={(e) => { e.target.src = defaultCover; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {category && (
              <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Logo - Positioned to overlap cover and info */}
        <div className="absolute top-[40%] left-6 z-20">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-2xl transform transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={logo || defaultLogo}
                alt="logo"
                className="w-full h-full object-contain p-1" // object-contain ensures the whole logo shows
                onError={(e) => { e.target.src = defaultLogo; }}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 pt-12 flex flex-col h-1/2 justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
              <span className="flex items-center gap-1 text-green-500 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {foundingYear || '2024'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {realMemberCount}
              </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
              {description || "Découvrez les activités et l'univers passionnant de notre club."}
            </p>
          </div>

          {/* Action Area - Slides up on hover */}
          <div className="relative overflow-hidden h-10">
            <div className="absolute inset-0 flex items-center transition-transform duration-500 group-hover:-translate-y-full">
               <span className="text-red-500 font-bold text-sm tracking-widest uppercase">Voir le profil →</span>
            </div>
            <div className="absolute inset-0 flex items-center translate-y-full transition-transform duration-500 group-hover:translate-y-0">
               <button className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30">
                 REJOINDRE LE CLUB
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
    </div>
  );
};

export default ClubCard;