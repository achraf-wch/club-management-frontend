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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Clubs Vérifiés",
      description: "Tous nos clubs sont officiellement reconnus par l'EST Fès et offrent des activités de qualité",
      gradient: "linear-gradient(135deg, #e00808 0%, #023859 100%)"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Inscription Facile",
      description: "Rejoignez les clubs qui vous intéressent en quelques clics et participez à leurs événements",
      gradient: "linear-gradient(135deg, #e00808 0%, #26658C 100%)"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Communauté Active",
      description: "Découvrez et rejoignez une communauté étudiante passionnée et engagée dans divers domaines",
      gradient: "linear-gradient(135deg, #e00808 0%, #54ACBF 100%)"
    }
  ];

  return (
    <section 
      id="why-choose-us"
      className="py-24 px-8 relative overflow-hidden bg-[#f0f4f8] dark:bg-[#0f1e3d]"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{ backgroundColor: '#54ACBF' }}></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-float-delayed" style={{ backgroundColor: '#26658C' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: '#A7EBF2' }}></div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#54ACBF] to-transparent opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#54ACBF] to-transparent opacity-20"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #54ACBF)' }}></div>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#54ACBF' }}></div>
              <div className="w-12 h-1 rounded-full" style={{ background: 'linear-gradient(to left, transparent, #54ACBF)' }}></div>
            </div>
          </div>

          <h2 className={`text-[#0a1929] dark:text-white text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Pourquoi Nous Choisir
          </h2>
          
          <p className={`text-lg mx-auto max-w-2xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ color: '#4a7a8a' }}>
            Découvrez ce qui fait de nous le meilleur choix pour votre parcours étudiant
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Card Container */}
              <div className="relative h-full p-8 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a1628] hover:bg-gray-50 dark:hover:bg-[#112240] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                
                {/* Hover Gradient Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: feature.gradient }}
                ></div>

                {/* Animated Border on Hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: `linear-gradient(135deg, #54ACBF 0%, #26658C 50%, #023859 100%)`,
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }}></div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon Container */}
                  <div className="relative inline-block mb-6">
                    {/* Outer Ring Animation */}
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#54ACBF' }}></div>
                    
                    {/* Icon Circle */}
                    <div 
                      className="relative flex items-center justify-center w-24 h-24 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl" 
                      style={{ background: feature.gradient, color: 'white' }}
                    >
                      <div className="relative z-10">
                        {feature.icon}
                      </div>
                      
                      {/* Inner Glow */}
                      <div className="absolute inset-2 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-500"></div>
                    </div>

                    {/* Decorative Dots */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: '#A7EBF2' }}></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#54ACBF', animationDelay: '0.3s' }}></div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[#0a1929] dark:text-white text-xl font-bold mb-4 group-hover:text-[#26658C] dark:group-hover:text-[#54ACBF] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-5 dark:text-white/60" style={{ color: '#4a7a8a' }}>
                    {feature.description}
                  </p>
                  
                  {/* Accent Line for First Card */}
                  {index === 0 && (
                    <div className="relative h-1 w-24 mx-auto mt-6 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(84, 172, 191, 0.2)' }}>
                      <div className="absolute inset-0 w-1/2 rounded-full animate-slide" style={{ backgroundColor: '#54ACBF' }}></div>
                    </div>
                  )}

                  {/* Number Badge */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300" style={{ borderColor: '#54ACBF', color: '#54ACBF' }}>
                    {index + 1}
                  </div>
                </div>

                {/* Bottom Decorative Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-700" style={{ backgroundColor: '#54ACBF' }}></div>
              </div>

              {/* Floating Particles */}
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-0 w-2 h-2 rounded-full animate-float" style={{ backgroundColor: '#A7EBF2' }}></div>
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full animate-float-delayed" style={{ backgroundColor: '#54ACBF' }}></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full animate-float" style={{ backgroundColor: '#26658C', animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full animate-float-delayed" style={{ backgroundColor: '#A7EBF2', animationDelay: '0.7s' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { number: "24/7", label: "Support" },
            { number: "100%", label: "Fiabilité" },
            { number: "50+", label: "Clubs" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`relative text-center p-4 rounded-full w-28 h-28 mx-auto flex flex-col items-center justify-center backdrop-blur-sm border-2 hover:scale-105 transition-all duration-500 group overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ 
                transitionDelay: `${800 + index * 100}ms`,
                backgroundColor: '#011C40',
                borderColor: '#26658C'
              }}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: '#54ACBF' }}></div>
              
              {/* Inner Circle */}
              <div className="absolute inset-2 rounded-full border opacity-30" style={{ borderColor: '#26658C' }}></div>
              
              <div className="relative z-10">
                <div className="text-xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300" style={{ color: '#54ACBF' }}>
                  {stat.number}
                </div>
                <div className="text-xs font-medium" style={{ color: '#4a7a8a' }}>
                  {stat.label}
                </div>
              </div>

              {/* Rotating Ring */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-dashed opacity-30 animate-spin-continuous" 
                style={{ borderColor: '#54ACBF', animationDuration: '8s' }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin-continuous {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-slide { animation: slide 2s ease-in-out infinite; }
        .animate-spin-continuous { animation: spin-continuous 8s linear infinite; }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;