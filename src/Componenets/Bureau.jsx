import React from 'react';

const Bureau = ({ clubName, isCultisio }) => {
  const bureauData = {
    cultisio: [
      {
        initials: "AM",
        name: "Ahmed Mansouri",
        role: "Président",
        description: "Dirige et coordonne les activités du club",
        email: "ahmed.mansouri@est-fes.ac.ma",
        icon: "👨‍💼",
        step: 1
      },
      {
        initials: "SF",
        name: "Sara Fadil",
        role: "Vice-Présidente",
        description: "Assiste le président et gère les projets",
        email: "sara.fadil@est-fes.ac.ma",
        icon: "👩‍💼",
        step: 2
      },
      {
        initials: "KE",
        name: "Karim El Amrani",
        role: "Trésorier",
        description: "Gère les finances et le budget du club",
        email: "karim.elamrani@est-fes.ac.ma",
        icon: "💰",
        step: 3
      },
      {
        initials: "LB",
        name: "Laila Bennis",
        role: "Secrétaire",
        description: "Organise les réunions et la communication",
        email: "laila.bennis@est-fes.ac.ma",
        icon: "📝",
        step: 4
      },
      {
        initials: "YH",
        name: "Youssef Haddad",
        role: "Responsable Communication",
        description: "Gère les réseaux sociaux et la visibilité",
        email: "youssef.haddad@est-fes.ac.ma",
        icon: "📢",
        step: 5
      },
      {
        initials: "NZ",
        name: "Nadia Zahraoui",
        role: "Responsable Événements",
        description: "Planifie et coordonne tous les événements",
        email: "nadia.zahraoui@est-fes.ac.ma",
        icon: "🎯",
        step: 6
      }
    ],
    rotaract: [
      { initials: "MK", name: "Mohamed Kamal", role: "Président", description: "Dirige le club Rotaract", email: "mohamed.kamal@est-fes.ac.ma", icon: "👨‍💼", step: 1 },
      { initials: "HB", name: "Hiba Benhaddou", role: "Vice-Présidente", description: "Assiste dans la gestion du club", email: "hiba.benhaddou@est-fes.ac.ma", icon: "👩‍💼", step: 2 },
      { initials: "OT", name: "Omar Tazi", role: "Trésorier", description: "Gère les finances du club", email: "omar.tazi@est-fes.ac.ma", icon: "💰", step: 3 }
    ],
    nexus: [
      { initials: "IK", name: "Imane Kettani", role: "Présidente", description: "Dirige les activités du NEXUS Club", email: "imane.kettani@est-fes.ac.ma", icon: "👨‍💼", step: 1 },
      { initials: "RB", name: "Rachid Benali", role: "Vice-Président", description: "Coordonne les projets sociaux", email: "rachid.benali@est-fes.ac.ma", icon: "👩‍💼", step: 2 }
    ],
    empowered: [
      { initials: "SL", name: "Salma Lazrak", role: "Présidente", description: "Dirige le club Empowered", email: "salma.lazrak@est-fes.ac.ma", icon: "👨‍💼", step: 1 },
      { initials: "AA", name: "Amine Alami", role: "Vice-Président", description: "Gère les projets culturels", email: "amine.alami@est-fes.ac.ma", icon: "👩‍💼", step: 2 }
    ],
    estfnews: [
      { initials: "ZM", name: "Zineb Merzouki", role: "Rédactrice en Chef", description: "Dirige l'équipe éditoriale", email: "zineb.merzouki@est-fes.ac.ma", icon: "📰", step: 1 },
      { initials: "KS", name: "Karim Salhi", role: "Responsable Multimédia", description: "Gère le contenu audiovisuel", email: "karim.salhi@est-fes.ac.ma", icon: "🎬", step: 2 }
    ],
    tgd: [
      { initials: "YE", name: "Yassine El Idrissi", role: "Président", description: "Dirige les projets technologiques", email: "yassine.elidrissi@est-fes.ac.ma", icon: "💻", step: 1 },
      { initials: "LM", name: "Loubna Mansouri", role: "Vice-Présidente", description: "Coordonne l'innovation", email: "loubna.mansouri@est-fes.ac.ma", icon: "🚀", step: 2 }
    ]
  };

  const membres = bureauData[clubName] || [];

  if (membres.length === 0) {
    return (
      <div className="backdrop-blur-sm border rounded-xl p-8 text-center bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-700/30">
        <p className="text-gray-300">Informations du bureau à venir...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Container avec ligne courbe SVG */}
      <div className="relative">
        {/* Ligne courbe SVG en arrière-plan */}
        <svg 
          className="absolute left-0 top-0 w-full h-full pointer-events-none hidden lg:block" 
          style={{ zIndex: 0 }}
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.4 }} />
              <stop offset="50%" style={{ stopColor: '#14b8a6', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          
          {/* Ligne principale courbe reliant tous les membres */}
          <path
            d={`M 150 ${100} 
                Q 350 ${150}, 550 ${100}
                Q 750 ${50}, 950 ${100}
                Q 1050 ${150}, 1150 ${200}
                Q 950 ${250}, 750 ${300}
                Q 550 ${350}, 350 ${400}
                Q 150 ${450}, 150 ${500}`}
            stroke="url(#lineGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,8"
          />
          
          {/* Points de connexion */}
          {membres.map((_, index) => {
            const positions = [
              { x: 150, y: 100 },
              { x: 550, y: 100 },
              { x: 950, y: 100 },
              { x: 750, y: 300 },
              { x: 350, y: 400 },
              { x: 150, y: 500 }
            ];
            const pos = positions[index] || { x: 150, y: 100 };
            return (
              <circle
                key={index}
                cx={pos.x}
                cy={pos.y}
                r="6"
                fill="#10b981"
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Grille des membres */}
        <div className="relative space-y-8" style={{ zIndex: 1 }}>
          {membres.map((membre, index) => (
            <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="hidden lg:block w-1/12"></div>
              
              <div className="flex-1 max-w-md relative group">
                {/* Ligne de connexion vers la carte */}
                <div className={`absolute ${index % 2 === 0 ? '-left-16' : '-right-16'} top-1/2 hidden lg:block`}>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-lg animate-pulse"></div>
                </div>

                <div className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 hover:from-emerald-800/70 hover:to-teal-800/70 border border-emerald-700/40 hover:border-emerald-500/60 shadow-lg hover:shadow-2xl">
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-600 text-white shadow-lg">
                    {membre.step}
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                        {membre.initials}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-emerald-500 shadow-lg">
                        {membre.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-1 text-white">{membre.name}</h4>
                      <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 bg-emerald-700/80 text-emerald-100">
                        {membre.role}
                      </div>
                      <p className="text-sm mb-4 text-gray-300">{membre.description}</p>
                      <a href={`mailto:${membre.email}`} className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-emerald-400 hover:text-emerald-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contacter
                      </a>
                    </div>
                  </div>
                  
                  {/* Particules vertes décoratives */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="text-emerald-400">
                      <circle cx="80" cy="20" r="3" fill="currentColor" />
                      <circle cx="90" cy="40" r="2" fill="currentColor" />
                      <circle cx="70" cy="50" r="2.5" fill="currentColor" />
                      <circle cx="85" cy="65" r="2" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block w-5/12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-emerald-900/20 to-slate-900/95 border border-emerald-500/30 shadow-2xl backdrop-blur-sm">
        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Effet de lumière */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-10 md:p-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Contenu textuel */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Opportunité
              </div>
              <h4 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Envie de rejoindre notre équipe ?
              </h4>
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
                Nous recherchons toujours des étudiants motivés et passionnés pour enrichir notre équipe et contribuer à nos projets innovants
              </p>
              
              {/* Stats ou badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-6 lg:mb-0">
                <div className="flex items-center gap-3 text-base text-gray-300">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Équipe dynamique</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-300">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Projets innovants</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-300">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Développement personnel</span>
                </div>
              </div>
            </div>
            
            {/* Bouton CTA */}
            <div className="flex-shrink-0">
              <button className="group relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105">
                <span className="relative z-10 flex items-center gap-3">
                  Postuler maintenant
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
              </button>
              <p className="text-sm text-gray-400 text-center mt-4">Processus simple et rapide</p>
            </div>
          </div>
        </div>
        
        {/* Ligne décorative en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"></div>
      </div>
    </div>
  );
};

export default Bureau;