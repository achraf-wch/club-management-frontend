import React from 'react';

const AboutPlatform = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Gestion des Clubs",
      description: "Une plateforme complète pour gérer les membres, événements et activités de votre club en toute simplicité."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Événements Simplifiés",
      description: "Créez, gérez et suivez vos événements avec un système de billetterie et de scan QR intégré."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Intégration Facile",
      description: "Les étudiants peuvent rejoindre les clubs en quelques clics et suivre toutes les activités en temps réel."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Notifications Instantanées",
      description: "Restez informés des dernières actualités, événements et opportunités de votre club préféré."
    }
  ];

  return (
  <section className="py-20 px-8 relative overflow-hidden" style={{backgroundColor: '#06163A'}}>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Titre centré en haut */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-cyan-500 text-sm font-semibold uppercase tracking-wider animate-slide-in-left">
              Notre Plateforme
            </span>
          </div>
          <h2 className="text-white text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            QUE FAISONS-NOUS<span className="text-cyan-500 animate-glow">?</span>
          </h2>
          <div className="w-24 h-1 bg-cyan-500 mx-auto animate-expand"></div>
        </div>

        {/* Layout: Texte + Icons flottants à gauche, cartes à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Colonne gauche : Texte + Icônes flottantes */}
          <div className="space-y-6 animate-slide-in-left">
            <div className="space-y-6">
              <p className="text-gray-400 text-base leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
                CluVersity est une plateforme moderne conçue pour faciliter la gestion des clubs universitaires
                et simplifier l'expérience des étudiants qui souhaitent s'engager dans la vie associative de l'EST Fès.
              </p>
              <p className="text-gray-400 text-base leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
                Notre mission est de créer un pont entre les clubs et les étudiants, en offrant des outils
                puissants et intuitifs pour enrichir la vie universitaire.
              </p>
            </div>

            {/* Icônes flottantes */}
            <div className="relative mt-8 h-64 animate-zoom-in" style={{ animationDelay: '0.7s' }}>
              {/* Main icon - Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float-bounce z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl shadow-2xl shadow-pink-500/30 flex items-center justify-center transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-500">
                  <svg className="w-16 h-16 text-white animate-pulse-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                  </svg>
                </div>
              </div>

              {/* Icon top-left */}
              <div className="absolute top-8 left-8 animate-float-delayed-smooth opacity-80 hover:opacity-100 transition-opacity duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"/>
                  </svg>
                </div>
              </div>

              {/* Icon bottom-right */}
              <div className="absolute bottom-8 right-8 animate-float-rotate opacity-80 hover:opacity-100 transition-opacity duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-lg shadow-md flex items-center justify-center animate-spin-slow">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Small particles */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping-glow"></div>
              <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-pink-400 rounded-full animate-ping-glow" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping-glow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* 4 cartes à droite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-lg flex items-center justify-center mb-3 text-cyan-500 group-hover:text-cyan-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-cyan-500 text-lg font-bold mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 dark:text-white/60 text-xs leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(12deg); }
          50% { transform: translate(-50%, -50%) translateY(-25px) rotate(12deg); }
        }
        @keyframes float-delayed-smooth {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-18px) translateX(-5px); }
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.05); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes expand {
          from { width: 0; }
          to { width: 6rem; }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
          50% { text-shadow: 0 0 40px rgba(6, 182, 212, 0.7); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ping-glow {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-float-bounce { animation: float-bounce 4s ease-in-out infinite; }
        .animate-float-delayed-smooth { animation: float-delayed-smooth 5s ease-in-out infinite; }
        .animate-float-rotate { animation: float-rotate 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; opacity: 0; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-expand { animation: expand 1s ease-out forwards; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-zoom-in { animation: zoom-in 0.8s ease-out forwards; opacity: 0; }
        .animate-ping-glow { animation: ping-glow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-icon { animation: pulse-icon 3s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default AboutPlatform;