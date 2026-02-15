import React, { useState, useEffect } from 'react';

const WhyChooseUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('why-choose-us');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Gestion d'Événements",
      description: "Organisez et gérez vos événements facilement. Planifiez, publiez et suivez tous vos événements en un seul endroit."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: "Billets QR Code",
      description: "Générez des billets avec QR code pour vos événements. Contrôlez l'accès et scannez les participants en temps réel."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Découverte de Clubs",
      description: "Explorez tous les clubs de l'EST Fès. Découvrez leurs activités, événements et rejoignez la communauté qui vous correspond."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Statistiques en Temps Réel",
      description: "Suivez les inscriptions, la participation et l'engagement de votre communauté avec des tableaux de bord détaillés."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Notifications Instantanées",
      description: "Restez informé de tous les événements et actualités de vos clubs favoris avec des notifications en temps réel."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Plateforme Sécurisée",
      description: "Vos données et celles de vos membres sont protégées. Système d'authentification sécurisé et gestion des accès."
    }
  ];

  return (
    <section 
      id="why-choose-us"
      className="py-24 px-8 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-700 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-transparent to-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div className="w-12 h-1 rounded-full bg-gradient-to-l from-transparent to-red-500"></div>
            </div>
          </div>

          <h2 className={`text-white text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Pourquoi CluVersity?
          </h2>
          
          <p className={`text-gray-400 text-lg mx-auto max-w-2xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            La plateforme complète pour gérer vos clubs et événements à l'EST Fès
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Card Container */}
              <div className="relative h-full p-8 rounded-2xl backdrop-blur-sm border border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 overflow-hidden">
                
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/5 transition-all duration-500"></div>

                {/* Animated Border on Hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500" style={{
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }}></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative inline-block mb-6">
                    {/* Outer Ring Animation */}
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-0 group-hover:opacity-100"></div>
                    
                    {/* Icon Circle */}
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-red-500/50">
                      <div className="relative z-10">
                        {feature.icon}
                      </div>
                      
                      {/* Inner Glow */}
                      <div className="absolute inset-2 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-500"></div>
                    </div>

                    {/* Decorative Dots */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-red-400 animate-bounce opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-red-500 animate-bounce opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-white text-xl font-bold mb-4 group-hover:text-red-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Number Badge */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-red-500/20 text-red-500/30 group-hover:border-red-500/40 group-hover:text-red-500/50 transition-all duration-300">
                    {index + 1}
                  </div>
                </div>

                {/* Bottom Decorative Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-red-500 group-hover:w-full transition-all duration-700"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "50+", label: "Clubs Actifs" },
            { number: "1000+", label: "Étudiants" },
            { number: "100+", label: "Événements/An" },
            { number: "24/7", label: "Support" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`relative text-center p-6 rounded-2xl backdrop-blur-sm border border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/50 hover:scale-105 transition-all duration-500 group overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/20 group-hover:to-red-600/10 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/0 group-hover:border-red-500/50 rounded-tr-2xl transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/0 group-hover:border-red-500/50 rounded-bl-2xl transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;